# Housr Helper - Student Rewards Platform

A comprehensive student rewards platform that combines financial tracking, cashback rewards, and AI-powered financial insights. Built with React, TypeScript, and Express.js.

## 🚀 Features

### Student Rewards App
- **Automatic Cashback**: 5% cashback on all transactions
- **Real-time Balance Updates**: WebSocket-powered live balance tracking
- **AI Financial Roast**: Gemini-powered humorous analysis of spending habits with ElevenLabs voice narration
- **Transaction History**: Complete wallet view with all past transactions
- **Perks System**: General perks and partner-specific deals
- **12-Month Simulation**: Spending simulation with threshold alerts

### Partner Dashboard
- **Deal Management**: Create, view, and manage partner deals
- **Real-time Analytics**: Track redemptions and view statistics
- **Dynamic Deal Creation**: Add new deals that appear instantly in student app

## 🏗️ Architecture

The platform consists of three main components:

1. **Student Rewards App** (Frontend: React + TypeScript, Port: 5173)
2. **Partner Dashboard** (Frontend: React + TypeScript, Port: 9090)
3. **Express.js Backend API** (Port: 3001)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- ElevenLabs API key (for voice features) - Get one at [elevenlabs.io](https://elevenlabs.io/)
- Google Gemini API key (for AI roasts) - Get one at [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd rent-rewards-nest-2aa7d631
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   # Backend API URL
   VITE_API_URL=http://localhost:3001
   
   # ElevenLabs API Key (required for voice features)
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```
   
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🚀 Running the Application

### Option 1: Run Everything Together

```bash
npm run start
```

This will start both the backend server and frontend development server.

### Option 2: Run Servers Separately

**Terminal 1 - Backend Server:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Dashboard (optional):**
```bash
cd dashboard
npm install
npm run dev
```

## 📁 Project Structure

```
/
├── server/                 # Express.js backend
│   ├── index.js           # Main server file
│   ├── data/
│   │   └── perks.js       # Static perks and partners data
│   └── public/
│       └── images/
│           └── partners/   # Partner logo images
├── src/                    # Student rewards app (React)
│   ├── components/        # React components
│   ├── contexts/          # React contexts (Simulation, WebSocket)
│   ├── lib/               # Utility libraries (API client, ElevenLabs)
│   ├── pages/             # Page components
│   └── App.tsx            # Main app component
├── dashboard/             # Partner dashboard app (React)
│   └── src/
│       ├── pages/         # Dashboard pages
│       └── lib/          # Dashboard API client
└── package.json
```

## 🎯 Key Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, Socket.IO
- **Styling**: Tailwind CSS with custom "brutal" design system
- **UI Components**: shadcn-ui
- **State Management**: React Context API
- **Routing**: React Router DOM
- **AI Services**: 
  - Google Gemini 2.5 Flash (financial roasts)
  - ElevenLabs (text-to-speech voice narration)

## 🔑 API Endpoints

### User Endpoints (`/api/user/`)
- `POST /api/user/login` - User authentication
- `GET /api/user/perks` - Get general perks
- `GET /api/user/partners` - Get all partners
- `GET /api/user/partners/:partnerSlug/perks` - Get partner-specific deals
- `POST /api/user/transactions` - Create new transaction (adds 5% cashback)
- `GET /api/user/balance` - Get user's reward balance
- `GET /api/user/wallet` - Get all user transactions
- `POST /api/user/redeem-perk` - Redeem a general perk
- `POST /api/user/:partner/redeem-perks` - Track partner perk redemption
- `POST /api/user/generate-roast` - Generate AI financial roast
- `GET /api/user/start-test` - Start 12-month simulation test
- `GET /api/user/end-test` - Stop running simulation test

### Dashboard Endpoints (`/api/dash/`)
- `POST /api/dash/login` - Dashboard authentication
- `GET /api/dash/redeems` - Get redemption statistics
- `GET /api/dash/partner` - Get partner information
- `GET /api/dash/deals` - Get partner deals with analytics
- `GET /api/dash/stats` - Get overall dashboard statistics
- `POST /api/dash/add-perk` - Add new deal/perk

## 🔐 Default Credentials

### Student App
- **User ID**: `user`
- **Password**: `password`
- **Name**: `Jack`

### Dashboard
- **Dashboard ID**: `admin`
- **Password**: `admin`
- **Name**: `aldi`

## 🎨 Features in Detail

### AI Financial Roast
- Uses Google Gemini 2.5 Flash API for analysis
- Provides humorous but insightful financial commentary
- Includes ElevenLabs voice narration with expressive, comedic delivery
- Threshold detection at £1,300 (regular) and £1,500 (emergency)

### Cashback System
- All transactions automatically receive 5% cashback
- Cashback is added to user balance immediately
- Real-time balance updates via WebSocket

### Simulation Test
- 12-month spending simulation (January - December 2025)
- 4 seconds per month update interval
- 10 transactions per month (1 rent + 9 other)
- Automatic threshold alerts for spending levels

## 📚 Documentation

- [Local Setup Guide](./LOCAL_SETUP.md) - Detailed setup instructions
- [ElevenLabs Setup](./ELEVENLABS_SETUP.md) - Voice feature configuration
- [Project Context](./context.md) - Comprehensive project documentation

## 🐛 Troubleshooting

1. **Port already in use**: Ensure ports 3001, 5173, and 9090 are available
2. **API key errors**: Verify your `.env` files are properly configured
3. **WebSocket connection issues**: Ensure the backend server is running
4. **Voice feature not working**: Check that `VITE_ELEVENLABS_API_KEY` is set in your root `.env` file

## 📝 Development

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run start` - Start both backend and frontend (if configured)
- `npm run lint` - Run ESLint

### Backend Scripts (in `server/` directory)
- `npm run dev` - Start backend with auto-reload
- `npm start` - Start backend in production mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Authors

Housr Helper Development Team

---

For more detailed information, see [context.md](./context.md)
