import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { useRestaurant }    from '../hooks/useRestaurant';
import { useToast }         from '../components/Toast';
import { parseFile, PETPOOJA_SAMPLE_CSV } from '../lib/posParser';

// ── Sub-components ───────────────────────────────────────────────────────────

function FileTypeBadge({ type }) {
  const isCSV = type === 'csv';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px',
      borderRadius: 100,
      fontSize: 10,
      letterSpacing: '0.06em',
      fontWeight: 500,
      background: isCSV ? 'rgba(122,138,157,0.1)' : 'rgba(212,165,116,0.1)',
      color: isCSV ? 'var(--accent-info)' : 'var(--accent-warn)',
      border: `1px solid ${isCSV ? 'rgba(122,138,157,0.2)' : 'rgba(212,165,116,0.2)'}`,
      textTransform: 'uppercase',
    }}>
      {type}
    </span>
  );
}

function PreviewTable({ headers, rows }) {
  if (!headers?.length) return null;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ fontSize: 11 }}>
        <thead>
          <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0, 5).map((row, i) => (
            <tr key={i}>
              {headers.map(h => (
                <td key={h} style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(typeof row === 'object' ? (row[h] ?? row[Object.keys(row)[headers.indexOf(h)]] ?? '—') : '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 5 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '6px 16px' }}>
          + {rows.length - 5} more rows
        </div>
      )}
    </div>
  );
}

function ParsedPreview({ parsed }) {
  // Show normalized dishes as preview (always consistent)
  const cols = ['name', 'category', 'price', 'cost', 'unitsSold'];
  const colLabels = { name: 'Dish Name', category: 'Category', price: 'Price (₹)', cost: 'Cost (₹)', unitsSold: 'Units Sold' };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ fontSize: 11 }}>
        <thead>
          <tr>{cols.map(c => <th key={c}>{colLabels[c]}</th>)}</tr>
        </thead>
        <tbody>
          {parsed.normalized.slice(0, 6).map((dish, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 500 }}>{dish.name}</td>
              <td style={{ color: 'var(--text-muted)' }}>{dish.category}</td>
              <td>₹{dish.price}</td>
              <td style={{ color: dish.cost > 0 ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                {dish.cost > 0 ? `₹${dish.cost}` : '—'}
              </td>
              <td>{dish.unitsSold}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {parsed.normalized.length > 6 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '6px 16px' }}>
          + {parsed.normalized.length - 6} more dishes
        </div>
      )}
    </div>
  );
}

