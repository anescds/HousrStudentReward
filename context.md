# Housr Helper - Project Context

## Project Overview

Housr Helper is a student rewards platform that combines financial tracking, cashback rewards, and AI-powered financial insights. The platform consists of:

1. **Student Rewards App** (Frontend: React + TypeScript, Port: 5173)
2. **Partner Dashboard** (Frontend: React + TypeScript, Port: 9090)
3. **Express.js Backend API** (Port: 3001)

## Architecture

### Backend (`server/`)
- **Framework**: Express.js with Socket.IO for WebSocket support
- **Authentication**: Session-based using in-memory dictionaries
- **Data Storage**: In-memory dictionaries (designed to scale to database)
- **AI Integration**: Google Gemini 2.5 Flash API for financial roasts
- **File Structure**:
  - `server/index.js` - Main server file with all endpoints
  - `server/data/perks.js` - Static perks and partners data
  - `server/public/images/partners/` - Partner logo images

### Frontend (`src/`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom "brutal" design system
- **State Management**: React Context API (SimulationContext, WebSocketContext)
- **Routing**: React Router DOM
- **Icons**: Lucide React

### Dashboard (`dashboard/`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Port**: 9090 (separate from main app)
- **Features**: Partner analytics, deal management, redemption tracking

## Key Features

### Student Rewards App
- **Transaction Tracking**: Automatic 5% cashback on all transactions
- **Balance Management**: Real-time balance updates via WebSocket
- **Perks System**: General perks and partner-specific deals
- **AI Financial Roast**: Gemini-powered analysis of spending habits
- **Simulation Engine**: 12-month spending simulation with threshold alerts
- **Transaction History**: Complete wallet view with all past transactions

### Partner Dashboard
- **Deal Management**: Create, view, and manage partner deals
- **Analytics**: Real-time redemption tracking and view statistics
- **Statistics**: Total deals, active deals, views, and redemptions
- **Dynamic Deal Creation**: Add new deals that appear instantly in student app

## Authentication System

### User Authentication
- **Endpoint**: `POST /api/user/login`
- **Default User**: `userid: "user"`, `password: "password"`, `name: "Jack"`
- **Session Storage**: In-memory `sessions` dictionary
- **Auto-login**: Frontend automatically calls login on page load/refresh

### Dashboard Authentication
- **Endpoint**: `POST /api/dash/login`
- **Default User**: `dashid: "admin"`, `password: "admin"`, `name: "aldi"`
- **Session Storage**: In-memory `dashboardSessions` dictionary
- **Auto-login**: Dashboard automatically calls login on page load/refresh

## API Endpoints

### User Endpoints (`/api/user/`)
- `POST /api/user/login` - User authentication
- `GET /api/user/perks` - Get general perks (requires auth)
- `GET /api/user/partners` - Get all partners (requires auth)
- `GET /api/user/partners/:partnerSlug/perks` - Get partner-specific deals (requires auth)
- `POST /api/user/transactions` - Create new transaction (requires auth, adds 5% cashback)
- `GET /api/user/balance` - Get user's reward balance (requires auth)
- `GET /api/user/wallet` - Get all user transactions (requires auth)
- `POST /api/user/redeem-perk` - Redeem a general perk (requires auth, deducts cost)
- `POST /api/user/:partner/redeem-perks` - Track partner perk redemption (requires auth)
- `POST /api/user/generate-roast` - Generate AI financial roast (requires Gemini API key)
- `GET /api/user/start-test` - Start 12-month simulation test (requires auth)
- `GET /api/user/end-test` - Stop running simulation test (requires auth)

### Dashboard Endpoints (`/api/dash/`)
- `POST /api/dash/login` - Dashboard authentication
- `GET /api/dash/redeems` - Get redemption statistics for partner (requires dashboard auth)
- `GET /api/dash/partner` - Get partner information (requires dashboard auth)
- `GET /api/dash/deals` - Get partner deals with analytics (requires dashboard auth)
- `GET /api/dash/stats` - Get overall dashboard statistics (requires dashboard auth)
- `POST /api/dash/add-perk` - Add new deal/perk (requires dashboard auth)

