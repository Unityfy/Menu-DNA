# Menu DNA 🧬

**Restaurant menu intelligence platform** — transforms static menus into data-driven decision systems.

---

## What It Does


Menu DNA ingests your POS export CSV and gives you:

| Feature | Description |
|---------|-------------|
| **Profitability Dashboard** | Dish-level contribution margins, food cost %, total profit, sortable table with inline visualizations |
| **BCG Matrix** | Interactive scatter plot classifying dishes into Stars, Plowhorses, Puzzles, Dogs |
| **Intelligence Scoring** | 0–100 composite score per dish (margin + popularity + cost + efficiency) |
| **Weekly Recommendations** | Auto-generated action items: what to reprice, promote, or remove |

Advisory-only — read-only ingestion, no automated changes to your POS.

---

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **CSV Parsing**: PapaParse
- **Payments**: Razorpay
- **Styling**: Custom CSS design system (monochrome dark mode)
- **Deployment**: Vercel

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### 2. Supabase Setup

1. Go to [Supabase](https://supabase.com) → Create a new project
2. In SQL Editor, run the table creation scripts from `SUPABASE_MIGRATION.md`
3. Enable Row Level Security (RLS) with provided policies
4. Get **Project URL** and **Anon Key** from Settings → API
5. Optional: Deploy backend functions (see `SUPABASE_MIGRATION.md`)

### 3. Local Development

```bash
# Clone / download the project
cd menu-dna

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
# → Fill in your Supabase credentials in .env.local

# Start development server
npm run dev
# → Opens at http://localhost:3000
```

### 4. First Run

1. Create an account at `/auth`
2. Go to **Data Upload** → drag & drop your CSV or click "Load sample data"
3. Click **Ingest dishes** to save to Supabase
4. Explore **Profitability** and **Intelligence** pages

---

## CSV Format

Your POS export should have these columns (names are flexible, common aliases auto-mapped):

```csv
dish_name,category,price,cost,units_sold,prep_time_minutes
Grilled Chicken,Mains,480,160,220,12
Paneer Tikka,Starters,320,95,180,8
...
```

**Required:** `dish_name` (or `name`), `price`, `cost`, `units_sold`  
**Optional:** `category`, `prep_time_minutes`

**Auto-mapped aliases:**
- `name`, `item`, `item_name` → dish_name
- `selling_price`, `sell_price` → price
- `food_cost`, `cogs`, `ingredient_cost` → cost
- `quantity`, `qty`, `qty_sold`, `sales_volume` → units_sold
- `prep_time`, `prep`, `time` → prep_time_minutes

---

## Deployment

### 🚀 Vercel (Recommended)

For step-by-step instructions, see [**VERCEL_DEPLOYMENT.md**](VERCEL_DEPLOYMENT.md).

Quick start:
```bash
# Use Vercel dashboard for easiest setup
# 1. Push code to GitHub
# 2. Import project at vercel.com/dashboard
# 3. Add environment variables
# 4. Deploy!
```

### Alternative: Other Platforms

**Netlify, Railway, Render, etc.**
```bash
# Build the app
npm run build

# Output is in 'dist/' folder
# Deploy this folder to your platform
```

> **Note:** After deployment, add your live domain to Supabase Auth → URL Configuration → Redirect URLs

---

## Documentation

- 📖 [**Supabase Migration Guide**](SUPABASE_MIGRATION.md) - How to set up database and backend
- 🚀 [**Vercel Deployment Guide**](VERCEL_DEPLOYMENT.md) - Step-by-step Vercel setup
- 📋 [**Migration Summary**](MIGRATION_SUMMARY.md) - Checklist for Firebase → Supabase migration

---

## Project Structure

```
menu-dna/
├── src/
│   ├── lib/
│   │   ├── menuAnalytics.js      # Core analytics engine (BCG, scoring, recommendations)
│   │   ├── posParser.js          # CSV parsing & normalization
│   │   └── razorpay.js           # Payment processing
│   ├── hooks/
│   │   ├── useAuth.jsx           # Supabase auth state + login/register/logout
│   │   ├── useRestaurant.jsx     # Database data management + analytics pipeline
│   │   └── useBilling.jsx        # Subscription & payment handling
│   ├── pages/
│   │   ├── AuthPage.jsx          # Login / Registration
│   │   ├── DashboardPage.jsx     # Overview + KPIs + recommendations
│   │   ├── ProfitabilityPage.jsx # Sortable dish table + bar charts
│   │   ├── IntelligencePage.jsx  # BCG scatter matrix + scoring rings + category breakdown
│   │   ├── UploadPage.jsx        # CSV drag-drop + ingestion
│   │   └── BillingPage.jsx       # Subscription management
│   ├── components/
│   │   ├── Layout.jsx            # App shell wrapper
│   │   ├── Sidebar.jsx           # Navigation
│   │   ├── ChartTooltip.jsx      # Custom Recharts tooltips
│   │   └── Toast.jsx             # Notification system
│   ├── supabase.js               # Supabase initialization
│   ├── App.jsx                   # Router + auth guards
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Design system + global styles
├── functions/                    # Legacy Firebase Cloud Functions (deprecated)
├── .env.example                  # Environment variable template
├── .vercelignore                 # Files to exclude from Vercel
├── vercel.json                   # Vercel deployment configuration
├── vite.config.js                # Vite build configuration
├── SUPABASE_MIGRATION.md         # Database & auth setup guide
├── MIGRATION_SUMMARY.md          # Migration checklist
└── VERCEL_DEPLOYMENT.md          # Vercel deployment guide
```

---

## BCG Matrix Logic

| Classification | Popularity | Profitability | Action |
|---------------|-----------|--------------|--------|
| ⭐ **Star**    | High       | High         | Maintain, upsell complements |
| 🔵 **Puzzle** | Low        | High         | Promote aggressively |
| 🟡 **Plowhorse** | High    | Low          | Reprice or reformulate |
| ⬛ **Dog**    | Low        | Low          | Review / remove |

Thresholds are dynamic — calculated against dataset averages, not hardcoded.

---

## Design System

Dark monochrome with semantic accents:

| Token | Value | Use |
|-------|-------|-----|
| `--bg-base` | `#0a0a0a` | Page background |
| `--bg-surface` | `#1a1a1a` | Cards |
| `--accent-warn` | `#d4a574` | Warnings, plowhorses |
| `--accent-opp` | `#7a9d7a` | Opportunities, stars |
| `--accent-info` | `#7a8a9d` | Info, puzzles |

Typography: **Syne** (display/headings) + **DM Mono** (data/body)


---

## Roadmap (Post-MVP)

- [ ] Multi-outlet support (restaurant switching)
- [ ] Weekly email digest of recommendations  
- [ ] Time-series analysis (upload multiple weeks, track trends)
- [ ] Drag-and-drop menu position editor
- [ ] Role-based access (owner vs. manager view)
- [ ] POS API integrations (Petpooja, UrbanPiper, etc.)

---

## License

Proprietary. All rights reserved.
