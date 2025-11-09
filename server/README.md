# Rent Rewards API Server

Express.js API server for the Rent Rewards application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Add your `GEMINI_API_KEY` to the `.env` file.
   
   To get a Gemini API key:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key and add it to your `.env` file

## Running

- Development mode (with auto-reload):
```bash
npm run dev
```

- Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

- `POST /api/generate-roast` - Generate an AI roast based on spending data
- `GET /api/health` - Health check endpoint