## Data Structures

### Backend In-Memory Dictionaries
```javascript
// User authentication
users = { 'user': { userId, name, password } }
sessions = { token: { userId, name, createdAt } }

// Dashboard authentication
dashboardUsers = { 'admin': { dashId, name, password } }
dashboardSessions = { token: { dashId, name, createdAt } }

// Financial data
transactions = { userId: [transaction objects...] }
balances = { userId: balance } // Default: 'user' starts at 56.75

// Partner data
perkRedemptions = { partnerSlug: { perkId: count } }
perkViews = { partnerSlug: { perkId: viewCount } } // Constant values
dynamicDeals = { partnerSlug: [deal objects...] }

// Test simulation tracking
testSimulations = { userId: { isRunning, timeoutId, stopFlag } }
```

## WebSocket Events

### Backend → Frontend Events
- `refresh-wallet` - Trigger frontend to refresh transactions from `/api/user/wallet`
- `refresh-balance` - Trigger frontend to refresh balance from `/api/user/balance`
- `new-deal-added` - Notify when new deal is added (includes partner and deal data)
- `perk-redeemed` - Notify when partner perk is redeemed (includes partner, perkId, count)
- `test-month-update` - Notify during simulation when month updates (includes month, index, total)
- `trigger-ai-roast` - Notify when spending threshold exceeded (includes threshold type)
- `test-complete` - Notify when simulation completes
- `test-stopped` - Notify when simulation is stopped

## Simulation Test Feature

### Configuration
- **Duration**: 12 months (January - December 2025)
- **Update Interval**: 4 seconds per month
- **Transactions per Month**: 10 (1 rent + 9 other)
- **Rent Amount**: Constant £450/month

### Spending Progression
- **Months 1-3** (Jan-Mar): Low spending (£200, £250, £300)
- **Month 4** (April): Reaches regular roast threshold (£1,300)
- **Month 5** (May): Reaches emergency roast threshold (£1,500)
- **Months 6-12** (Jun-Dec): High spending (£1,500-£2,000)

### Transaction Generation
- **Rent**: Always £450 on the 15th of each month
- **Other Transactions**: Random values between £10-£300
- **Distribution**: Weighted towards smaller values, with 2-3 high-value transactions (£200-£300) per month
- **Variety**: All values are unique and varied

### Thresholds
- **Regular Roast**: £1,300 - Shows financial reality check alert
- **Emergency Roast**: £1,500 - Shows emergency alert (more urgent)

## Frontend Components

### Key Pages
- `src/pages/Index.tsx` - Home page with balance, quick actions, AI roast, recent payments
- `src/pages/Perks.tsx` - All perks and partners page
- `src/pages/AldiDeals.tsx` - Dynamic partner deals page (works for any partner)
- `src/pages/Payments.tsx` - Full transaction history
- `src/pages/Profile.tsx` - User profile with simulation controls
- `src/pages/Infographics.tsx` - Analytics/infographics page

### Key Components
- `src/components/AIRoastCard.tsx` - AI roast generation and display (includes voice playback)
- `src/components/VoicePlayer.tsx` - ElevenLabs voice playback component for AI roasts
- `src/components/PerksSection.tsx` - Perks section for home page
- `src/components/PartnerPerkCard.tsx` - Partner card with cycling deals
- `src/components/PaymentDialog.tsx` - Transaction creation dialog
- `src/components/RecentPayments.tsx` - Recent payments display

### Contexts
- `src/contexts/SimulationContext.tsx` - Global state for payments/transactions
- `src/contexts/WebSocketContext.tsx` - WebSocket connection management

### API Client
- `src/lib/api.ts` - Centralized API client with all endpoint functions
- `src/lib/elevenlabs.ts` - ElevenLabs text-to-speech client
- `src/lib/iconMap.ts` - Icon name to Lucide React component mapping

## Dashboard Components

