import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Label,
} from 'recharts';
import { useRestaurant } from '../hooks/useRestaurant';
import { useNavigate }   from 'react-router-dom';
import { ScatterTooltip } from '../components/ChartTooltip';

const CLASS_META = {
  star:      { label: 'Stars',      color: 'var(--star)',      bg: 'rgba(232,232,232,0.04)',  badge: 'badge-star',      desc: 'High popularity · High margin' },
  puzzle:    { label: 'Puzzles',    color: 'var(--puzzle)',    bg: 'rgba(122,138,157,0.04)', badge: 'badge-puzzle',    desc: 'Low popularity · High margin' },
  plowhorse: { label: 'Plowhorses', color: 'var(--plowhorse)', bg: 'rgba(212,165,116,0.04)', badge: 'badge-plowhorse', desc: 'High popularity · Low margin' },
  dog:       { label: 'Dogs',       color: 'var(--dog)',       bg: 'rgba(85,85,85,0.04)',    badge: 'badge-dog',       desc: 'Low popularity · Low margin' },
};

const ACTION_MAP = {
  star:      { action: 'Maintain',  color: 'var(--accent-opp)' },
  puzzle:    { action: 'Promote',   color: 'var(--accent-info)' },
  plowhorse: { action: 'Optimize',  color: 'var(--accent-warn)' },
  dog:       { action: 'Review',    color: 'var(--accent-warn)' },
};

function ScoreRing({ score, size = 56, classification }) {
  const meta = CLASS_META[classification];
  const r   = (size / 2) - 5;
  const c   = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="3" />
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke={meta?.color || 'var(--text-muted)'}
          strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: size < 50 ? 13 : 16,
        fontWeight: 700,
        color: meta?.color || 'var(--text-primary)',
      }}>
        {score}
      </div>
    </div>
  );
}

