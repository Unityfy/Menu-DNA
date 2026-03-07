import { useState } from 'react';
import { useBilling } from '../hooks/useBilling';
import { useAuth }    from '../hooks/useAuth';
import { useToast }   from '../components/Toast';
import { PLANS }      from '../lib/razorpay';

const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';

function PlanCard({ plan, isCurrentPlan, onUpgrade, upgrading }) {
  const isFree = plan.price === 0;

  return (
    <div
      style={{
        background:   plan.highlight ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border:       plan.highlight
          ? '1px solid var(--border-strong)'
          : isCurrentPlan
          ? '1px solid rgba(122,157,122,0.4)'
          : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding:      'var(--sp-4)',
        display:      'flex',
        flexDirection:'column',
        gap:          'var(--sp-3)',
        position:     'relative',
        transition:   'border-color 160ms',
      }}
    >
      {/* Popular badge */}
      {plan.highlight && (
        <div style={{
          position:    'absolute',
          top:         -12,
          left:        '50%',
          transform:   'translateX(-50%)',
          background:  'var(--text-primary)',
          color:       'var(--bg-base)',
          fontSize:    10,
          fontWeight:  600,
          letterSpacing: '0.1em',
          padding:     '3px 12px',
          borderRadius: 100,
          whiteSpace:  'nowrap',
          textTransform: 'uppercase',
        }}>
          Most Popular
        </div>
      )}

      {/* Plan name + price */}
      <div>
        <div style={{
          fontSize:      12,
          color:         'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom:  8,
        }}>
          {plan.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize:   36,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color:      'var(--text-primary)',
          }}>
            {plan.priceLabel}
          </span>
          {plan.period && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {plan.period}
            </span>
          )}
        </div>
      </div>

      <div className="divider" style={{ margin: 0 }} />

      {/* Features */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
            <span style={{ color: 'var(--accent-opp)', flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-2)' }}>
        {isCurrentPlan ? (
          <div style={{
            textAlign:  'center',
            padding:    '10px',
            fontSize:   12,
            color:      'var(--accent-opp)',
            border:     '1px solid rgba(122,157,122,0.25)',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(122,157,122,0.05)',
          }}>
            ✓ Active plan
          </div>
        ) : isFree ? (
          <div style={{
            textAlign:  'center',
            padding:    '10px',
            fontSize:   12,
            color:      'var(--text-muted)',
          }}>
            Free forever
          </div>
        ) : (
          <button
            className={`btn ${plan.highlight ? 'btn-primary' : 'btn-ghost'}`}
            style={{ width: '100%', justifyContent: 'center', height: 42 }}
            onClick={() => onUpgrade(plan.id)}
            disabled={upgrading}
          >
            {upgrading ? (
              <span style={{ opacity: 0.6 }}>Opening checkout…</span>
            ) : (
              plan.cta
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function PaymentHistoryRow({ payment }) {
  const planName = PLANS.find(p => p.id === payment.planId)?.name || payment.planId;
  const date     = payment.createdAt
    ? new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 500 }}>{planName}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {payment.type === 'subscription' ? 'Monthly subscription' : 'One-time payment'}
        </div>
      </td>
      <td>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {payment.razorpayPaymentId || '—'}
        </div>
      </td>
      <td>{date}</td>
      <td>
        <span style={{
          display:       'inline-flex',
          alignItems:    'center',
          gap:           5,
          padding:       '2px 10px',
          borderRadius:  100,
          fontSize:      11,
          background:    'rgba(122,157,122,0.08)',
          color:         'var(--accent-opp)',
          border:        '1px solid rgba(122,157,122,0.2)',
        }}>
          ✓ {payment.status || 'success'}
        </span>
      </td>
    </tr>
  );
}

export default function BillingPage() {
  const { user, profile }                = useAuth();
  const { currentPlan, payments, loading, error, upgradePlan } = useBilling();
  const toast                            = useToast();
  const [upgrading, setUpgrading]        = useState(false);
  const [upgradingPlanId, setUpgradingId]= useState(null);

  const handleUpgrade = async (planId) => {
    setUpgrading(true);
    setUpgradingId(planId);
    await upgradePlan(planId, {
      onSuccess: ({ plan }) => {
        toast(`Upgraded to ${plan.name}! Your new features are now active.`, 'success');
        setUpgrading(false);
        setUpgradingId(null);
      },
      onFailure: (err) => {
        toast(err?.description || 'Payment failed. Please try again.', 'error');
        setUpgrading(false);
        setUpgradingId(null);
      },
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Plans & Billing</h1>
        <p className="page-subtitle">
          Manage your subscription · Secure payments via Razorpay
        </p>
      </div>

      {/* Current Plan Banner */}
      <div
        className="card animate-fade-up delay-1"
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   'var(--sp-5)',
          flexWrap:       'wrap',
          gap:            'var(--sp-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <div style={{
            width:        44,
            height:       44,
            borderRadius: 'var(--radius-md)',
            background:   'var(--bg-elevated)',
            border:       '1px solid var(--border-strong)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontSize:     18,
          }}>
            {currentPlan.id === 'starter' ? '○' : currentPlan.id === 'growth' ? '◈' : '◉'}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>
              Current plan
            </div>
            <div style={{
              fontFamily:    'var(--font-display)',
              fontSize:      18,
              fontWeight:    700,
              color:         'var(--text-primary)',
            }}>
              {currentPlan.name}
              {currentPlan.price > 0 && (
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                  {currentPlan.priceLabel}/{currentPlan.period?.replace('per ', '')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Plan limits */}
        <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          {[
            { label: 'Menu items', value: currentPlan.limits.menuItems === Infinity ? 'Unlimited' : currentPlan.limits.menuItems },
            { label: 'Outlets',    value: currentPlan.limits.outlets === Infinity ? 'Unlimited' : currentPlan.limits.outlets },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding:      '12px 16px',
          background:   'rgba(212,165,116,0.08)',
          border:       '1px solid rgba(212,165,116,0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize:     12,
          color:        'var(--accent-warn)',
          marginBottom: 'var(--sp-3)',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Pricing cards */}
      <div
        className="animate-fade-up delay-2"
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:                 'var(--sp-3)',
          marginBottom:        'var(--sp-6)',
        }}
      >
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan.id === plan.id}
            onUpgrade={handleUpgrade}
            upgrading={upgrading && upgradingPlanId === plan.id}
          />
        ))}
      </div>

      {/* Razorpay trust badge */}
      <div
        className="animate-fade-up delay-3"
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            'var(--sp-2)',
          justifyContent: 'center',
          marginBottom:   'var(--sp-6)',
          flexWrap:       'wrap',
        }}
      >
        {[
          { icon: '🔒', text: 'Secured by Razorpay' },
          { icon: '↻',  text: 'Cancel anytime' },
          { icon: '✦',  text: 'GST invoice provided' },
          { icon: '⚡', text: 'Instant activation' },
        ].map(({ icon, text }) => (
          <div key={text} style={{
            display:    'flex',
            alignItems: 'center',
            gap:        6,
            fontSize:   12,
            color:      'var(--text-muted)',
            padding:    '6px 14px',
            border:     '1px solid var(--border)',
            borderRadius: 100,
          }}>
            <span style={{ fontSize: 11 }}>{icon}</span>
            {text}
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="animate-fade-up delay-4">
        <div style={{
          fontSize:       11,
          color:          'var(--text-muted)',
          letterSpacing:  '0.08em',
          textTransform:  'uppercase',
          marginBottom:   'var(--sp-2)',
        }}>
          Payment History
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {payments.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--sp-5)' }}>
              <div className="empty-state-icon">○</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No payments yet.</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <PaymentHistoryRow key={p.id} payment={p} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Setup note for devs */}
      <div
        className="animate-fade-up delay-5"
        style={{
          marginTop:    'var(--sp-5)',
          padding:      'var(--sp-3)',
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          borderLeft:   '3px solid var(--accent-info)',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--accent-info)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Developer Setup Required
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          Add these to your <code style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 3 }}>.env</code> file,
          and deploy the Cloud Functions in <code style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 3 }}>/functions/index.js</code> to enable live payments:
        </div>
        <div style={{
          marginTop:    10,
          fontFamily:   'var(--font-mono)',
          fontSize:     11,
          color:        'var(--text-secondary)',
          lineHeight:   2,
          background:   'var(--bg-elevated)',
          padding:      'var(--sp-2)',
          borderRadius: 'var(--radius-md)',
        }}>
          VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX<br />
          VITE_RAZORPAY_PLAN_GROWTH=plan_XXXXXXXXXX<br />
          VITE_RAZORPAY_PLAN_PRO=plan_XXXXXXXXXX<br />
          VITE_BACKEND_URL=https://your-region-project.cloudfunctions.net
        </div>
      </div>
    </div>
  );
}
