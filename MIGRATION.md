# Migration from Supabase to Express.js

This project has been migrated from Supabase Edge Functions to an Express.js API server.

## Changes Made

1. **Created Express.js Server** (`server/` directory)
   - Ported the `generate-roast` Supabase Edge Function to Express.js
   - Server runs on port 3001 by default

2. **Updated Frontend**
   - Created new API client (`src/lib/api.ts`) to replace Supabase client
   - Updated `AIRoastCard` component to use the new API client
   - Removed Supabase dependency from `package.json`

3. **Removed Supabase**
   - Removed `@supabase/supabase-js` from dependencies
   - Supabase integration files (`src/integrations/supabase/`) are no longer used but kept for reference

## Setup Instructions

### Backend Server

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Add your `GEMINI_API_KEY` to the `.env` file
   
   To get a Gemini API key:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key and add it to your `.env` file as `GEMINI_API_KEY=your_key_here`

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001` by default.

### Frontend

1. Install dependencies (if not already done):
```bash
npm install
```

2. Create a `.env` file in the root directory (if needed):
```env
VITE_API_URL=http://localhost:3001
```

3. Start the frontend:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080` by default (as configured in `vite.config.ts`).

## Running Both Servers

You'll need to run both the Express.js server and the Vite dev server:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## API Endpoints

- `POST /api/generate-roast` - Generate an AI roast based on spending data
  - Request body: `{ balance: number, monthlyEarned: number, recentPayments: Array<{merchant: string, amount: number}> }`
  - Response: `{ roast: string }`

- `GET /api/health` - Health check endpoint

## Notes

- The Express.js server is in a separate `server/` directory, which is the recommended approach for keeping frontend and backend code organized
- The server can be run from the same project directory - you just need to `cd` into the `server/` folder
- For production, you may want to configure CORS settings in the Express.js server to only allow requests from your frontend domain