function ProcessingIndicator({ step }) {
  const steps = [
    { key: 'read',      label: 'Reading file' },
    { key: 'extract',   label: 'Extracting text' },
    { key: 'parse',     label: 'Parsing table structure' },
    { key: 'normalize', label: 'Normalizing dish data' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 'var(--sp-3) 0' }}>
      {steps.map((s, i) => {
        const done    = steps.findIndex(x => x.key === step) > i;
        const active  = s.key === step;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
            <div style={{
              width: 20, height: 20,
              borderRadius: '50%',
              border: `1px solid ${done ? 'var(--accent-opp)' : active ? 'var(--text-muted)' : 'var(--border-strong)'}`,
              background: done ? 'rgba(122,157,122,0.15)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10,
              flexShrink: 0,
              animation: active ? 'pulse 1.2s ease infinite' : 'none',
            }}>
              {done ? '✓' : active ? '…' : ''}
            </div>
            <span style={{ color: done ? 'var(--accent-opp)' : active ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function UploadPage() {
  const [dragging,   setDragging]   = useState(false);
  const [parsed,     setParsed]     = useState(null);
  const [processing, setProcessing] = useState(false);
  const [procStep,   setProcStep]   = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [committed,  setCommitted]  = useState(false);
  const [missingCost, setMissingCost] = useState(false);

  const fileRef = useRef(null);
  const { saveMenuData, uploads } = useRestaurant();
  const toast = useToast();

  const processFile = useCallback(async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'pdf'].includes(ext)) {
      toast('Only CSV and PDF files are supported.', 'error');
      return;
    }

    setParsed(null);
    setCommitted(false);
    setProcessing(true);
    setProcStep('read');

    try {
      if (ext === 'pdf') {
        setProcStep('extract');
        await new Promise(r => setTimeout(r, 200));
        setProcStep('parse');
      } else {
        setProcStep('parse');
      }

      const result = await parseFile(file, Papa);

      setProcStep('normalize');
      await new Promise(r => setTimeout(r, 150));

      // Check if any dish is missing cost data
      const noCost = result.normalized.filter(d => d.cost === 0).length;
      setMissingCost(noCost > 0 ? noCost : false);

      setParsed(result);
    } catch (err) {
      toast(err.message || 'Failed to parse file.', 'error');
    } finally {
      setProcessing(false);
      setProcStep(null);
    }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleLoadSample = () => {
    const blob = new Blob([PETPOOJA_SAMPLE_CSV], { type: 'text/csv' });
    const file = new File([blob], 'petpooja_item_sales_sample.csv', { type: 'text/csv' });
    processFile(file);
  };

  const handleCommit = async () => {
    if (!parsed) return;
    setUploading(true);
    try {
      await saveMenuData(parsed.normalized, parsed.fileType.toUpperCase() + ' — ' + (parsed.normalized.length) + ' dishes');
      setCommitted(true);
      toast(`${parsed.normalized.length} dishes ingested successfully.`, 'success');
    } catch (e) {
      toast(`Upload failed: ${e.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setParsed(null);
    setCommitted(false);
    setMissingCost(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Data Upload</h1>
        <p className="page-subtitle">
          Import your Petpooja export — supports CSV and PDF formats. Read-only ingestion, no changes to your POS.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--sp-4)', alignItems: 'start' }}>

        {/* ── Left: Upload Zone ── */}
        <div className="animate-fade-up delay-1">

          {/* Processing state */}
          {processing && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--sp-2)' }}>
                Processing file…
              </div>
              <ProcessingIndicator step={procStep} />
            </div>
          )}

          {/* Drop zone (when no file) */}
          {!processing && !parsed && (
            <div>
              <div
                className={`drop-zone${dragging ? ' dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div className="drop-zone-icon">⬆</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                  Drop your Petpooja export here
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>
                  or click to browse
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['CSV', 'PDF'].map(t => (
                    <span key={t} style={{
                      padding: '3px 10px',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 100,
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.05em',
                    }}>{t}</span>
                  ))}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ textAlign: 'center', marginTop: 'var(--sp-3)' }}>
                <button className="btn btn-ghost" onClick={handleLoadSample} style={{ fontSize: 12 }}>
                  ◈ Load Petpooja sample CSV
                </button>
              </div>
            </div>
          )}

          {/* Parsed result */}
          {!processing && parsed && (
            <div className="card" style={{
              border: committed
                ? '1px solid rgba(122,157,122,0.3)'
                : '1px solid var(--border)',
            }}>
              {/* File info row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <FileTypeBadge type={parsed.fileType} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {parsed.normalized.length} dishes detected
                    </div>
                    {parsed.pageCount && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {parsed.pageCount} page{parsed.pageCount > 1 ? 's' : ''} · PDF extraction
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={handleReset}
                  style={{ fontSize: 12, padding: '4px 12px', flexShrink: 0 }}
                >
                  ✕ Clear
                </button>
              </div>

              {/* Normalized preview */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Normalized Preview
              </div>
              <div className="card-elevated" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--sp-3)' }}>
                <ParsedPreview parsed={parsed} />
              </div>

              {/* Warnings */}
              {missingCost && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(212,165,116,0.06)',
                  border: '1px solid rgba(212,165,116,0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12,
                  color: 'var(--accent-warn)',
                  marginBottom: 'var(--sp-2)',
                  lineHeight: 1.6,
                }}>
                  ⚠ {missingCost} dish{missingCost > 1 ? 'es' : ''} have no cost data — food cost % and margin will be incomplete.
                  Petpooja exports don't include recipe costs; add them via your inventory/recipe module or enter manually.
                </div>
              )}

              {/* Validation row */}
              <div style={{ display: 'flex', gap: 'var(--sp-2)', fontSize: 12, marginBottom: 'var(--sp-3)', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--accent-opp)' }}>
                  ✓ {parsed.normalized.length} valid rows
                </span>
                {parsed.rawRows?.length > parsed.normalized.length && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    {parsed.rawRows.length - parsed.normalized.length} skipped (totals/headers)
                  </span>
                )}
              </div>

              {/* CTA */}
              {committed ? (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(122,157,122,0.08)',
                  border: '1px solid rgba(122,157,122,0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12,
                  color: 'var(--accent-opp)',
                }}>
                  ✓ Data ingested. Go to Profitability or Intelligence to view analysis.
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleCommit}
                  disabled={uploading}
                  style={{ width: '100%', justifyContent: 'center', height: 44 }}
                >
                  {uploading ? 'Ingesting…' : `→ Ingest ${parsed.normalized.length} dishes`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Info panels ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>

          {/* Supported formats */}
          <div className="card animate-fade-up delay-2">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              Supported Petpooja Exports
            </div>

            {/* CSV format */}
            <div style={{ marginBottom: 'var(--sp-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <FileTypeBadge type="csv" />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Item Sales Report</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 8 }}>
                Export from Petpooja: <span style={{ color: 'var(--text-primary)' }}>Reports → Sales → Item Sales</span> → Download CSV
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '8px 12px', lineHeight: 2 }}>
                Item Name · Category · Quantity · Rate · Gross Amount · Discount · Net Amount
              </div>
            </div>

            <div className="divider" />

            {/* PDF format */}
            <div style={{ marginTop: 'var(--sp-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <FileTypeBadge type="pdf" />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Any Petpooja PDF Report</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Export from Petpooja: <span style={{ color: 'var(--text-primary)' }}>Reports → Sales → Item Sales</span> → Print/Save as PDF
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                PDF text is extracted and the table is reconstructed automatically. Works with multi-page reports.
              </div>
            </div>
          </div>

          {/* Column aliases */}
          <div className="card animate-fade-up delay-3">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              Auto-mapped Column Names
            </div>
            <table className="data-table" style={{ fontSize: 11 }}>
              <thead>
                <tr>
                  <th>Petpooja Column</th>
                  <th>Maps to</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Item Name, Dish, Product',     'Dish name'],
                  ['Category, Group, Section',     'Category'],
                  ['Quantity, Qty, No of Plates',  'Units sold'],
                  ['Rate, Price, Selling Price',   'Selling price'],
                  ['Gross Amount, Net Amount',     'Price (derived)'],
                  ['Cost, Food Cost, COGS',        'Food cost'],
                  ['Prep Time, Kitchen Time',      'Prep time'],
                ].map(([from, to]) => (
                  <tr key={from}>
                    <td style={{ color: 'var(--accent-info)', fontSize: 10 }}>{from}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Upload History */}
          <div className="card animate-fade-up delay-4">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              Upload History
            </div>
            {uploads.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-disabled)', padding: 'var(--sp-1) 0' }}>
                No uploads yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {uploads.slice(0, 5).map(u => (
                  <div key={u.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', marginBottom: 2 }}>{u.fileName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{u.dishCount} dishes</div>
                    </div>
                    <div style={{ color: 'var(--text-disabled)', fontSize: 11 }}>
                      {u.uploadedAt?.toDate
                        ? u.uploadedAt.toDate().toLocaleDateString('en-IN')
                        : 'Recent'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
