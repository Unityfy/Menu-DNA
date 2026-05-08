import { useState, useRef, useCallback, useEffect } from 'react';
import { useRestaurant } from '../hooks/useRestaurant';
import { useToast }      from '../components/Toast';
import { useNavigate }   from 'react-router-dom';
import { searchDishes, getAllCategories } from '../lib/dishDatabase';

// ── Sub-components ───────────────────────────────────────────────────────────

function IngredientTag({ name }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 100,
      fontSize: 11,
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      letterSpacing: '0.02em',
    }}>
      {name}
    </span>
  );
}

function SuggestionDropdown({ suggestions, onSelect, visible }) {
  if (!visible || !suggestions.length) return null;
  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      marginTop: 4,
      maxHeight: 280,
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    }}>
      {suggestions.map((dish, i) => (
        <div
          key={dish.name}
          onClick={() => onSelect(dish)}
          style={{
            padding: '10px 14px',
            cursor: 'pointer',
            borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            transition: 'background 120ms',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
              {dish.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {dish.category} · {dish.ingredients.length} ingredients
            </div>
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--accent-opp)',
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
          }}>
            ~₹{dish.estimatedCost}
          </div>
        </div>
      ))}
    </div>
  );
}

function QueuedItemRow({ item, index, onRemove }) {
  const hasCost = item.cost > 0;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-2)',
      padding: '10px 14px',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-disabled)', width: 20, textAlign: 'right', flexShrink: 0 }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
          {item.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {item.category}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>₹{item.price}</div>
        <div style={{ fontSize: 11, color: hasCost ? 'var(--text-muted)' : 'var(--text-disabled)' }}>
          Cost: {hasCost ? `₹${item.cost}` : '—'}
        </div>
      </div>
      <div style={{ flexShrink: 0, fontSize: 11, color: 'var(--text-muted)' }}>
        {item.unitsSold} sold
      </div>
      <button
        onClick={() => onRemove(index)}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px 8px',
          fontSize: 11,
          flexShrink: 0,
          transition: 'all 120ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-warn)'; e.currentTarget.style.color = 'var(--accent-warn)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        ✕
      </button>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function AddItemPage() {
  const { addMenuItems, currentMenu } = useRestaurant();
  const toast    = useToast();
  const navigate = useNavigate();

  // Form state
  const [dishName,    setDishName]    = useState('');
  const [category,    setCategory]    = useState('');
  const [price,       setPrice]       = useState('');
  const [cost,        setCost]        = useState('');
  const [unitsSold,   setUnitsSold]   = useState('');
  const [prepTime,    setPrepTime]    = useState('');

  // Auto-suggest state
  const [suggestions,  setSuggestions]  = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [costEdited,   setCostEdited]   = useState(false);

  // Queue of items to add
  const [queue,     setQueue]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const [committed, setCommitted] = useState(false);

  const inputRef     = useRef(null);
  const dropdownRef  = useRef(null);
  const dbCategories = getAllCategories();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search dishes as user types
  const handleNameChange = useCallback((value) => {
    setDishName(value);
    setCostEdited(false);

    if (value.trim().length >= 2) {
      const results = searchDishes(value);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setSelectedDish(null);
    }
  }, []);

  // When user selects a dish from suggestions
  const handleSelectDish = useCallback((dish) => {
    setDishName(dish.name);
    setSelectedDish(dish);
    setCategory(dish.category);
    setCost(String(dish.estimatedCost));
    setCostEdited(false);
    setShowDropdown(false);
    setSuggestions([]);
  }, []);

  // Handle cost editing
  const handleCostChange = (value) => {
    setCost(value);
    setCostEdited(true);
  };

  // Add item to queue
  const handleAddToQueue = () => {
    const name = dishName.trim();
    if (!name) { toast('Enter a dish name.', 'error'); return; }

    const priceVal = parseFloat(price);
    if (!priceVal || priceVal <= 0) { toast('Enter a valid selling price.', 'error'); return; }

    const unitsVal = parseInt(unitsSold, 10);
    if (!unitsVal || unitsVal <= 0) { toast('Enter units sold (at least 1).', 'error'); return; }

    // Check duplicate in queue
    if (queue.some(q => q.name.toLowerCase() === name.toLowerCase())) {
      toast(`"${name}" is already in the queue.`, 'error');
      return;
    }

    // Check duplicate in existing menu
    if (currentMenu.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      toast(`"${name}" already exists in your menu. It will be updated.`, 'info');
    }

    const item = {
      name,
      category: category.trim() || 'Uncategorized',
      price:    priceVal,
      cost:     parseFloat(cost) || 0,
      unitsSold: unitsVal,
      prepTime: parseInt(prepTime, 10) || 0,
    };

    setQueue(prev => [...prev, item]);
    resetForm();
    toast(`"${name}" added to queue.`, 'success');
    inputRef.current?.focus();
  };

  const resetForm = () => {
    setDishName('');
    setCategory('');
    setPrice('');
    setCost('');
    setUnitsSold('');
    setPrepTime('');
    setSelectedDish(null);
    setCostEdited(false);
    setSuggestions([]);
  };

  const handleRemoveFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Commit queue to menu
  const handleCommit = async () => {
    if (!queue.length) return;
    setUploading(true);
    try {
      await addMenuItems(queue);
      setCommitted(true);
      toast(`${queue.length} item${queue.length > 1 ? 's' : ''} added to your menu.`, 'success');
      setQueue([]);
    } catch (e) {
      toast(`Failed to save: ${e.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Add Menu Items</h1>
        <p className="page-subtitle">
          Enter a dish name to auto-fetch ingredients and estimated cost. Adjust the cost if needed before adding.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--sp-4)', alignItems: 'start' }}>

        {/* ── Left: Entry Form ── */}
        <div className="animate-fade-up delay-1">
          <div className="card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-3)' }}>
              Dish Details
            </div>

            {/* Dish Name with Autocomplete */}
            <div style={{ marginBottom: 'var(--sp-3)', position: 'relative' }} ref={dropdownRef}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                Dish Name *
              </label>
              <input
                ref={inputRef}
                type="text"
                value={dishName}
                onChange={e => handleNameChange(e.target.value)}
                onFocus={() => { if (suggestions.length) setShowDropdown(true); }}
                placeholder="e.g. Butter Chicken, Burger, Paneer Tikka…"
                autoComplete="off"
                style={{ width: '100%' }}
              />
              <SuggestionDropdown
                suggestions={suggestions}
                onSelect={handleSelectDish}
                visible={showDropdown}
              />
              {dishName.trim().length >= 2 && suggestions.length === 0 && !selectedDish && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                  No match found — you can still enter details manually.
                </div>
              )}
            </div>

            {/* Auto-fetched Ingredients Display */}
            {selectedDish && (
              <div className="animate-fade-in" style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-2)',
                marginBottom: 'var(--sp-3)',
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Auto-Fetched Ingredients
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedDish.ingredients.map(ing => (
                    <IngredientTag key={ing} name={ing} />
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Estimated food cost:</span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--accent-opp)',
                    fontFamily: 'var(--font-display)',
                  }}>
                    ₹{selectedDish.estimatedCost}
                  </span>
                  {costEdited && parseFloat(cost) !== selectedDish.estimatedCost && (
                    <span style={{ fontSize: 11, color: 'var(--accent-info)' }}>
                      → edited to ₹{cost}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Form Fields - 2-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. Mains, Starters"
                  list="category-list"
                  style={{ width: '100%' }}
                />
                <datalist id="category-list">
                  {dbCategories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              {/* Selling Price */}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 350"
                  min="0"
                  step="10"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Food Cost (Editable) */}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Food Cost (₹)
                  {selectedDish && (
                    <span style={{ color: 'var(--accent-info)', marginLeft: 4, fontSize: 10 }}>
                      auto-filled · editable
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={cost}
                    onChange={e => handleCostChange(e.target.value)}
                    placeholder={selectedDish ? `~${selectedDish.estimatedCost}` : 'e.g. 120'}
                    min="0"
                    step="5"
                    style={{
                      width: '100%',
                      borderColor: costEdited ? 'var(--accent-info)' : undefined,
                    }}
                  />
                  {selectedDish && costEdited && parseFloat(cost) !== selectedDish.estimatedCost && (
                    <button
                      onClick={() => { setCost(String(selectedDish.estimatedCost)); setCostEdited(false); }}
                      title="Reset to estimated cost"
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: '2px 4px',
                      }}
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              {/* Units Sold */}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Units Sold *
                </label>
                <input
                  type="number"
                  value={unitsSold}
                  onChange={e => setUnitsSold(e.target.value)}
                  placeholder="e.g. 150"
                  min="1"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Prep Time */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Prep Time (minutes) — optional
                </label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={e => setPrepTime(e.target.value)}
                  placeholder="e.g. 15"
                  min="0"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Cost insight */}
            {price && cost && parseFloat(price) > 0 && parseFloat(cost) > 0 && (
              <div className="animate-fade-in" style={{
                marginTop: 'var(--sp-2)',
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                display: 'flex',
                gap: 'var(--sp-3)',
                flexWrap: 'wrap',
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Margin: </span>
                  <span style={{ color: 'var(--accent-opp)', fontWeight: 500 }}>
                    ₹{(parseFloat(price) - parseFloat(cost)).toFixed(0)}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Food Cost %: </span>
                  <span style={{
                    color: (parseFloat(cost) / parseFloat(price)) * 100 > 35 ? 'var(--accent-warn)' : 'var(--text-primary)',
                    fontWeight: 500,
                  }}>
                    {((parseFloat(cost) / parseFloat(price)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Margin %: </span>
                  <span style={{ fontWeight: 500 }}>
                    {(((parseFloat(price) - parseFloat(cost)) / parseFloat(price)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Add to Queue Button */}
            <button
              className="btn btn-primary"
              onClick={handleAddToQueue}
              style={{ width: '100%', justifyContent: 'center', height: 44, marginTop: 'var(--sp-3)' }}
            >
              + Add to queue
            </button>
          </div>
        </div>

        {/* ── Right: Queue & Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>

          {/* Item Queue */}
          <div className="card animate-fade-up delay-2" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: 'var(--sp-2) var(--sp-3)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Item Queue
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {queue.length} item{queue.length !== 1 ? 's' : ''}
              </div>
            </div>

            {queue.length === 0 ? (
              <div style={{ padding: 'var(--sp-4)', textAlign: 'center' }}>
                <div style={{ fontSize: 24, color: 'var(--text-disabled)', marginBottom: 8 }}>◇</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  No items queued yet
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 4 }}>
                  Add dishes using the form, then commit them all at once.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {queue.map((item, i) => (
                    <QueuedItemRow key={item.name} item={item} index={i} onRemove={handleRemoveFromQueue} />
                  ))}
                </div>
                <div style={{ padding: 'var(--sp-2) var(--sp-3)', borderTop: '1px solid var(--border)' }}>
                  {committed ? (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(122,157,122,0.08)',
                      border: '1px solid rgba(122,157,122,0.2)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12,
                      color: 'var(--accent-opp)',
                      textAlign: 'center',
                    }}>
                      ✓ Items saved. View analysis in Profitability or Intelligence.
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleCommit}
                      disabled={uploading}
                      style={{ width: '100%', justifyContent: 'center', height: 44 }}
                    >
                      {uploading ? 'Saving…' : `→ Save ${queue.length} item${queue.length > 1 ? 's' : ''} to menu`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="card animate-fade-up delay-3">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
              How It Works
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {[
                { step: '1', text: 'Type a dish name — ingredients and estimated cost are fetched automatically from our database.' },
                { step: '2', text: 'Review and edit the food cost if it differs from the estimate for your kitchen.' },
                { step: '3', text: 'Set selling price, units sold, and add to queue. Repeat for more items.' },
                { step: '4', text: 'Commit the queue — items are saved and scored via Menu DNA\'s analytics engine.' },
              ].map(({ step, text }) => (
                <div key={step} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: '1px solid var(--border-strong)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}>
                    {step}
                  </div>
                  <div style={{ color: 'var(--text-muted)', lineHeight: 1.6, paddingTop: 2 }}>
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick navigation */}
          {currentMenu.length > 0 && (
            <div className="card animate-fade-up delay-4" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {currentMenu.length} items in your menu
                </div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ padding: '4px 12px', fontSize: 11 }}
                onClick={() => navigate('/profitability')}
              >
                View analysis →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
