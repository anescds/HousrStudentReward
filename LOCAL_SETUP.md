# Local Setup for Housr Rewards App

This guide explains how to run the Housr Rewards app using a local mock API server instead of Supabase.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- ElevenLabs API key (for voice features) - Get one at [elevenlabs.io](https://elevenlabs.io/)

## Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

This will install all required dependencies, including Express for the local server.

2. Set up environment variables:

Create a `.env` file in the root directory. You can copy the example file:

```bash
# Copy the example environment file
cp .env.example .env
```

Then edit the `.env` file and add your ElevenLabs API key:

```env
# Backend API URL (defaults to http://localhost:3001 if not set)
VITE_API_URL=http://localhost:3001

# ElevenLabs API Key (required for voice features)
# Get your API key from https://elevenlabs.io/
# 1. Sign up or log in at https://elevenlabs.io/
# 2. Go to your profile/settings
# 3. Copy your API key
# 4. Paste it below (replace 'your_elevenlabs_api_key_here')
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**Important**: 
- The ElevenLabs API key is required for the AI roast voice playback feature
- Without it, the voice button will show an error when clicked
- The API key should start with `sk_` and be a long string of characters
- Keep your `.env` file private and never commit it to version control

## Running the App

We've set up a convenient script that starts both the frontend and backend servers simultaneously:

```bash
npm run start
# or
yarn start
```

This will:
1. Start the mock API server on port 3001
2. Start the Vite development server for the frontend

## Running Servers Separately

If you prefer to run the servers in separate terminals:

1. Start the mock API server:

```bash
npm run server
# or
yarn server
```

2. In another terminal, start the frontend:

```bash
npm run dev
# or
yarn dev
```

## How It Works

- The mock API server (`server.js`) provides endpoints that mimic the Supabase backend
- The frontend API client (`src/api/index.ts`) has been configured to use the local server
- No Supabase account or configuration is needed

## Available Endpoints

- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create a new payment
- `GET /api/rewards` - Get rewards balance
- `GET /api/partners` - Get all partners
- `GET /api/perks` - Get all perks
- `POST /api/roast` - Generate an AI financial roast

## Mock Data

The server includes pre-populated mock data for:
- User account
- Payments
- Rewards balance
- Partners
- Perks

You can modify the mock data in `server.js` if needed.

## Troubleshooting

If you encounter any issues:

1. Make sure both servers are running
2. Check the browser console for errors
3. Check the terminal running the mock server for any error messages
4. Ensure port 3001 is not being used by another application

