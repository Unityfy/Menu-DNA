export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontSize: '12px',
      fontFamily: 'var(--font-mono)',
    }}>
      {label && (
        <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ color: entry.color || 'var(--text-primary)', lineHeight: '1.8' }}>
          {entry.name}: {formatter ? formatter(entry.value, entry.name) : entry.value}
        </div>
      ))}
    </div>
  );
}

export function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  const classColors = {
    star:      'var(--star)',
    plowhorse: 'var(--plowhorse)',
    puzzle:    'var(--puzzle)',
    dog:       'var(--dog)',
  };

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: `1px solid ${classColors[d.classification] || 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      fontSize: '12px',
      fontFamily: 'var(--font-mono)',
      minWidth: '180px',
    }}>
      <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: 8, fontSize: '13px' }}>
        {d.name}
      </div>
      <div style={{ color: 'var(--text-muted)', lineHeight: 2 }}>
        <div>Units sold: <span style={{ color: 'var(--text-primary)' }}>{d.unitsSold}</span></div>
        <div>Contribution: <span style={{ color: 'var(--text-primary)' }}>₹{d.contributionMargin?.toFixed(0)}</span></div>
        <div>Score: <span style={{ color: 'var(--text-primary)' }}>{d.intelligenceScore}</span></div>
      </div>
      <div style={{
        marginTop: 8,
        paddingTop: 8,
        borderTop: '1px solid var(--border)',
        color: classColors[d.classification] || 'var(--text-muted)',
        textTransform: 'capitalize',
        letterSpacing: '0.05em',
        fontSize: '11px',
      }}>
        {d.classification}
      </div>
    </div>
  );
}