### Key Pages
- `dashboard/src/pages/PartnerDashboard.tsx` - Main dashboard with statistics
- `dashboard/src/pages/PartnerDeals.tsx` - Deal management
- `dashboard/src/pages/PartnerAnalytics.tsx` - Analytics and charts
- `dashboard/src/pages/CreateDeal.tsx` - Create new deal form
- `dashboard/src/pages/EditDeal.tsx` - Edit deal (currently read-only)

### API Client
- `dashboard/src/lib/api.ts` - Dashboard-specific API client

## Environment Variables

### Backend (`.env`)
```
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3001
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**Important**: The ElevenLabs API key is required for the voice feature. Get your API key from [ElevenLabs](https://elevenlabs.io/) and add it to your `.env` file.

## Important Implementation Details

### Cashback System
- All transactions automatically receive 5% cashback
- Cashback is added to user balance immediately
- Balance is stored in `balances[userId]` dictionary

### Perk Redemption
- General perks: Deducts cost from balance, returns error if insufficient funds
- Partner perks: Tracks redemption count in `perkRedemptions` dictionary
- Both show success/error banners in UI

### View Counts
- View counts are constant (initialized once on server start)
- Aldi: Total views always sum to 10,000 (distributed across deals)
- Other partners: Seed-based constant values (100-1000 range)

### Dynamic Deals
- Deals added via dashboard are stored in `dynamicDeals[partnerSlug]` array
- Combined with static deals when serving to student app
- New deals have zero redemptions by default
- Views are calculated/redistributed when new deals are added

### WebSocket Real-time Updates
- Student app polls partner deals page every 2 seconds (can be replaced with WebSocket)
- Dashboard polls analytics every 2 seconds for real-time updates
- Balance and wallet refresh automatically via WebSocket events

### AI Roast Feature
- Uses Google Gemini 2.5 Flash API
- Analyzes balance, monthly earned, and recent payments
- Provides humorous but insightful financial commentary
- Threshold detection shows alert but doesn't auto-generate (user must click button)
- **Voice Playback**: Integrated with ElevenLabs AI voice for text-to-speech conversion
  - Users can listen to the AI roast using the VoicePlayer component
  - Requires `VITE_ELEVENLABS_API_KEY` environment variable

## File Structure

```
/
├── server/
│   ├── index.js              # Main Express server
│   ├── data/
│   │   └── perks.js          # Static perks and partners data
│   ├── public/
│   │   └── images/
│   │       └── partners/     # Partner logo images
│   └── package.json
├── src/                       # Student rewards app
│   ├── pages/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   └── App.tsx
├── dashboard/                 # Partner dashboard app
│   └── src/
│       ├── pages/
│       └── lib/
└── package.json
```

## Running the Project

### Backend
```bash
cd server
npm install
npm run dev  # Development mode with auto-reload
# or
npm start    # Production mode
```

### Student Rewards App
```bash
npm install
npm run dev  # Runs on localhost:5173
```

### Dashboard
```bash
cd dashboard
npm install
npm run dev  # Runs on localhost:9090
```

## Recent Changes

1. **WebSocket Integration**: Added Socket.IO for real-time updates
2. **Simulation Test**: Created 12-month spending simulation with threshold alerts
3. **Dynamic Deal Management**: Partners can add deals that appear instantly in student app
4. **AI Roast Integration**: Gemini AI for financial analysis
5. **Balance Refresh System**: Automatic balance updates via WebSocket
6. **Threshold Detection**: Automatic alerts at £1,300 and £1,500 spending levels
7. **Transaction Variety**: Improved transaction generation with varied amounts (10-300 range)

## Notes

- All authentication uses in-memory sessions (lost on server restart)
- Frontend auto-login ensures fresh sessions on every page load
- Dashboard and student app use separate authentication systems
- Partner images are served statically from `server/public/images/partners/`
- Icon system uses string names mapped to Lucide React components
- The simulation test clears existing transactions before starting
- Balance starts at £56.75 for the default 'user' account

