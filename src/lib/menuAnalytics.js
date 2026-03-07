/**
 * Menu DNA — Analytics Engine
 * Core business logic: profitability scoring, BCG classification,
 * and menu intelligence scoring.
 */

// Re-export normalizeRow from posParser for backward compatibility
export { normalizeRow as normalizeCSVRow } from './posParser.js';

// ─── Profitability Metrics ───────────────────────────────────────────────────

export function computeDishMetrics(dish) {
  const {
    name, category, price, cost, unitsSold, prepTime,
  } = dish;

  const contributionMargin     = price - cost;                   // $ profit per dish
  const contributionMarginPct  = price > 0 ? (contributionMargin / price) * 100 : 0;
  const totalRevenue           = price * unitsSold;
  const totalCost              = cost  * unitsSold;
  const totalProfit            = contributionMargin * unitsSold;
  const foodCostPct            = price > 0 ? (cost / price) * 100 : 0;

  // Efficiency: profit per minute of kitchen time (lower prep = more efficient)
  const profitEfficiency = prepTime > 0 ? contributionMargin / prepTime : contributionMargin;

  return {
    name, category, price, cost, unitsSold, prepTime,
    contributionMargin,
    contributionMarginPct,
    totalRevenue,
    totalCost,
    totalProfit,
    foodCostPct,
    profitEfficiency,
  };
}

// ─── BCG Classification ──────────────────────────────────────────────────────

/**
 * Menu BCG Matrix:
 *   STAR:      High popularity + High profitability  → Feature prominently
 *   PLOWHORSE: High popularity + Low profitability   → Reprice or reformulate
 *   PUZZLE:    Low popularity  + High profitability  → Promote aggressively
 *   DOG:       Low popularity  + Low profitability   → Review/remove
 */
export function classifyDishes(dishes) {
  if (!dishes.length) return [];

  const avgPopularity   = dishes.reduce((s, d) => s + d.unitsSold, 0) / dishes.length;
  const avgProfitability= dishes.reduce((s, d) => s + d.contributionMargin, 0) / dishes.length;

  return dishes.map(d => {
    const highPopularity   = d.unitsSold        >= avgPopularity;
    const highProfitability= d.contributionMargin >= avgProfitability;

    let classification, recommendation, urgency;

    if (highPopularity && highProfitability) {
      classification  = 'star';
      recommendation  = 'Feature prominently. Consider upselling complementary items.';
      urgency         = 'maintain';
    } else if (highPopularity && !highProfitability) {
      classification  = 'plowhorse';
      recommendation  = `High demand but low margin. Review ingredient costs or raise price by ₹${Math.ceil((avgProfitability - d.contributionMargin) * 0.7)}.`;
      urgency         = 'optimize';
    } else if (!highPopularity && highProfitability) {
      classification  = 'puzzle';
      recommendation  = 'Good margin, low visibility. Promote via placement, photos, or staff recommendations.';
      urgency         = 'promote';
    } else {
      classification  = 'dog';
      recommendation  = 'Low popularity and low margin. Consider removal or full reformulation.';
      urgency         = 'review';
    }

    // Normalized scores (0–100) for scatter positioning
    const maxUnits  = Math.max(...dishes.map(d => d.unitsSold));
    const maxMargin = Math.max(...dishes.map(d => d.contributionMargin));

    const popularityScore    = maxUnits  > 0 ? (d.unitsSold / maxUnits) * 100 : 0;
    const profitabilityScore = maxMargin > 0 ? (d.contributionMargin / maxMargin) * 100 : 0;

    return {
      ...d,
      classification,
      recommendation,
      urgency,
      popularityScore,
      profitabilityScore,
      avgPopularity,
      avgProfitability,
    };
  });
}

// ─── Intelligence Score ──────────────────────────────────────────────────────

/**
 * Composite intelligence score (0–100) per dish.
 * Weights: profitability 40%, popularity 30%, food cost 20%, efficiency 10%
 */
