import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
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
      const { data, error: err } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setPayments(data || []);
    } catch (e) {
      console.error('Failed to load payments:', e);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadPayments();
  }, [user, loadPayments]);

  // ── Save payment record to Supabase ───────────────────────────────
  const savePaymentRecord = async (planId, paymentResponse, type = 'subscription') => {
    if (!user) return;
    const { error: err } = await supabase
      .from('payments')
      .insert([{
        user_id: user.id,
        plan_id: planId,
        type,
        status: 'success',
        razorpay_payment_id:    paymentResponse.razorpay_payment_id,
        razorpay_order_id:      paymentResponse.razorpay_order_id      || null,
        razorpay_subscription_id: paymentResponse.razorpay_subscription_id || null,
        razorpay_signature:    paymentResponse.razorpay_signature,
        created_at:            new Date().toISOString(),
      }]);

    if (err) throw err;
  };

  // ── Update plan in Supabase after successful payment ───────────────
  const activatePlan = async (planId, paymentResponse) => {
    if (!user) return;
    const now = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from('users')
      .update({
        plan: planId,
        plan_activated_at: now,
        plan_status: 'active',
        razorpay_subscription_id: paymentResponse.razorpay_subscription_id || null,
      })
      .eq('id', user.id);

    if (updateErr) throw updateErr;

    await savePaymentRecord(planId, paymentResponse);
    await loadPayments();
  };

  // ── Initiate subscription upgrade ───────────────────────────────
  /**
   * Production flow:
   *   1. Call your backend / Supabase Edge Function to create a Razorpay Subscription
   *   2. Backend returns { subscriptionId }
   *   3. Open Razorpay checkout with subscriptionId
   *   4. On success, call backend to verify signature
   *   5. Backend verifies → updates Supabase → returns { ok: true }
   *
   * For demo/testing: we simulate the backend call with a mock subscriptionId.
   * Replace `createSubscriptionOnBackend` with your real Edge Function call.
   */
  const upgradePlan = useCallback(async (planId, { onSuccess, onFailure } = {}) => {
    if (!user || !profile) return;
    setLoading(true);
    setError(null);

    try {
      const plan = getPlanById(planId);
      if (!plan || plan.price === 0) return;

      // ── Step 1: Create subscription on backend ──────────────────
      const subscriptionId = await createSubscriptionOnBackend(planId, user.id, user.email);

      // ── Step 2: Open Razorpay checkout ──────────────────────────
      await openSubscriptionCheckout({
        subscriptionId,
        userEmail: user.email,
        userName:  profile.display_name || user.email,
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

// ─── Backend Stubs (replace with real Edge Function calls) ───────────────────

/**
 * Calls your backend to create a Razorpay Subscription.
 * Replace this with a fetch() call to your Supabase Edge Function.
 *
 * Edge Function endpoint example:
 *   POST https://your-project.supabase.co/functions/v1/createSubscription
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
 * Edge Function endpoint example:
 *   POST https://your-project.supabase.co/functions/v1/verifyPayment
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