export default function IntelligencePage() {
  const { currentMenu, loading } = useRestaurant();
  const navigate  = useNavigate();
  const [selected, setSelected] = useState(null);
  const [activeClass, setActiveClass] = useState('all');

  // Group by classification
  const grouped = useMemo(() => {
    const g = { star: [], plowhorse: [], puzzle: [], dog: [] };
    currentMenu.forEach(d => { if (g[d.classification]) g[d.classification].push(d); });
    return g;
  }, [currentMenu]);

  // Scatter data
  const scatterData = useMemo(() => {
    const classes = ['star', 'plowhorse', 'puzzle', 'dog'];
    return classes.reduce((acc, cls) => {
      acc[cls] = currentMenu
        .filter(d => d.classification === cls && (activeClass === 'all' || activeClass === cls))
        .map(d => ({
          ...d,
          x: d.popularityScore,
          y: d.profitabilityScore,
        }));
      return acc;
    }, {});
  }, [currentMenu, activeClass]);

  const selectedDish = selected
    ? currentMenu.find(d => d.name === selected)
    : null;

  if (loading) return (
    <div className="page-container">
      <div className="empty-state">
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</div>
      </div>
    </div>
  );

  if (!currentMenu.length) return (
    <div className="page-container">
      <div className="empty-state animate-fade-in">
        <div className="empty-state-icon">◉</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>
          No data for intelligence scoring
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Upload your POS export to classify your menu.</div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>↑ Upload data</button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Menu Intelligence</h1>
        <p className="page-subtitle">
          BCG matrix classification · {currentMenu.length} dishes scored and positioned
        </p>
      </div>

      {/* BCG Summary Cards */}
      <div className="grid-4 animate-fade-up delay-1" style={{ marginBottom: 'var(--sp-4)' }}>
        {Object.entries(CLASS_META).map(([cls, meta]) => {
          const dishes = grouped[cls];
          const isActive = activeClass === cls;
          return (
            <div
              key={cls}
              className="stat-card"
              style={{
                cursor: 'pointer',
                border: isActive
                  ? `1px solid ${meta.color}44`
                  : '1px solid var(--border)',
                background: isActive ? meta.bg : 'var(--bg-surface)',
                transition: 'all var(--transition)',
              }}
              onClick={() => setActiveClass(activeClass === cls ? 'all' : cls)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label">{meta.label}</div>
                  <div className="stat-value" style={{ color: meta.color, fontSize: 32 }}>
                    {dishes.length}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {meta.desc}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matrix + Detail */}
      <div className="grid-2 animate-fade-up delay-2" style={{ alignItems: 'start', marginBottom: 'var(--sp-4)' }}>
        {/* BCG Scatter Plot */}
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
            BCG Matrix — click any dish
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="0" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              >
                <Label
                  value="← Popularity →"
                  offset={-8}
                  position="insideBottom"
                  style={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                />
              </XAxis>
              <YAxis
                dataKey="y"
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              >
                <Label
                  value="← Profitability →"
                  angle={-90}
                  offset={20}
                  position="insideLeft"
                  style={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                />
              </YAxis>
              {/* Quadrant lines */}
              <ReferenceLine x={50} stroke="var(--border-strong)" strokeDasharray="4 4" />
              <ReferenceLine y={50} stroke="var(--border-strong)" strokeDasharray="4 4" />

              <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--text-muted)' }} />

              {Object.entries(scatterData).map(([cls, data]) => (
                <Scatter
                  key={cls}
                  data={data}
                  fill={CLASS_META[cls].color}
                  opacity={selected && data.every(d => d.name !== selected) ? 0.25 : 0.85}
                  onClick={(d) => setSelected(s => s === d.name ? null : d.name)}
                  cursor="pointer"
                  r={6}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>

          {/* Quadrant labels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 'var(--sp-2)' }}>
            {[
              { label: '★ Stars',        cls: 'star',      pos: 'top-right' },
              { label: '◆ Puzzles',      cls: 'puzzle',    pos: 'top-left' },
              { label: '⬟ Plowhorses',  cls: 'plowhorse', pos: 'bottom-right' },
              { label: '○ Dogs',         cls: 'dog',       pos: 'bottom-left' },
            ].map(({ label, cls }) => (
              <div key={cls} style={{ fontSize: 10, color: CLASS_META[cls].color, opacity: 0.7, textAlign: 'center' }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Dish Detail / Ranked List */}
        <div>
          {selectedDish ? (
            <div className="card animate-fade-in" style={{
              border: `1px solid ${CLASS_META[selectedDish.classification]?.color}33`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                    {selectedDish.name}
                  </div>
                  <span className={`badge ${CLASS_META[selectedDish.classification]?.badge}`}>
                    {CLASS_META[selectedDish.classification]?.label}
                  </span>
                </div>
                <ScoreRing score={selectedDish.intelligenceScore} classification={selectedDish.classification} />
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                {[
                  { label: 'Price',        value: `₹${selectedDish.price}` },
                  { label: 'Food Cost',    value: `₹${selectedDish.cost} (${selectedDish.foodCostPct?.toFixed(1)}%)` },
                  { label: 'Margin',       value: `₹${selectedDish.contributionMargin?.toFixed(0)}` },
                  { label: 'Units Sold',   value: selectedDish.unitsSold },
                  { label: 'Total Profit', value: `₹${selectedDish.totalProfit?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                  { label: 'Prep Time',    value: selectedDish.prepTime ? `${selectedDish.prepTime} min` : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-2)',
                borderLeft: `3px solid ${CLASS_META[selectedDish.classification]?.color}`,
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Recommended action
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {selectedDish.recommendation}
                </div>
              </div>

              <button
                className="btn btn-ghost"
                style={{ marginTop: 'var(--sp-2)', width: '100%', justifyContent: 'center', fontSize: 12 }}
                onClick={() => setSelected(null)}
              >
                ← Back to ranking
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 'var(--sp-2) var(--sp-3)', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Intelligence Ranking
              </div>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {[...currentMenu]
                  .filter(d => activeClass === 'all' || d.classification === activeClass)
                  .sort((a, b) => b.intelligenceScore - a.intelligenceScore)
                  .map((dish, i) => {
                    const meta = CLASS_META[dish.classification];
                    const action = ACTION_MAP[dish.classification];
                    return (
                      <div
                        key={dish.name}
                        onClick={() => setSelected(dish.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--sp-2)',
                          padding: '12px var(--sp-3)',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'background var(--transition)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          fontSize: 11,
                          color: 'var(--text-disabled)',
                          width: 20,
                          textAlign: 'right',
                          flexShrink: 0,
                        }}>
                          {i + 1}
                        </div>
                        <ScoreRing score={dish.intelligenceScore} size={40} classification={dish.classification} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dish.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dish.category}</div>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: action.color, marginBottom: 2 }}>
                            {action.action}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            ₹{dish.contributionMargin?.toFixed(0)} CM
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card animate-fade-up delay-4">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
          Category Breakdown
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Items</th>
                <th>Stars</th>
                <th>Plowhorses</th>
                <th>Puzzles</th>
                <th>Dogs</th>
                <th>Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {useMemo(() => {
                const cats = {};
                currentMenu.forEach(d => {
                  if (!cats[d.category]) cats[d.category] = [];
                  cats[d.category].push(d);
                });
                return Object.entries(cats).sort(([a], [b]) => a.localeCompare(b));
              }, [currentMenu]).map(([cat, dishes]) => {
                const byClass = (cls) => dishes.filter(d => d.classification === cls).length;
                const avgScore = Math.round(dishes.reduce((s, d) => s + d.intelligenceScore, 0) / dishes.length);
                return (
                  <tr key={cat}>
                    <td style={{ fontWeight: 500 }}>{cat}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{dishes.length}</td>
                    <td style={{ color: 'var(--star)' }}>{byClass('star') || '—'}</td>
                    <td style={{ color: 'var(--plowhorse)' }}>{byClass('plowhorse') || '—'}</td>
                    <td style={{ color: 'var(--puzzle)' }}>{byClass('puzzle') || '—'}</td>
                    <td style={{ color: 'var(--dog)' }}>{byClass('dog') || '—'}</td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        color: avgScore >= 60 ? 'var(--accent-opp)' : avgScore >= 40 ? 'var(--text-primary)' : 'var(--accent-warn)',
                      }}>
                        {avgScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