export function computeIntelligenceScore(dishes) {
  if (!dishes.length) return dishes;

  const maxMargin     = Math.max(...dishes.map(d => d.contributionMargin));
  const maxUnits      = Math.max(...dishes.map(d => d.unitsSold));
  const maxEfficiency = Math.max(...dishes.map(d => d.profitEfficiency));

  return dishes.map(d => {
    const profitScore      = maxMargin    > 0 ? (d.contributionMargin / maxMargin) * 40 : 0;
    const popularityScore  = maxUnits     > 0 ? (d.unitsSold / maxUnits) * 30 : 0;
    const foodCostScore    = (1 - Math.min(d.foodCostPct / 100, 1)) * 20;
    const efficiencyScore  = maxEfficiency > 0 ? (d.profitEfficiency / maxEfficiency) * 10 : 0;

    const intelligenceScore = Math.round(profitScore + popularityScore + foodCostScore + efficiencyScore);

    return { ...d, intelligenceScore };
  });
}

// ─── Portfolio Summary ───────────────────────────────────────────────────────

export function computePortfolioSummary(dishes) {
  if (!dishes.length) return null;

  const totalRevenue  = dishes.reduce((s, d) => s + d.totalRevenue, 0);
  const totalProfit   = dishes.reduce((s, d) => s + d.totalProfit, 0);
  const totalCost     = dishes.reduce((s, d) => s + d.totalCost, 0);
  const totalUnitsSold= dishes.reduce((s, d) => s + d.unitsSold, 0);
  const avgFoodCost   = dishes.length ? dishes.reduce((s, d) => s + d.foodCostPct, 0) / dishes.length : 0;
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const byClass = {
    star:      dishes.filter(d => d.classification === 'star').length,
    plowhorse: dishes.filter(d => d.classification === 'plowhorse').length,
    puzzle:    dishes.filter(d => d.classification === 'puzzle').length,
    dog:       dishes.filter(d => d.classification === 'dog').length,
  };

  const topDish = [...dishes].sort((a, b) => b.intelligenceScore - a.intelligenceScore)[0];

  return {
    totalRevenue,
    totalProfit,
    totalCost,
    totalUnitsSold,
    avgFoodCost,
    overallMargin,
    dishCount: dishes.length,
    byClass,
    topDish,
  };
}

// ─── Weekly Recommendations ──────────────────────────────────────────────────

export function generateRecommendations(dishes) {
  const recs = [];

  // Dogs to review
  const dogs = dishes.filter(d => d.classification === 'dog');
  if (dogs.length > 0) {
    recs.push({
      type: 'review',
      priority: 'high',
      title: `Review ${dogs.length} underperforming item${dogs.length > 1 ? 's' : ''}`,
      body: `${dogs.map(d => d.name).join(', ')} ${dogs.length > 1 ? 'are' : 'is'} generating low revenue and low margins. Consider removal or reformulation.`,
      icon: '⚠',
      accent: 'warn',
    });
  }

  // Plowhorses to reprice
  const plowhorses = dishes.filter(d => d.classification === 'plowhorse');
  if (plowhorses.length > 0) {
    const lostMargin = plowhorses.reduce((s, d) => s + (d.avgProfitability - d.contributionMargin), 0);
    recs.push({
      type: 'reprice',
      priority: 'high',
      title: `Optimize pricing for ${plowhorses.length} high-demand item${plowhorses.length > 1 ? 's' : ''}`,
      body: `${plowhorses.map(d => d.name).join(', ')} ${plowhorses.length > 1 ? 'are' : 'is'} popular but under-priced. Recovering margin could add ₹${Math.round(lostMargin * 10)} weekly.`,
      icon: '↑',
      accent: 'warn',
    });
  }

  // Puzzles to promote
  const puzzles = dishes.filter(d => d.classification === 'puzzle');
  if (puzzles.length > 0) {
    recs.push({
      type: 'promote',
      priority: 'medium',
      title: `Promote ${puzzles.length} hidden gem${puzzles.length > 1 ? 's' : ''}`,
      body: `${puzzles.map(d => d.name).join(', ')} ${puzzles.length > 1 ? 'have' : 'has'} strong margins but low visibility. Move to prime menu placement.`,
      icon: '◆',
      accent: 'info',
    });
  }

  // Stars to feature
  const stars = dishes.filter(d => d.classification === 'star');
  if (stars.length > 0) {
    recs.push({
      type: 'feature',
      priority: 'low',
      title: `Protect your ${stars.length} star${stars.length > 1 ? 's' : ''}`,
      body: `${stars.map(d => d.name).join(', ')} ${stars.length > 1 ? 'are' : 'is'} your strongest performers. Maintain quality consistency and protect from cost increases.`,
      icon: '★',
      accent: 'opp',
    });
  }

  return recs;
}
