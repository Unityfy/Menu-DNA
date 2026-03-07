import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { useRestaurant }  from '../hooks/useRestaurant';
import { useToast }       from '../components/Toast';
import { normalizeCSVRow, SAMPLE_DATA } from '../lib/menuAnalytics';

const REQUIRED_COLS = ['dish_name / name', 'price', 'cost', 'units_sold'];

function ColPreview({ columns, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ fontSize: 12 }}>
        <thead>
          <tr>
            {columns.map(c => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 5).map((row, i) => (
            <tr key={i}>
              {columns.map(c => (
                <td key={c} style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row[c] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 5 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '8px 16px' }}>
          + {rows.length - 5} more rows
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  const [dragging,   setDragging]   = useState(false);
  const [parsed,     setParsed]     = useState(null);  // { columns, rows, normalized, fileName }
  const [uploading,  setUploading]  = useState(false);
  const [committed,  setCommitted]  = useState(false);
  const fileRef = useRef(null);

  const { saveMenuData, uploads, loading: histLoading } = useRestaurant();
  const toast = useToast();

  const processFile = useCallback((file) => {
    if (!file || !file.name.endsWith('.csv')) {
      toast('Please upload a valid CSV file.', 'error');
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const normalized = data.map(normalizeCSVRow).filter(Boolean);
        if (!normalized.length) {
          toast('No valid rows found. Check your column names.', 'error');
          return;
        }
        setParsed({ columns: meta.fields, rows: data, normalized, fileName: file.name });
        setCommitted(false);
      },
      error: () => toast('Failed to parse CSV.', 'error'),
    });
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleLoadSample = () => {
    const blob = new Blob([SAMPLE_DATA], { type: 'text/csv' });
    const file = new File([blob], 'sample_menu_data.csv', { type: 'text/csv' });
    processFile(file);
  };

  const handleCommit = async () => {
    if (!parsed) return;
    setUploading(true);
    try {
      await saveMenuData(parsed.normalized, parsed.fileName);
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
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Data Upload</h1>
        <p className="page-subtitle">
          Import your POS export CSV to analyze menu performance. Read-only ingestion — no changes to your system.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--sp-4)', alignItems: 'start' }}>
        {/* Upload Area */}
        <div className="animate-fade-up delay-1">
          {!parsed ? (
            <div>
              {/* Drop Zone */}
              <div
                className={`drop-zone${dragging ? ' dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div className="drop-zone-icon">⬆</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>
                  Drop your CSV here
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  or click to browse
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Or sample */}
              <div style={{ textAlign: 'center', marginTop: 'var(--sp-3)' }}>
                <button className="btn btn-ghost" onClick={handleLoadSample} style={{ fontSize: 12 }}>
                  ◈ Load sample data instead
                </button>
              </div>
            </div>
          ) : (
            <div className={`card${committed ? ' ' : ''}`} style={{
              border: committed ? '1px solid rgba(122,157,122,0.3)' : '1px solid var(--border)',
            }}>
              {/* File info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {parsed.fileName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {parsed.normalized.length} valid rows · {parsed.columns.length} columns
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={handleReset} style={{ fontSize: 12, padding: '4px 12px' }}>
                  ✕ Clear
                </button>
              </div>

              {/* Preview table */}
              <div className="card-elevated" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--sp-3)' }}>
                <ColPreview columns={parsed.columns} rows={parsed.rows} />
              </div>

              {/* Validation summary */}
              <div style={{
                display: 'flex',
                gap: 'var(--sp-2)',
                flexWrap: 'wrap',
                marginBottom: 'var(--sp-3)',
                fontSize: 12,
              }}>
                <div style={{ color: 'var(--accent-opp)' }}>
                  ✓ {parsed.normalized.length} rows valid
                </div>
                {parsed.rows.length - parsed.normalized.length > 0 && (
                  <div style={{ color: 'var(--accent-warn)' }}>
                    ⚠ {parsed.rows.length - parsed.normalized.length} rows skipped
                  </div>
                )}
              </div>

              {committed ? (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(122,157,122,0.08)',
                  border: '1px solid rgba(122,157,122,0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12,
                  color: 'var(--accent-opp)',
                }}>
                  ✓ Data ingested. Navigate to Profitability or Intelligence to view analysis.
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleCommit}
                  disabled={uploading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {uploading ? 'Ingesting…' : `→ Ingest ${parsed.normalized.length} dishes`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {/* Format Guide */}
          <div className="card animate-fade-up delay-2">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              Expected CSV Format
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: 11 }}>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Example</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['dish_name',          'text',   'Grilled Chicken'],
                    ['category',           'text',   'Mains'],
                    ['price',              'number', '480'],
                    ['cost',               'number', '160'],
                    ['units_sold',         'integer','220'],
                    ['prep_time_minutes',  'integer','12'],
                  ].map(([col, type, ex]) => (
                    <tr key={col}>
                      <td style={{ color: 'var(--accent-info)', fontFamily: 'var(--font-mono)' }}>{col}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{type}</td>
                      <td>{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 'var(--sp-2)', lineHeight: 1.7 }}>
              Required: <span style={{ color: 'var(--text-primary)' }}>dish_name, price, cost, units_sold</span>.
              Column names are flexible — common variants like <span style={{ color: 'var(--text-primary)' }}>name, selling_price, qty</span> are auto-mapped.
            </div>
          </div>

          {/* Upload History */}
          <div className="card animate-fade-up delay-3">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              Upload History
            </div>
            {uploads.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-disabled)', padding: 'var(--sp-2) 0' }}>
                No uploads yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {uploads.slice(0, 5).map(u => (
                  <div key={u.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', marginBottom: 2 }}>{u.fileName}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{u.dishCount} dishes</div>
                    </div>
                    <div style={{ color: 'var(--text-disabled)', fontSize: 11 }}>
                      {u.uploadedAt?.toDate
                        ? u.uploadedAt.toDate().toLocaleDateString()
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
