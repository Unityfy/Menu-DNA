import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useRestaurant } from '../hooks/useRestaurant';
import { useNavigate }   from 'react-router-dom';
import { ChartTooltip }  from '../components/ChartTooltip';

const fmt  = (n, d = 0) => n?.toLocaleString('en-IN', { maximumFractionDigits: d }) ?? '—';
const fmtC = (n) => n != null ? `₹${fmt(n, 0)}` : '—';
const fmtP = (n) => n != null ? `${fmt(n, 1)}%` : '—';

const CLASS_META = {
  star:      { label: 'Star',      color: 'var(--star)',      badge: 'badge-star' },
  plowhorse: { label: 'Plowhorse', color: 'var(--plowhorse)', badge: 'badge-plowhorse' },
  puzzle:    { label: 'Puzzle',    color: 'var(--puzzle)',    badge: 'badge-puzzle' },
  dog:       { label: 'Dog',       color: 'var(--dog)',       badge: 'badge-dog' },
};

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="progress-bar" style={{ minWidth: 60 }}>
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function ProfitabilityPage() {
  const { currentMenu, loading } = useRestaurant();
  const navigate = useNavigate();

  const [sortBy,     setSortBy]     = useState('totalProfit');
  const [sortDir,    setSortDir]    = useState('desc');
  const [filterCat,  setFilterCat]  = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [chartMetric, setChartMetric] = useState('totalProfit');

  const categories = useMemo(() => {
    const cats = [...new Set(currentMenu.map(d => d.category))].sort();
    return ['all', ...cats];
  }, [currentMenu]);

  const sorted = useMemo(() => {
    let data = [...currentMenu];
    if (filterCat   !== 'all') data = data.filter(d => d.category     === filterCat);
    if (filterClass !== 'all') data = data.filter(d => d.classification === filterClass);
    data.sort((a, b) => {
      const va = a[sortBy] ?? 0, vb = b[sortBy] ?? 0;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
    return data;
  }, [currentMenu, sortBy, sortDir, filterCat, filterClass]);

  const maxValues = useMemo(() => ({
    totalProfit: Math.max(...currentMenu.map(d => d.totalProfit), 1),
    unitsSold:   Math.max(...currentMenu.map(d => d.unitsSold), 1),
    totalRevenue: Math.max(...currentMenu.map(d => d.totalRevenue), 1),
    foodCostPct: 100,
  }), [currentMenu]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortTh = ({ col, label }) => (
    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(col)}>
      {label} {sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  );

  // Chart data — top 10 by metric
  const chartData = useMemo(() =>
    [...currentMenu]
      .sort((a, b) => b[chartMetric] - a[chartMetric])
      .slice(0, 10)
      .map(d => ({ name: d.name.split(' ').slice(0, 2).join(' '), value: d[chartMetric], classification: d.classification })),
    [currentMenu, chartMetric]
  );

  if (loading) return (
    <div className="page-container">
      <div className="empty-state">
        <div style={{ animation: 'pulse 1.5s ease infinite', color: 'var(--text-muted)', fontSize: 14 }}>
          Loading analysis…
        </div>
      </div>
    </div>
  );

  if (!currentMenu.length) return (
    <div className="page-container">
      <div className="empty-state animate-fade-in">
        <div className="empty-state-icon">◈</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>No data to analyze</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Upload your POS export to view profitability.</div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>↑ Upload data</button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Profitability Analysis</h1>
        <p className="page-subtitle">{currentMenu.length} dishes · dish-level contribution margin and cost breakdown</p>
      </div>

      {/* Chart */}
      <div className="card animate-fade-up delay-1" style={{ marginBottom: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Top 10 dishes</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'totalProfit',  label: 'Profit' },
              { key: 'totalRevenue', label: 'Revenue' },
              { key: 'unitsSold',    label: 'Volume' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`btn ${chartMetric === key ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '4px 12px', fontSize: 11 }}
                onClick={() => setChartMetric(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => chartMetric === 'unitsSold' ? fmt(v) : `₹${fmt(v)}`}
            />
            <Tooltip
              content={<ChartTooltip
                formatter={(v, n) => chartMetric === 'unitsSold' ? fmt(v) : fmtC(v)}
              />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={CLASS_META[entry.classification]?.color || 'var(--text-muted)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div
        className="animate-fade-up delay-2"
        style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)', flexWrap: 'wrap' }}
      >
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
        </select>
        <select
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="all">All classifications</option>
          <option value="star">Stars</option>
          <option value="plowhorse">Plowhorses</option>
          <option value="puzzle">Puzzles</option>
          <option value="dog">Dogs</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {sorted.length} dishes
        </div>
      </div>

      {/* Table */}
      <div className="card animate-fade-up delay-3" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <SortTh col="name"                 label="Dish" />
                <th>Category</th>
                <th>Class</th>
                <SortTh col="price"                label="Price" />
                <SortTh col="foodCostPct"          label="Food Cost %" />
                <SortTh col="contributionMargin"   label="CM" />
                <SortTh col="unitsSold"            label="Units" />
                <SortTh col="totalProfit"          label="Total Profit" />
                <SortTh col="intelligenceScore"    label="Score" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((dish, i) => {
                const meta = CLASS_META[dish.classification];
                const isBadFoodCost = dish.foodCostPct > 40;
                return (
                  <tr key={dish.id || dish.name}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {dish.name}
                      </div>
                      {dish.prepTime > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {dish.prepTime} min prep
                        </div>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{dish.category}</td>
                    <td>
                      <span className={`badge ${meta?.badge}`}>
                        {meta?.label}
                      </span>
                    </td>
                    <td>{fmtC(dish.price)}</td>
                    <td>
                      <div style={{ color: isBadFoodCost ? 'var(--accent-warn)' : 'var(--text-primary)' }}>
                        {fmtP(dish.foodCostPct)}
                      </div>
                    </td>
                    <td>
                      <div>{fmtC(dish.contributionMargin)}</div>
                      <MiniBar
                        value={dish.contributionMargin}
                        max={maxValues.totalProfit / (currentMenu.length || 1) * 3}
                        color={meta?.color || 'var(--text-muted)'}
                      />
                    </td>
                    <td>
                      <div>{fmt(dish.unitsSold)}</div>
                      <MiniBar
                        value={dish.unitsSold}
                        max={maxValues.unitsSold}
                        color="var(--accent-info)"
                      />
                    </td>
                    <td style={{ color: dish.totalProfit > 0 ? 'var(--accent-opp)' : 'var(--accent-warn)' }}>
                      {fmtC(dish.totalProfit)}
                    </td>
                    <td>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        border: `1px solid ${meta?.color || 'var(--border)'}22`,
                        background: `${meta?.color || 'var(--border)'}0f`,
                        color: meta?.color || 'var(--text-muted)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 12,
                      }}>
                        {dish.intelligenceScore}
                      </div>
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
