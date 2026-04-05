import { useRestaurant } from '../hooks/useRestaurant';
import { useAuth }        from '../hooks/useAuth';
import { useNavigate }    from 'react-router-dom';

const fmt  = (n, d = 0) => n?.toLocaleString('en-IN', { maximumFractionDigits: d }) ?? '—';
const fmtC = (n) => n != null ? `₹${fmt(n, 0)}` : '—';
const fmtP = (n) => n != null ? `${fmt(n, 1)}%` : '—';

function StatCard({ label, value, sub, accent, delay = 0, onClick }) {
  return (
    <div
      className={`stat-card animate-fade-up delay-${delay}`}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'border-color 160ms' }}
      onClick={onClick}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={accent ? { color: `var(--accent-${accent})` } : {}}>
        {value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function RecommendationCard({ rec, delay }) {
  const accentMap = {
    warn: { bg: 'rgba(212,165,116,0.06)', border: 'rgba(212,165,116,0.15)', color: 'var(--accent-warn)' },
    info: { bg: 'rgba(122,138,157,0.06)', border: 'rgba(122,138,157,0.15)', color: 'var(--accent-info)' },
    opp:  { bg: 'rgba(122,157,122,0.06)', border: 'rgba(122,157,122,0.15)', color: 'var(--accent-opp)'  },
  };
  const a = accentMap[rec.accent] || accentMap.info;

  return (
    <div
      className={`animate-fade-up delay-${delay}`}
      style={{
        background: a.bg,
        border: `1px solid ${a.border}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--sp-2) var(--sp-3)',
        display: 'flex',
        gap: 'var(--sp-2)',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ fontSize: 16, color: a.color, marginTop: 2, flexShrink: 0 }}>
        {rec.icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
          {rec.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {rec.body}
        </div>
      </div>
      <div style={{
        flexShrink: 0,
        fontSize: 10,
        color: a.color,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginTop: 2,
        padding: '2px 8px',
        border: `1px solid ${a.border}`,
        borderRadius: 100,
        whiteSpace: 'nowrap',
      }}>
        {rec.priority}
      </div>
    </div>
  );
}

function BCGSummaryBar({ byClass }) {
  if (!byClass) return null;
  const total = Object.values(byClass).reduce((s, v) => s + v, 0);
  if (!total) return null;

  const segments = [
    { key: 'star',      color: 'var(--star)',      label: 'Stars' },
    { key: 'puzzle',    color: 'var(--puzzle)',    label: 'Puzzles' },
    { key: 'plowhorse', color: 'var(--plowhorse)', label: 'Plowhorses' },
    { key: 'dog',       color: 'var(--dog)',        label: 'Dogs' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
        {segments.map(({ key, color }) => {
          const pct = (byClass[key] / total) * 100;
          return pct > 0 ? (
            <div key={key} style={{ flex: pct, background: color, borderRadius: 2 }} />
          ) : null;
        })}
      </div>
      <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 10, flexWrap: 'wrap' }}>
        {segments.map(({ key, color, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{byClass[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const { summary, recommendations, currentMenu, loading } = useRestaurant();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-up">
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>
          {greeting}, {profile?.display_name || user?.email?.split('@')[0]} —
        </div>
        <h1 className="page-title">Restaurant Overview</h1>
        <p className="page-subtitle">
          {summary
            ? `${summary.dishCount} items analyzed · Last updated today`
            : 'Upload your POS data to begin analysis'}
        </p>
      </div>

      {!summary && !loading && (
        <div
          className="card animate-fade-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--sp-4)',
            marginBottom: 'var(--sp-4)',
            border: '1px dashed var(--border-strong)',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
              No menu data yet
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Upload your POS export CSV to generate profitability insights and menu intelligence scores.
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/upload')}
            style={{ flexShrink: 0 }}
          >
            ↑ Upload data
          </button>
        </div>
      )}

      {/* KPI Stats */}
      {summary && (
        <>
          <div className="grid-4" style={{ marginBottom: 'var(--sp-4)' }}>
            <StatCard
              label="Total Revenue"
              value={fmtC(summary.totalRevenue)}
              sub={`${fmt(summary.totalUnitsSold)} dishes sold`}
              delay={1}
            />
            <StatCard
              label="Net Profit"
              value={fmtC(summary.totalProfit)}
              sub={`${fmtP(summary.overallMargin)} overall margin`}
              accent="opp"
              delay={2}
            />
            <StatCard
              label="Avg Food Cost"
              value={fmtP(summary.avgFoodCost)}
              sub="Target: below 30%"
              accent={summary.avgFoodCost > 35 ? 'warn' : undefined}
              delay={3}
            />
            <StatCard
              label="Menu Items"
              value={summary.dishCount}
              sub={`Top: ${summary.topDish?.name ?? '—'}`}
              delay={4}
            />
          </div>

          {/* BCG Distribution */}
          <div className="grid-2" style={{ marginBottom: 'var(--sp-4)' }}>
            <div className="card animate-fade-up delay-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
                  Portfolio Health
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '4px 12px', fontSize: 11 }}
                  onClick={() => navigate('/intelligence')}
                >
                  View matrix →
                </button>
              </div>
              <BCGSummaryBar byClass={summary.byClass} />
            </div>

            <div className="card animate-fade-up delay-4">
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--sp-2)', letterSpacing: '0.03em' }}>
                Top Performer
              </div>
              {summary.topDish && (
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 6,
                  }}>
                    {summary.topDish.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 2 }}>
                    <span>Intelligence score: </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {summary.topDish.intelligenceScore}/100
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Category: </span>
                    <span style={{ color: 'var(--text-primary)' }}>{summary.topDish.category}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Margin: </span>
                    <span style={{ color: 'var(--accent-opp)' }}>
                      {fmtP(summary.topDish.contributionMarginPct)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Recommendations */}
          {recommendations.length > 0 && (
            <div className="animate-fade-up delay-5">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--sp-2)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  This week's actions
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-disabled)' }}>
                  {recommendations.length} recommendations
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
                {recommendations.map((rec, i) => (
                  <RecommendationCard key={rec.type} rec={rec} delay={i + 1} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
