/**
 * Menu DNA — Razorpay Integration
 *
 * Flow:
 *   1. Load Razorpay JS SDK dynamically
 *   2. Call your backend (or Firebase Cloud Function) to create an order/subscription
 *   3. Open Razorpay checkout modal
 *   4. On success, verify payment signature on backend and update Firestore
 *
 * ⚠️  NEVER expose your Razorpay Key Secret on the frontend.
 *     Order creation and signature verification must happen server-side.
 *     See: /functions/index.js for the Cloud Function stubs.
 */

// ─── Load Razorpay SDK ────────────────────────────────────────────────────────

export function loadRazorpaySDK() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

// ─── Plans Config ─────────────────────────────────────────────────────────────

export const PLANS = [
  {
    id:          'starter',
    name:        'Starter',
    price:       0,
    priceLabel:  'Free',
    period:      null,
    razorpayPlanId: null,                          // No Razorpay plan for free tier
    features: [
      'Up to 30 menu items',
      'Manual CSV upload',
      'BCG matrix view',
      'Basic profitability table',
    ],
    limits: {
      menuItems:  30,
      uploads:    3,
      outlets:    1,
    },
    cta: 'Current plan',
    highlight: false,
  },
  {
    id:          'growth',
    name:        'Growth',
    price:       1999,
    priceLabel:  '₹1,999',
    period:      'per month',
    razorpayPlanId: import.meta.env.VITE_RAZORPAY_PLAN_GROWTH,  // Set in .env
    features: [
      'Up to 150 menu items',
      'Weekly auto-recommendations',
      'Intelligence scoring',
      'Category breakdown analytics',
      'Email digest',
      '1 outlet',
    ],
    limits: {
      menuItems:  150,
      uploads:    Infinity,
      outlets:    1,
    },
    cta: 'Upgrade to Growth',
    highlight: true,
  },
  {
    id:          'pro',
    name:        'Pro',
    price:       4999,
    priceLabel:  '₹4,999',
    period:      'per month',
    razorpayPlanId: import.meta.env.VITE_RAZORPAY_PLAN_PRO,     // Set in .env
    features: [
      'Unlimited menu items',
      'Multi-outlet support (up to 5)',
      'POS API auto-sync',
      'Team access (manager roles)',
      'Priority support',
      'Custom export reports',
    ],
    limits: {
      menuItems:  Infinity,
      uploads:    Infinity,
      outlets:    5,
    },
    cta: 'Upgrade to Pro',
    highlight: false,
  },
];

export const getPlanById = (id) => PLANS.find(p => p.id === id) || PLANS[0];

// ─── Open One-time Payment Checkout ──────────────────────────────────────────
/**
 * For one-time payments (e.g., annual plans, add-ons).
 * Requires a backend endpoint to create a Razorpay Order and return order_id.
 *
 * @param {object} opts
 * @param {string} opts.orderId        - From your backend: razorpay_order_id
 * @param {number} opts.amount         - Amount in paise (e.g., 199900 for ₹1999)
 * @param {string} opts.currency       - 'INR'
 * @param {string} opts.userEmail
 * @param {string} opts.userName
 * @param {string} opts.userPhone
 * @param {string} opts.description
 * @param {function} opts.onSuccess    - Called with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * @param {function} opts.onFailure    - Called with error
 */
export async function openRazorpayCheckout({
  orderId,
  amount,
  currency = 'INR',
  userEmail,
  userName,
  userPhone = '',
  description = 'Menu DNA Subscription',
  onSuccess,
  onFailure,
}) {
  await loadRazorpaySDK();

  const options = {
    key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount,                   // in paise
    currency,
    name:        'Menu DNA',
    description,
    order_id:    orderId,
    prefill: {
      name:  userName,
      email: userEmail,
      contact: userPhone,
    },
    theme: {
      color:      '#e8e8e8',
      backdrop_color: '#0a0a0a',
    },
    modal: {
      backdropclose: false,
      escape:        false,
    },
    handler: (response) => {
      // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      // ⚠️  Always verify signature on YOUR BACKEND before granting access
      onSuccess?.(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    onFailure?.(response.error);
  });
  rzp.open();
  return rzp;
}

// ─── Open Subscription Checkout ──────────────────────────────────────────────
/**
 * For recurring subscriptions using Razorpay Subscriptions.
 * Requires a backend to create a Subscription and return subscription_id.
 *
 * @param {object} opts
 * @param {string} opts.subscriptionId  - From your backend: razorpay_subscription_id
 * @param {string} opts.userEmail
 * @param {string} opts.userName
 * @param {string} opts.planName
 * @param {function} opts.onSuccess
 * @param {function} opts.onFailure
 */
export async function openSubscriptionCheckout({
  subscriptionId,
  userEmail,
  userName,
  planName,
  onSuccess,
  onFailure,
}) {
  await loadRazorpaySDK();

  const options = {
    key:             import.meta.env.VITE_RAZORPAY_KEY_ID,
    subscription_id: subscriptionId,
    name:            'Menu DNA',
    description:     `${planName} — Monthly Subscription`,
    prefill: {
      name:  userName,
      email: userEmail,
    },
    theme: {
      color:         '#e8e8e8',
      backdrop_color: '#0a0a0a',
    },
    handler: (response) => {
      // response = { razorpay_payment_id, razorpay_subscription_id, razorpay_signature }
      onSuccess?.(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (res) => onFailure?.(res.error));
  rzp.open();
  return rzp;
}
