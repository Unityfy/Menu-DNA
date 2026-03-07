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
- **Auth + Database**: Firebase (Auth + Firestore)
- **Charts**: Recharts
- **CSV Parsing**: PapaParse
- **Styling**: Custom CSS design system (monochrome dark mode)

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Firebase project (free Spark plan works)

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → New project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** → Start in production mode
4. Register a **Web app** → copy the config
5. Deploy Firestore rules: `firebase deploy --only firestore:rules`

### 3. Local Development

```bash
# Clone / download the project
cd menu-dna

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# → Fill in your Firebase credentials in .env

# Start development server
npm run dev
# → Opens at http://localhost:5173
```

### 4. First Run

1. Create an account at `/auth`
2. Go to **Data Upload** → drag & drop your CSV or click "Load sample data"
3. Click **Ingest dishes** to save to Firestore
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

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# Settings → Environment Variables → add all VITE_FIREBASE_* vars
```

### Option B: Firebase Hosting

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login and init (choose hosting, select 'dist' as public dir)
firebase login
firebase init

# Build and deploy
npm run build
firebase deploy
```

> ⚠️ **Important**: Add your Vercel/Firebase Hosting domain to Firebase Auth's authorized domains.  
> Console → Authentication → Settings → Authorized domains → Add domain

---

## Project Structure

```
menu-dna/
├── src/
│   ├── lib/
│   │   └── menuAnalytics.js      # Core analytics engine (BCG, scoring, recommendations)
│   ├── hooks/
│   │   ├── useAuth.jsx           # Firebase auth state + login/register/logout
│   │   └── useRestaurant.jsx     # Firestore data management + analytics pipeline
│   ├── pages/
│   │   ├── AuthPage.jsx          # Login / Registration
│   │   ├── DashboardPage.jsx     # Overview + KPIs + weekly recommendations
│   │   ├── UploadPage.jsx        # CSV drag-drop + ingestion
│   │   ├── ProfitabilityPage.jsx # Sortable dish table + bar charts
│   │   └── IntelligencePage.jsx  # BCG scatter matrix + scoring rings + category breakdown
│   ├── components/
│   │   ├── Layout.jsx            # App shell wrapper
│   │   ├── Sidebar.jsx           # Navigation
│   │   ├── ChartTooltip.jsx      # Custom Recharts tooltips
│   │   └── Toast.jsx             # Notification system
│   ├── firebase.js               # Firebase initialization
│   ├── App.jsx                   # Router + auth guards
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Design system + global styles
├── firestore.rules               # Firestore security rules
├── firebase.json                 # Firebase Hosting config
├── .env.example                  # Environment variable template
└── vite.config.js
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
