import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, addDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';
import {
  openSubscriptionCheckout,
  openRazorpayCheckout,
  getPlanById,
} from '../lib/razorpay';

export function useBilling() {
  const { user, profile, setProfile } = useAuth();
  const [payments, setPayments]   = useState([]);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState(null);

  const currentPlan = getPlanById(profile?.plan || 'starter');

  // ── Load payment history ─────────────────────────────────────────
  const loadPayments = useCallback(async () => {
    if (!user) return;
    try {
      const ref  = collection(db, 'users', user.uid, 'payments');
      const q    = query(ref, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Failed to load payments:', e);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadPayments();
  }, [user, loadPayments]);

  // ── Save payment record to Firestore ────────────────────────────
  const savePaymentRecord = async (planId, paymentResponse, type = 'subscription') => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'payments'), {
      planId,
      type,
      status: 'success',
      razorpayPaymentId:    paymentResponse.razorpay_payment_id,
      razorpayOrderId:      paymentResponse.razorpay_order_id      || null,
      razorpaySubscriptionId: paymentResponse.razorpay_subscription_id || null,
      razorpaySignature:    paymentResponse.razorpay_signature,
      createdAt:            new Date().toISOString(),
    });
  };

  // ── Update plan in Firestore after successful payment ────────────
  const activatePlan = async (planId, paymentResponse) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const now     = new Date().toISOString();

    await updateDoc(userRef, {
      plan:           planId,
      planActivatedAt: now,
      planStatus:     'active',
      razorpaySubscriptionId: paymentResponse.razorpay_subscription_id || null,
    });

    await savePaymentRecord(planId, paymentResponse);
    await loadPayments();
  };

  // ── Initiate subscription upgrade ───────────────────────────────
  /**
   * Production flow:
   *   1. Call your backend / Firebase Cloud Function to create a Razorpay Subscription
   *   2. Backend returns { subscriptionId }
   *   3. Open Razorpay checkout with subscriptionId
   *   4. On success, call backend to verify signature
   *   5. Backend verifies → updates Firestore → returns { ok: true }
   *
   * For demo/testing: we simulate the backend call with a mock subscriptionId.
   * Replace `createSubscriptionOnBackend` with your real Cloud Function call.
   */
  const upgradePlan = useCallback(async (planId, { onSuccess, onFailure } = {}) => {
    if (!user || !profile) return;
    setLoading(true);
    setError(null);

    try {
      const plan = getPlanById(planId);
      if (!plan || plan.price === 0) return;

      // ── Step 1: Create subscription on backend ──────────────────
      const subscriptionId = await createSubscriptionOnBackend(planId, user.uid, user.email);

      // ── Step 2: Open Razorpay checkout ──────────────────────────
      await openSubscriptionCheckout({
        subscriptionId,
        userEmail: user.email,
        userName:  profile.displayName || user.email,
        planName:  plan.name,

        onSuccess: async (response) => {
          // ── Step 3: Verify on backend + activate plan ───────────
          try {
            await verifyPaymentOnBackend(response);
            await activatePlan(planId, response);
            onSuccess?.({ plan, response });
          } catch (e) {
            setError('Payment verification failed. Contact support.');
            onFailure?.(e);
          } finally {
            setLoading(false);
          }
        },

        onFailure: (err) => {
          setError(err?.description || 'Payment failed. Please try again.');
          onFailure?.(err);
          setLoading(false);
        },
      });
    } catch (e) {
      setError(e.message);
      onFailure?.(e);
      setLoading(false);
    }
  }, [user, profile]);

  return {
    currentPlan,
    payments,
    loading,
    error,
    upgradePlan,
    loadPayments,
  };
}

// ─── Backend Stubs (replace with real Cloud Function calls) ──────────────────

/**
 * Calls your backend to create a Razorpay Subscription.
 * Replace this with a fetch() call to your Firebase Cloud Function.
 *
 * Cloud Function endpoint example:
 *   POST https://your-region-project.cloudfunctions.net/createSubscription
 *   Body: { planId, userId, email }
 *   Returns: { subscriptionId: "sub_XXXXXXXXXX" }
 */
async function createSubscriptionOnBackend(planId, userId, email) {
  const endpoint = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/createSubscription`
    : null;

  if (!endpoint) {
    // ── Demo mode: return a placeholder so UI can be tested ──────
    console.warn('[Menu DNA] VITE_BACKEND_URL not set. Using demo subscription ID.');
    return 'sub_DEMO_' + Date.now();
  }

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ planId, userId, email }),
  });
  if (!res.ok) throw new Error('Failed to create subscription on backend.');
  const data = await res.json();
  return data.subscriptionId;
}

/**
 * Calls your backend to verify Razorpay payment signature.
 * ⚠️  This MUST be done server-side. Never verify signatures on the client.
 *
 * Cloud Function endpoint example:
 *   POST https://your-region-project.cloudfunctions.net/verifyPayment
 *   Body: { razorpay_payment_id, razorpay_subscription_id, razorpay_signature }
 *   Returns: { verified: true }
 */
async function verifyPaymentOnBackend(paymentResponse) {
  const endpoint = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/verifyPayment`
    : null;

  if (!endpoint) {
    // ── Demo mode: skip verification ────────────────────────────
    console.warn('[Menu DNA] Skipping signature verification in demo mode.');
    return { verified: true };
  }

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(paymentResponse),
  });
  if (!res.ok) throw new Error('Signature verification failed.');
  return res.json();
}
