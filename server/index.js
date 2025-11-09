import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { generalPerks, partners } from './data/perks.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow frontend origins
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Authentication: User dictionary (can be expanded to database later)
const users = {
  'user': {
    userId: 'user',
    name: 'Jack',
    password: 'password' // Not hashed for now, as requested
  }
};

// Session storage (in-memory dictionary, can be expanded to database/Redis later)
const sessions = {};

// Dashboard : Dashboard user dictionary (can be expanded to database later)
const dashboardUsers = {
  'admin': {
    dashId: 'admin',
    name: 'aldi',
    password: 'admin' // Not hashed for now, as requested
  }
};

// Dashboard session storage (in-memory dictionary, can be expanded to database/Redis later)
const dashboardSessions = {};

// Transactions storage (in-memory dictionary, can be expanded to database later)
// Structure: { userId: [transactions...] }
const transactions = {};

// Balance storage (in-memory dictionary, can be expanded to database later)
// Structure: { userId: balance }
const balances = {
  'user': 56.75 // Starting balance for user "user"
};

// Perk redemption counts storage (in-memory dictionary, can be expanded to database later)
// Structure: { partnerSlug: { perkId: count } }
// Example: { 'aldi': { 1: 5, 2: 3, 3: 10 } } means Aldi perk 1 redeemed 5 times, perk 2 redeemed 3 times, etc.
const perkRedemptions = {};

// Perk view counts storage (in-memory dictionary, constant values)
// Structure: { partnerSlug: { perkId: viewCount } }
// Example: { 'aldi': { 1: 150, 2: 200, 3: 120 } } means Aldi perk 1 has 150 views, etc.
const perkViews = {};

// Dynamic deals storage (in-memory dictionary, can be expanded to database later)
// Structure: { partnerSlug: [deals...] }
// Stores deals added via the dashboard that aren't in the static data
const dynamicDeals = {};

// Test simulation tracking (in-memory dictionary, can be expanded to database later)
// Structure: { userId: { isRunning: boolean, timeoutId: NodeJS.Timeout | null, stopFlag: boolean } }
// Tracks running test simulations for each user
const testSimulations = {};

// Initialize perk redemptions with random numbers for each partner's perks
function initializePerkRedemptions() {
  partners.forEach(partner => {
    if (!perkRedemptions[partner.slug]) {
      perkRedemptions[partner.slug] = {};
      partner.deals.forEach(deal => {
        // Generate random number between 10 and 500 for each perk
        perkRedemptions[partner.slug][deal.id] = Math.floor(Math.random() * 491) + 10;
      });
    }
  });
  console.log('Initialized perk redemptions with random data:', perkRedemptions);
}

// Initialize perk views with constant values for each partner's perks
function initializePerkViews() {
  partners.forEach(partner => {
    if (!perkViews[partner.slug]) {
      perkViews[partner.slug] = {};
      
      // Special case: Aldi should have total views of 10,000
      if (partner.slug.toLowerCase() === 'aldi') {
        const totalViews = 10000;
        const dealCount = partner.deals.length;
        const baseViews = Math.floor(totalViews / dealCount);
        const remainder = totalViews % dealCount;
        
        // Distribute views evenly, with remainder distributed to first few deals
        partner.deals.forEach((deal, index) => {
          const views = baseViews + (index < remainder ? 1 : 0);
          perkViews[partner.slug][deal.id] = views;
        });
      } else {
        // For other partners, use seed-based approach
        partner.deals.forEach(deal => {
          // Generate constant view count between 100 and 1000 for each perk
          // Using deal.id as seed to ensure consistency
          const seed = partner.id * 1000 + deal.id;
          const views = 100 + (seed % 900); // Consistent value between 100-1000
          perkViews[partner.slug][deal.id] = views;
        });
      }
    }
  });
  console.log('Initialized perk views with constant data:', perkViews);
}

// Initialize on server start
initializePerkRedemptions();
initializePerkViews();

// Helper function to generate session token
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to generate random transactions for initialization
function generateRandomTransactions(userId) {
  const transactionTypes = ['rent', 'utilities', 'bills', 'payment'];
  const descriptions = {
    'rent': ['Rent Payment', 'Monthly Rent', 'Housing Payment'],
    'utilities': ['Electricity Bill', 'Gas & Water Bill', 'Energy Bill', 'Heating'],
    'bills': ['Internet & Subscriptions', 'Mobile Phone', 'Gym Membership', 'Streaming Services', 'Shopping'],
    'payment': ['Groceries', 'Food Delivery', 'Transport', 'Entertainment']
  };
  
  const randomTransactions = [];
  const now = new Date();
  
  for (let i = 0; i < 5; i++) {
    const daysAgo = Math.floor(Math.random() * 30); // Random date within last 30 days
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const typeDescriptions = descriptions[type];
    const description = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
    const amount = Math.floor(Math.random() * 200) + 20; // Random amount between £20-£220
    const credits = amount * 0.05; // 5% cashback
    
    randomTransactions.push({
      id: `${userId}-${date.getTime()}-${Math.random().toString(36).substring(7)}`,
      userId: userId,
      amount: amount,
      description: description,
      type: type,
      credits: credits,
      date: date.toISOString(),
      merchant: description
    });
  }
  
  // Sort by date, most recent first
  return randomTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Serve static files (partner images)
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to emit events to all connected clients
function emitToClients(eventName, data) {
  io.emit(eventName, data);
  console.log(`Emitted ${eventName} to all clients:`, data);
}

// Authentication endpoint
app.post('/api/user/login', (req, res) => {
  try {
    const { userid, password } = req.body;

    // Validate input
    if (!userid || !password) {
      return res.status(400).json({ error: 'userid and password are required' });
    }

    // Check if user exists
    const user = users[userid];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password (not hashed for now)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    
    // Store session
    sessions[sessionToken] = {
      userId: user.userId,
      name: user.name,
      createdAt: new Date().toISOString()
    };

    console.log('Login successful - Session created:', {
      userId: user.userId,
      sessionToken: sessionToken.substring(0, 30) + '...',
      totalSessions: Object.keys(sessions).length
    });

    // Return session token in JSON response
    res.json({ 
      success: true,
      cookie: sessionToken,
      user: {
        userId: user.userId,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Error in login endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Helper middleware to verify session
function verifySession(req, res, next) {
  // Try multiple ways to get the session token
  // Express lowercases header names, so 'x-auth-cookie' becomes 'x-auth-cookie' (lowercase)
  const authHeader = req.headers.authorization;
  let bearerToken = null;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.replace('Bearer ', '').trim();
  }
  
  // Check for x-auth-cookie header (Express lowercases custom headers)
  const cookieHeader = req.headers['x-auth-cookie'];
  console.log("cookieHeader", cookieHeader);
  
  // Also check body and query for cookie
  const bodyCookie = req.body?.cookie;
  const queryCookie = req.query?.cookie;
  
  const sessionToken = bearerToken || cookieHeader || bodyCookie || queryCookie;
  
  console.log('verifySession - Request details:', {
    method: req.method,
    path: req.path,
    'authorization-header': authHeader ? `${authHeader.substring(0, 30)}...` : 'missing',
    'x-auth-cookie-header': cookieHeader ? `${cookieHeader.substring(0, 30)}...` : 'missing',
    'bearer-token': bearerToken ? `${bearerToken.substring(0, 30)}...` : 'missing',
    'sessionToken-found': sessionToken ? `${sessionToken.substring(0, 30)}...` : 'MISSING',
    'all-header-keys': Object.keys(req.headers).filter(k => k.includes('auth') || k.includes('cookie') || k.includes('authorization')),
    'sessions-in-memory': Object.keys(sessions).length
  });
  
  if (!sessionToken) {
    console.log('verifySession - No session token found in any location, returning 404');
    return res.status(404).json({ error: 'Not found' });
  }

  // Trim the token in case of whitespace
  const trimmedToken = sessionToken.trim();
  const session = sessions[trimmedToken];
  
  if (!session) {
    console.log('verifySession - Session not found. Token received:', trimmedToken.substring(0, 30) + '...');
    console.log('verifySession - Available session keys (first 3):', Object.keys(sessions).slice(0, 3).map(k => k.substring(0, 30) + '...'));
    return res.status(404).json({ error: 'Not found' });
  }

  console.log('verifySession - ✅ Valid session found for user:', session.userId);
  req.session = session;
  next();
}

// Helper middleware to verify dashboard session
function verifyDashboardSession(req, res, next) {
  // Try multiple ways to get the session token
  const authHeader = req.headers.authorization;
  let bearerToken = null;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.replace('Bearer ', '').trim();
  }
  
  // Check for x-auth-cookie header (Express lowercases custom headers)
  const cookieHeader = req.headers['x-auth-cookie'];
  
  // Also check body and query for cookie
  const bodyCookie = req.body?.cookie;
  const queryCookie = req.query?.cookie;
  
  const sessionToken = bearerToken || cookieHeader || bodyCookie || queryCookie;
  
  console.log('verifyDashboardSession - Request details:', {
    method: req.method,
    path: req.path,
    'authorization-header': authHeader ? `${authHeader.substring(0, 30)}...` : 'missing',
    'x-auth-cookie-header': cookieHeader ? `${cookieHeader.substring(0, 30)}...` : 'missing',
    'sessionToken-found': sessionToken ? `${sessionToken.substring(0, 30)}...` : 'MISSING',
    'dashboard-sessions-in-memory': Object.keys(dashboardSessions).length
  });
  
  if (!sessionToken) {
    console.log('verifyDashboardSession - No session token found, returning 404');
    return res.status(404).json({ error: 'Not found' });
  }

  const trimmedToken = sessionToken.trim();
  const session = dashboardSessions[trimmedToken];
  
  if (!session) {
    console.log('verifyDashboardSession - Session not found. Token received:', trimmedToken.substring(0, 30) + '...');
    return res.status(404).json({ error: 'Not found' });
  }

  console.log('verifyDashboardSession - ✅ Valid dashboard session found for:', session.dashId);
  req.dashboardSession = session;
  next();
}

// Generate roast endpoint
app.post('/api/user/generate-roast', async (req, res) => {
  try {
    const { balance, monthlyEarned, recentPayments } = req.body;
    console.log('Generating roast for:', { balance, monthlyEarned, recentPayments });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const systemInstruction = `You are a hilariously sarcastic financial advisor AI with a roast comedy style. Your job is to analyze student spending habits and provide brutally honest, funny commentary while ALSO giving genuine insights.

IMPORTANT CONTEXT:
- The "balance" is their REWARDS balance (cashback earned) - this is always good, any amount is positive!
- Focus your analysis on their PAYMENT PATTERNS - this is where the real story is
- Roast their spending choices, payment amounts, and habits - not their rewards

Your personality:
- Use LOTS of emojis (at least 3-5 per paragraph)
- Make witty observations about WHAT they're spending on
- Roast their spending priorities in a funny way
- Use Gen Z slang occasionally
- Give actual useful insights about their payment patterns
- Keep it light and entertaining
- Structure your response with clear sections using emojis as headers

Format your response with:
1. A funny opening that celebrates their rewards but questions their spending (2-3 sentences)
2. 🏆 Rewards Flex section - celebrate their cashback earnings briefly
3. 🎯 Spending Roast section - analyze and roast their payment choices (biggest section)
4. 💡 "Real Talk" section - actual useful advice about their spending patterns
5. A motivational but sarcastic closing that encourages better choices

Keep it under 250 words total. Focus heavily on analyzing PAYMENT PATTERNS for insights.`;

    const userPrompt = `Analyze this student's spending habits:
- Rewards Balance: £${balance.toFixed(2)} (this is good - they're earning cashback!)
- Monthly Rewards Earned: £${monthlyEarned.toFixed(2)}
- Recent Payments (THIS IS WHERE YOU FOCUS): ${recentPayments.map((p) => `${p.merchant} (£${p.amount})`).join(', ')}

Roast their SPENDING choices and provide insights based on WHAT they're paying for and HOW MUCH!`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userPrompt
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: systemInstruction
            }
          ]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again in a moment! 🐌' });
      }
      
      if (response.status === 403) {
        return res.status(403).json({ error: 'API key invalid or quota exceeded. Please check your Gemini API key! 💳' });
      }
      
      return res.status(500).json({ error: `Gemini API request failed: ${response.status}` });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini API response:', data);
      return res.status(500).json({ error: 'Unexpected response format from Gemini API' });
    }
    
    const roast = data.candidates[0].content.parts[0].text;

    console.log('Generated roast successfully');

    return res.json({ roast });

  } catch (error) {
    console.error('Error in generate-roast endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Analyze wellbeing endpoint
app.post('/api/user/analyze-wellbeing', async (req, res) => {
  try {
    const { transactions } = req.body;
    console.log('Analyzing wellbeing for transactions:', transactions?.length || 0);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    // Prepare transaction data for analysis
    const transactionSummary = transactions.map(t => {
      const date = new Date(t.date);
      const hour = date.getHours();
      const isLateNight = hour >= 22 || hour <= 4;
      return {
        merchant: t.merchant,
        amount: t.amount,
        date: t.date,
        hour: hour,
        isLateNight: isLateNight,
        type: t.type || 'unknown'
      };
    }).slice(0, 20); // Analyze last 20 transactions

    const systemInstruction = `You are a compassionate and supportive mental health and wellbeing AI assistant. Your role is to analyze transaction patterns to identify potential stress indicators, concerning spending habits related to substance use, or other mental health concerns.

IMPORTANT GUIDELINES:
- Be supportive, non-judgmental, and empathetic
- Focus on patterns, not individual transactions
- Look for: frequent late-night transactions, transactions at bars/liquor stores/pharmacies, rapid spending increases, unusual patterns
- Consider context: students may have legitimate reasons for various transactions
- Only flag genuine concerns, not normal student spending
- Provide helpful, actionable resources

Your response must be a JSON object with this exact structure:
{
  "summary": "A brief, supportive summary (2-3 sentences) of the analysis",
  "concerns": ["Array of specific concerns detected, if any. Empty array if no concerns"],
  "resources": [
    {
      "title": "Resource name",
      "description": "Brief description",
      "url": "https://resource-url.com"
    }
  ],
  "riskLevel": "low" | "moderate" | "high"
}

Risk levels:
- "low": No concerning patterns detected, healthy spending habits
- "moderate": Some patterns that might indicate stress or concern, but could be normal
- "high": Clear patterns suggesting potential substance abuse, severe stress, or mental health concerns

Always include helpful resources for mental health support, even if risk is low. Include UK-specific resources when possible.`;

    const userPrompt = `Analyze these transactions for wellbeing concerns:
${JSON.stringify(transactionSummary, null, 2)}

Look for patterns related to:
- Substance abuse indicators (frequent bars, liquor stores, late-night pharmacy visits)
- Stress indicators (rapid spending changes, unusual patterns)
- Mental health concerns (isolation patterns, concerning spending habits)

Provide a JSON response with the analysis.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userPrompt
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: systemInstruction
            }
          ]
        },
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again in a moment!' });
      }
      
      if (response.status === 403) {
        return res.status(403).json({ error: 'API key invalid or quota exceeded. Please check your Gemini API key!' });
      }
      
      return res.status(500).json({ error: `Gemini API request failed: ${response.status}` });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini API response:', data);
      return res.status(500).json({ error: 'Unexpected response format from Gemini API' });
    }
    
    let analysis;
    try {
      const responseText = data.candidates[0].content.parts[0].text;
      analysis = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback response if parsing fails
      analysis = {
        summary: "We've analyzed your transaction patterns. Your spending habits appear healthy overall. Remember to prioritize your mental wellbeing and reach out for support if needed.",
        concerns: [],
        resources: [
          {
            title: "Mind - Mental Health Charity",
            description: "UK mental health charity providing advice and support",
            url: "https://www.mind.org.uk"
          },
          {
            title: "Samaritans",
            description: "24/7 free confidential support for anyone in distress",
            url: "https://www.samaritans.org"
          },
          {
            title: "Student Minds",
            description: "UK's student mental health charity",
            url: "https://www.studentminds.org.uk"
          }
        ],
        riskLevel: "low"
      };
    }

    // Ensure resources are always present
    if (!analysis.resources || analysis.resources.length === 0) {
      analysis.resources = [
        {
          title: "Mind - Mental Health Charity",
          description: "UK mental health charity providing advice and support",
          url: "https://www.mind.org.uk"
        },
        {
          title: "Samaritans",
          description: "24/7 free confidential support for anyone in distress",
          url: "https://www.samaritans.org"
        },
        {
          title: "Student Minds",
          description: "UK's student mental health charity",
          url: "https://www.studentminds.org.uk"
        }
      ];
    }

    console.log('Wellbeing analysis completed successfully');

    return res.json(analysis);

  } catch (error) {
    console.error('Error in analyze-wellbeing endpoint:', error);
    // Return a safe fallback response
    return res.json({
      summary: "We've analyzed your transaction patterns. Your spending habits appear healthy overall. Remember to prioritize your mental wellbeing and reach out for support if needed.",
      concerns: [],
      resources: [
        {
          title: "Mind - Mental Health Charity",
          description: "UK mental health charity providing advice and support",
          url: "https://www.mind.org.uk"
        },
        {
          title: "Samaritans",
          description: "24/7 free confidential support for anyone in distress",
          url: "https://www.samaritans.org"
        },
        {
          title: "Student Minds",
          description: "UK's student mental health charity",
          url: "https://www.studentminds.org.uk"
        }
      ],
      riskLevel: "low"
    });
  }
});

// Perks endpoints (require authentication)
app.get('/api/user/perks', verifySession, (req, res) => {
  res.json({ perks: generalPerks });
});

// Partners endpoints (require authentication)
app.get('/api/user/partners', verifySession, (req, res) => {
  // Return partners with logo URLs and deals
  const partnersList = partners.map((partner) => ({
    ...partner,
    logoUrl: `${req.protocol}://${req.get('host')}${partner.logo}`,
    deals: partner.deals
  }));
  res.json({ partners: partnersList });
});

// Get perks for a specific partner (require authentication)
app.get('/api/user/partners/:partnerSlug/perks', verifySession, (req, res) => {
  const { partnerSlug } = req.params;
  const partner = partners.find(p => p.slug.toLowerCase() === partnerSlug.toLowerCase());
  
  if (!partner) {
    return res.status(404).json({ error: 'Partner not found' });
  }
  
  // Combine static deals with dynamic deals
  const staticDeals = partner.deals || [];
  const additionalDeals = dynamicDeals[partnerSlug.toLowerCase()] || [];
  const allDeals = [...staticDeals, ...additionalDeals];
  
  res.json({ 
    partner: {
      id: partner.id,
      name: partner.name,
      slug: partner.slug,
      logoUrl: `${req.protocol}://${req.get('host')}${partner.logo}`,
      route: partner.route
    },
    perks: allDeals 
  });
});

// Transactions endpoint (require authentication)
app.post('/api/user/transactions', verifySession, (req, res) => {
  try {
    const transaction = req.body;
    const userId = req.session.userId;

    // Validate transaction data
    if (!transaction || !transaction.amount || !transaction.description) {
      return res.status(400).json({ error: 'Transaction must include amount and description' });
    }

    // Initialize transactions array for user if it doesn't exist
    if (!transactions[userId]) {
      transactions[userId] = [];
    }

    // Generate transaction ID
    const transactionId = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Create transaction object
    const newTransaction = {
      id: transactionId,
      userId: userId,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type || 'payment',
      credits: transaction.credits || 0,
      date: transaction.date || new Date().toISOString(),
      merchant: transaction.merchant || transaction.description,
      ...transaction // Include any additional fields
    };

    // Store transaction
    transactions[userId].push(newTransaction);

    // Initialize balance for user if it doesn't exist (default to 0, except "user" which starts at 56.75)
    if (balances[userId] === undefined) {
      balances[userId] = userId === 'user' ? 56.75 : 0;
    }

    // Calculate 5% cashback from transaction amount and add to balance
    const cashbackAmount = newTransaction.amount * 0.05;
    balances[userId] += cashbackAmount;
    
    // Also update the transaction's credits field with the cashback amount
    newTransaction.credits = cashbackAmount;

    console.log('Balance updated with cashback:', {
      userId: userId,
      transactionAmount: newTransaction.amount,
      cashbackAmount: cashbackAmount,
      newBalance: balances[userId]
    });

    console.log('Transaction created:', {
      userId: userId,
      transactionId: transactionId,
      amount: transaction.amount,
      credits: newTransaction.credits,
      totalTransactions: transactions[userId].length
    });

    // Return the created transaction
    res.status(201).json({ 
      success: true,
      transaction: newTransaction
    });

  } catch (error) {
    console.error('Error in transactions endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Wallet endpoint (require authentication) - returns all user transactions
app.get('/api/user/wallet', verifySession, (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Initialize transactions array for user if it doesn't exist
    if (!transactions[userId]) {
      transactions[userId] = generateRandomTransactions(userId);
      console.log('Initialized transactions for user:', {
        userId: userId,
        transactionCount: transactions[userId].length
      });
    }
    
    // Return all transactions for the user, sorted by date (most recent first)
    const userTransactions = transactions[userId].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('Wallet requested:', {
      userId: userId,
      transactionCount: userTransactions.length
    });

    res.json({ 
      success: true,
      transactions: userTransactions
    });

  } catch (error) {
    console.error('Error in wallet endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Balance endpoint (require authentication)
app.get('/api/user/balance', verifySession, (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Initialize balance for new users (default to 0, except "user" which starts at 56.75)
    if (balances[userId] === undefined) {
      balances[userId] = userId === 'user' ? 56.75 : 0;
    }
    
    // Get balance for user
    const balance = balances[userId];
    
    console.log('Balance requested:', {
      userId: userId,
      balance: balance
    });

    res.json({ 
      success: true,
      balance: balance
    });

  } catch (error) {
    console.error('Error in balance endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Redeem perk endpoint (require authentication)
app.post('/api/user/redeem-perk', verifySession, (req, res) => {
  try {
    const userId = req.session.userId;
    const { perkId, perkName, cost } = req.body;

    // Validate input
    if (!perkId || cost === undefined || !perkName) {
      return res.status(400).json({ error: 'perkId, perkName, and cost are required' });
    }

    // Initialize balance for new users (default to 0, except "user" which starts at 56.75)
    if (balances[userId] === undefined) {
      balances[userId] = userId === 'user' ? 56.75 : 0;
    }

    const currentBalance = balances[userId];

    // Check if user has sufficient funds
    if (currentBalance < cost) {
      return res.status(400).json({ 
        success: false,
        error: 'Insufficient funds',
        currentBalance: currentBalance,
        required: cost
      });
    }

    // Deduct cost from balance
    balances[userId] -= cost;

    console.log('Perk redeemed:', {
      userId: userId,
      perkId: perkId,
      perkName: perkName,
      cost: cost,
      previousBalance: currentBalance,
      newBalance: balances[userId]
    });

    res.json({ 
      success: true,
      perkName: perkName,
      cost: cost,
      previousBalance: currentBalance,
      newBalance: balances[userId]
    });

  } catch (error) {
    console.error('Error in redeem-perk endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Redeem partner perk endpoint (require authentication)
// This tracks which partner perks have been redeemed
app.post('/api/user/:partner/redeem-perks', verifySession, (req, res) => {
  try {
    const userId = req.session.userId;
    const { partner } = req.params;
    const { perkId } = req.body;

    // Validate input
    if (!perkId) {
      return res.status(400).json({ error: 'perkId is required' });
    }

    // Validate partner exists
    const partnerData = partners.find(p => p.slug.toLowerCase() === partner.toLowerCase());
    if (!partnerData) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Initialize redemption counts for partner if it doesn't exist
    if (!perkRedemptions[partner]) {
      perkRedemptions[partner] = {};
    }

    // Initialize count for this perk if it doesn't exist
    if (!perkRedemptions[partner][perkId]) {
      perkRedemptions[partner][perkId] = 0;
    }

    // Increment redemption count
    perkRedemptions[partner][perkId] += 1;

    console.log('Partner perk redeemed:', {
      userId: userId,
      partner: partner,
      perkId: perkId,
      redemptionCount: perkRedemptions[partner][perkId]
    });

    // Emit WebSocket event for redemption update
    emitToClients('perk-redeemed', {
      partner: partner,
      perkId: perkId,
      redemptionCount: perkRedemptions[partner][perkId]
    });

    res.json({ 
      success: true,
      partner: partner,
      perkId: perkId,
      redemptionCount: perkRedemptions[partner][perkId]
    });

  } catch (error) {
    console.error('Error in partner redeem-perks endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Dashboard redemption stats endpoint (require dashboard authentication)
app.get('/api/dash/redeems', verifyDashboardSession, (req, res) => {
  try {
    const dashboardName = req.dashboardSession.name; // "aldi"
    
    // Map dashboard name to partner slug
    // For now, dashboard name "aldi" maps to partner slug "aldi"
    const partnerSlug = dashboardName.toLowerCase();
    
    // Ensure redemptions are initialized for this partner
    if (!perkRedemptions[partnerSlug]) {
      const partner = partners.find(p => p.slug.toLowerCase() === partnerSlug);
      if (partner) {
        perkRedemptions[partnerSlug] = {};
        partner.deals.forEach(deal => {
          // Generate random number between 10 and 500 for each perk if not already set
          if (!perkRedemptions[partnerSlug][deal.id]) {
            perkRedemptions[partnerSlug][deal.id] = Math.floor(Math.random() * 491) + 10;
          }
        });
      }
    }
    
    // Get redemption counts for this partner
    const redemptions = perkRedemptions[partnerSlug] || {};
    
    console.log('Dashboard redeems requested:', {
      dashboardName: dashboardName,
      partnerSlug: partnerSlug,
      redemptionCounts: redemptions
    });

    res.json({ 
      success: true,
      partner: partnerSlug,
      redemptions: redemptions
    });

  } catch (error) {
    console.error('Error in dashboard redeems endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Dashboard partner info endpoint (require dashboard authentication)
app.get('/api/dash/partner', verifyDashboardSession, (req, res) => {
  try {
    const dashboardName = req.dashboardSession.name; // "aldi"
    const partnerSlug = dashboardName.toLowerCase();
    
    // Find partner by slug
    const partner = partners.find(p => p.slug.toLowerCase() === partnerSlug);
    
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json({ 
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        slug: partner.slug,
        logo: partner.logo
      }
    });

  } catch (error) {
    console.error('Error in dashboard partner endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Dashboard deals endpoint (require dashboard authentication)
app.get('/api/dash/deals', verifyDashboardSession, (req, res) => {
  try {
    const dashboardName = req.dashboardSession.name; // "aldi"
    const partnerSlug = dashboardName.toLowerCase();
    
    // Find partner by slug
    const partner = partners.find(p => p.slug.toLowerCase() === partnerSlug);
    
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Get redemption counts and views for this partner
    const redemptions = perkRedemptions[partnerSlug] || {};
    const views = perkViews[partnerSlug] || {};

    // Ensure views are initialized for this partner
    if (!perkViews[partnerSlug]) {
      initializePerkViews();
    }

    // Combine static deals with dynamic deals
    const staticDeals = partner.deals || [];
    const additionalDeals = dynamicDeals[partnerSlug] || [];
    const allDeals = [...staticDeals, ...additionalDeals];

    // Map deals with redemption counts and constant views
    const deals = allDeals.map(deal => {
      const redemptionCount = redemptions[deal.id] || 0;
      const viewCount = views[deal.id] || 100; // Default to 100 if not initialized
      
      return {
        id: deal.id.toString(),
        title: deal.title,
        description: deal.description,
        fullDescription: deal.fullDescription || deal.description,
        icon: deal.icon || 'gift',
        discount_percentage: 0, // Not applicable for these deals
        discount_amount: null,
        status: 'active',
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: null,
        category: null,
        views: viewCount,
        redemptions: redemptionCount
      };
    });

    res.json({ 
      success: true,
      deals: deals
    });

  } catch (error) {
    console.error('Error in dashboard deals endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Dashboard stats endpoint (require dashboard authentication)
app.get('/api/dash/stats', verifyDashboardSession, (req, res) => {
  try {
    const dashboardName = req.dashboardSession.name; // "aldi"
    const partnerSlug = dashboardName.toLowerCase();
    
    // Find partner by slug
    const partner = partners.find(p => p.slug.toLowerCase() === partnerSlug);
    
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Get redemption counts and views for this partner
    const redemptions = perkRedemptions[partnerSlug] || {};
    const views = perkViews[partnerSlug] || {};

    // Ensure views are initialized for this partner
    if (!perkViews[partnerSlug]) {
      initializePerkViews();
    }

    // Combine static deals with dynamic deals
    const staticDeals = partner.deals || [];
    const additionalDeals = dynamicDeals[partnerSlug] || [];
    const allDeals = [...staticDeals, ...additionalDeals];

    const totalDeals = allDeals.length;
    const activeDeals = allDeals.length; // All deals are active
    
    // Calculate total views and redemptions
    let totalViews = 0;
    let totalRedemptions = 0;
    
    allDeals.forEach(deal => {
      const redemptionCount = redemptions[deal.id] || 0;
      totalRedemptions += redemptionCount;
      // Use constant views
      const viewCount = views[deal.id] || 100; // Default to 100 if not initialized
      totalViews += viewCount;
    });

    res.json({ 
      success: true,
      stats: {
        totalDeals,
        activeDeals,
        totalViews,
        totalRedemptions
      }
    });

  } catch (error) {
    console.error('Error in dashboard stats endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Dashboard add perk endpoint (require dashboard authentication)
app.post('/api/dash/add-perk', verifyDashboardSession, (req, res) => {
  try {
    const dashboardName = req.dashboardSession.name; // "aldi"
    const partnerSlug = dashboardName.toLowerCase();
    
    // Find partner by slug
    const partner = partners.find(p => p.slug.toLowerCase() === partnerSlug);
    
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const { title, description, fullDescription, icon } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    // Initialize dynamic deals array for this partner if it doesn't exist
    if (!dynamicDeals[partnerSlug]) {
      dynamicDeals[partnerSlug] = [];
    }

    // Get the highest ID from static deals
    const maxStaticId = partner.deals.length > 0 
      ? Math.max(...partner.deals.map(d => d.id))
      : 0;
    
    // Get the highest ID from dynamic deals
    const maxDynamicId = dynamicDeals[partnerSlug].length > 0
      ? Math.max(...dynamicDeals[partnerSlug].map(d => d.id))
      : 0;
    
    // New deal ID is the maximum of both + 1
    const newDealId = Math.max(maxStaticId, maxDynamicId) + 1;

    // Create new deal
    const newDeal = {
      id: newDealId,
      title: title,
      description: description,
      fullDescription: fullDescription || description,
      icon: icon || 'gift' // Default icon
    };

    // Add to dynamic deals
    dynamicDeals[partnerSlug].push(newDeal);

    // Initialize redemption count to 0
    if (!perkRedemptions[partnerSlug]) {
      perkRedemptions[partnerSlug] = {};
    }
    perkRedemptions[partnerSlug][newDealId] = 0;

    // Initialize views
    // For Aldi, need to redistribute views to maintain 10,000 total
    if (partnerSlug === 'aldi') {
      if (!perkViews[partnerSlug]) {
        initializePerkViews();
      }
      // Recalculate views to maintain 10,000 total
      const allDeals = [...partner.deals, ...dynamicDeals[partnerSlug]];
      const totalViews = 10000;
      const dealCount = allDeals.length;
      const baseViews = Math.floor(totalViews / dealCount);
      const remainder = totalViews % dealCount;
      
      // Update all views
      allDeals.forEach((deal, index) => {
        perkViews[partnerSlug][deal.id] = baseViews + (index < remainder ? 1 : 0);
      });
    } else {
      // For other partners, use seed-based approach
      if (!perkViews[partnerSlug]) {
        perkViews[partnerSlug] = {};
      }
      const seed = partner.id * 1000 + newDealId;
      perkViews[partnerSlug][newDealId] = 100 + (seed % 900);
    }

    console.log('New perk added:', {
      partner: partnerSlug,
      dealId: newDealId,
      title: title,
      totalDynamicDeals: dynamicDeals[partnerSlug].length
    });

    // Emit WebSocket event for new deal added
    emitToClients('new-deal-added', {
      partner: partnerSlug,
      deal: newDeal
    });

    res.json({ 
      success: true,
      deal: newDeal
    });

  } catch (error) {
    console.error('Error in dashboard add-perk endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Dashboard authentication endpoint
app.post('/api/dash/login', (req, res) => {
  try {
    const { dashid, password } = req.body;

    // Validate input
    if (!dashid || !password) {
      return res.status(400).json({ error: 'dashid and password are required' });
    }

    // Check if dashboard user exists
    const dashboardUser = dashboardUsers[dashid];
    if (!dashboardUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password (not hashed for now)
    if (dashboardUser.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    
    // Store dashboard session
    dashboardSessions[sessionToken] = {
      dashId: dashboardUser.dashId,
      name: dashboardUser.name,
      createdAt: new Date().toISOString()
    };

    console.log('Dashboard login successful - Session created:', {
      dashId: dashboardUser.dashId,
      sessionToken: sessionToken.substring(0, 30) + '...',
      totalDashboardSessions: Object.keys(dashboardSessions).length
    });

    // Return session token in JSON response
    res.json({ 
      success: true,
      cookie: sessionToken,
      user: {
        dashId: dashboardUser.dashId,
        name: dashboardUser.name
      }
    });

  } catch (error) {
    console.error('Error in dashboard login endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start test endpoint - simulates a year of transactions (require authentication)
app.get('/api/user/start-test', verifySession, (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Check if a test is already running for this user
    if (testSimulations[userId] && testSimulations[userId].isRunning) {
      return res.status(400).json({ 
        error: 'Test simulation is already running for this user',
        isRunning: true
      });
    }

    // Initialize transactions array for user if it doesn't exist
    if (!transactions[userId]) {
      transactions[userId] = [];
    }

    // Initialize balance for user if it doesn't exist
    if (balances[userId] === undefined) {
      balances[userId] = userId === 'user' ? 56.75 : 0;
    }

    // Clear existing transactions for clean test
    transactions[userId] = [];

    // Initialize test simulation tracking
    testSimulations[userId] = {
      isRunning: true,
      timeoutId: null,
      stopFlag: false
    };

    // Constants
    const RENT_AMOUNT = 450;
    const ROAST_THRESHOLD = 1300; // Monthly spending threshold for regular AI roast
    const EMERGENCY_ROAST_THRESHOLD = 1500; // Monthly spending threshold for emergency AI roast
    const MONTHS_IN_YEAR = 12;
    const TRANSACTIONS_PER_MONTH = 10;
    const UPDATE_INTERVAL_MS = 4000; // 4 seconds

    // Transaction types and descriptions
    const transactionTypes = ['rent', 'utilities', 'bills', 'payment'];
    const descriptions = {
      'rent': ['Rent Payment', 'Monthly Rent', 'Housing Payment'],
      'utilities': ['Electricity Bill', 'Gas & Water Bill', 'Energy Bill', 'Heating'],
      'bills': ['Internet & Subscriptions', 'Mobile Phone', 'Gym Membership', 'Streaming Services'],
      'payment': ['Groceries', 'Food Delivery', 'Transport', 'Entertainment', 'Shopping', 'Takeaway', 'Coffee & Snacks']
    };

    // Calculate spending progression: starts low, increases to reach thresholds
    // Month 1-3: Low spending (200-400/month)
    // Month 4: Reaches regular roast threshold (1300+)
    // Month 5: Reaches emergency roast threshold (1500+)
    // Month 6-12: High spending (1500-2000/month)
    function getMonthlySpendingTarget(monthIndex) {
      if (monthIndex < 3) {
        // Months 1-3: Low spending, gradually increasing
        return 200 + (monthIndex * 50); // 200, 250, 300
      } else if (monthIndex === 3) {
        // Month 4 (April): Reach regular roast threshold (1300)
        return ROAST_THRESHOLD;
      } else if (monthIndex === 4) {
        // Month 5 (May): Reach emergency roast threshold (1500)
        return EMERGENCY_ROAST_THRESHOLD;
      } else {
        // Months 6-12: High spending
        return EMERGENCY_ROAST_THRESHOLD + Math.floor(Math.random() * 500); // 1500-2000
      }
    }

    let currentMonthIndex = 0;

    // Start the test simulation
    const runMonth = () => {
      // Check if test should be stopped
      if (testSimulations[userId] && testSimulations[userId].stopFlag) {
        testSimulations[userId].isRunning = false;
        testSimulations[userId].timeoutId = null;
        testSimulations[userId].stopFlag = false;
        emitToClients('test-stopped', { userId });
        console.log('Test simulation stopped for user:', userId);
        return;
      }

      if (currentMonthIndex >= MONTHS_IN_YEAR) {
        // Test complete
        if (testSimulations[userId]) {
          testSimulations[userId].isRunning = false;
          testSimulations[userId].timeoutId = null;
        }
        emitToClients('test-complete', { userId });
        console.log('Test simulation complete for user:', userId);
        return;
      }

      const monthIndex = currentMonthIndex;
      const year = 2025;
      const month = monthIndex; // 0-11 for Jan-Dec
      const monthDate = new Date(year, month, 1);
      const monthName = monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

      console.log(`Running test for ${monthName} (month ${monthIndex + 1}/12)`);

      // Calculate spending target for this month
      const monthlySpendingTarget = getMonthlySpendingTarget(monthIndex);
      const nonRentSpending = monthlySpendingTarget - RENT_AMOUNT; // Remaining spending after rent

      // Emit month update event
      emitToClients('test-month-update', {
        userId,
        month: monthName,
        monthIndex: monthIndex + 1,
        totalMonths: MONTHS_IN_YEAR
      });

      // Generate transactions for this month
      const monthTransactions = [];

      // Always add rent as first transaction (constant)
      const rentDate = new Date(year, month, 15); // Rent on 15th
      const rentTransaction = {
        id: `${userId}-${rentDate.getTime()}-rent`,
        userId: userId,
        amount: RENT_AMOUNT,
        description: 'Rent Payment',
        type: 'rent',
        credits: RENT_AMOUNT * 0.05,
        date: rentDate.toISOString(),
        merchant: 'Rent Payment'
      };
      monthTransactions.push(rentTransaction);

      // Generate remaining transactions (9 more)
      // Use random values between 10-300, weighted towards smaller values
      // Ensure 2-3 higher values (200-300 range) per month
      // Ensure all values are varied and different
      const remainingTransactions = TRANSACTIONS_PER_MONTH - 1;
      const transactionAmounts = [];
      
      // Determine how many high-value transactions (2-3)
      const highValueCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
      
      // Generate high-value transactions (200-300) with variety
      const highValues = [];
      for (let i = 0; i < highValueCount; i++) {
        let value;
        let attempts = 0;
        do {
          value = Math.floor(Math.random() * 101) + 200; // 200-300
          attempts++;
        } while (highValues.includes(value) && attempts < 20); // Ensure variety
        highValues.push(value);
        transactionAmounts.push(value);
      }
      
      // Generate remaining transactions with weighted distribution towards smaller values
      // Use exponential distribution to favor smaller values, but ensure variety
      const remainingCount = remainingTransactions - highValueCount;
      const usedValues = new Set(transactionAmounts); // Track used values to ensure variety
      
      for (let i = 0; i < remainingCount; i++) {
        let amount;
        let attempts = 0;
        do {
          // Use exponential distribution: more likely to get smaller values
          // Random between 0-1, then square it to bias towards smaller numbers
          const random = Math.random();
          const biasedRandom = random * random; // Square to bias towards 0
          amount = Math.floor(biasedRandom * 290) + 10; // 10-300 range
          attempts++;
          // Allow some duplicates if we've tried many times, but prefer variety
        } while (usedValues.has(amount) && attempts < 30 && i < remainingCount - 1);
        
        // If we still have duplicates and it's not the last transaction, add some variation
        if (usedValues.has(amount) && i < remainingCount - 1) {
          amount = Math.max(10, Math.min(300, amount + Math.floor(Math.random() * 20) - 10));
        }
        
        transactionAmounts.push(amount);
        usedValues.add(amount);
      }
      
      // Shuffle the amounts to randomize order
      for (let i = transactionAmounts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [transactionAmounts[i], transactionAmounts[j]] = [transactionAmounts[j], transactionAmounts[i]];
      }
      
      // Calculate total of generated amounts
      const totalGenerated = transactionAmounts.reduce((sum, amt) => sum + amt, 0);
      
      // If total exceeds nonRentSpending, scale down proportionally while maintaining variety
      // If total is less, we can add a bit more to some transactions (but stay under threshold)
      let adjustedAmounts = [...transactionAmounts];
      if (totalGenerated > nonRentSpending) {
        // Scale down proportionally, but ensure values stay in 10-300 range and maintain variety
        const scaleFactor = nonRentSpending / totalGenerated;
        adjustedAmounts = transactionAmounts.map(amt => {
          const scaled = Math.floor(amt * scaleFactor);
          return Math.max(10, Math.min(300, scaled));
        });
        
        // Ensure variety after scaling - if values are too similar, add small variations
        for (let i = 0; i < adjustedAmounts.length; i++) {
          for (let j = i + 1; j < adjustedAmounts.length; j++) {
            if (Math.abs(adjustedAmounts[i] - adjustedAmounts[j]) < 5 && adjustedAmounts[i] > 10) {
              // Add small variation to make them different
              adjustedAmounts[i] = Math.max(10, adjustedAmounts[i] - Math.floor(Math.random() * 5));
              adjustedAmounts[j] = Math.min(300, adjustedAmounts[j] + Math.floor(Math.random() * 5));
            }
          }
        }
      } else if (totalGenerated < nonRentSpending && monthIndex < 4) {
        // For months before May, we can add a bit more, but keep it under the target
        const difference = nonRentSpending - totalGenerated;
        // Distribute the difference across a few random transactions
        const transactionsToBoost = Math.min(3, remainingTransactions);
        const boostPerTransaction = Math.floor(difference / transactionsToBoost);
        const indicesToBoost = [];
        for (let i = 0; i < transactionsToBoost; i++) {
          let idx;
          do {
            idx = Math.floor(Math.random() * adjustedAmounts.length);
          } while (indicesToBoost.includes(idx));
          indicesToBoost.push(idx);
          adjustedAmounts[idx] = Math.min(300, adjustedAmounts[idx] + boostPerTransaction);
        }
      }
      
      // Final check: ensure we don't exceed the monthly spending target
      const finalTotal = adjustedAmounts.reduce((sum, amt) => sum + amt, 0);
      if (finalTotal > nonRentSpending) {
        // Final safety check: scale down if needed, maintaining variety
        const finalScale = nonRentSpending / finalTotal;
        adjustedAmounts = adjustedAmounts.map(amt => {
          const scaled = Math.floor(amt * finalScale);
          return Math.max(10, Math.min(300, scaled));
        });
      }
      
      // Final pass: ensure all values are between 10-300 and have some variety
      for (let i = 0; i < adjustedAmounts.length; i++) {
        adjustedAmounts[i] = Math.max(10, Math.min(300, adjustedAmounts[i]));
      }

      for (let i = 0; i < remainingTransactions; i++) {
        const amount = adjustedAmounts[i];

        // Random day in the month (1-28 to avoid month-end issues)
        const day = Math.floor(Math.random() * 28) + 1;
        const transactionDate = new Date(year, month, day);

        // Select transaction type (weighted: more payments/bills than utilities)
        const typeWeights = {
          'payment': 0.4,
          'bills': 0.3,
          'utilities': 0.2,
          'rent': 0.1
        };
        const rand = Math.random();
        let type = 'payment';
        if (rand < typeWeights.payment) type = 'payment';
        else if (rand < typeWeights.payment + typeWeights.bills) type = 'bills';
        else if (rand < typeWeights.payment + typeWeights.bills + typeWeights.utilities) type = 'utilities';

        const typeDescriptions = descriptions[type];
        const description = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];

        const transaction = {
          id: `${userId}-${transactionDate.getTime()}-${i}`,
          userId: userId,
          amount: amount,
          description: description,
          type: type,
          credits: amount * 0.05,
          date: transactionDate.toISOString(),
          merchant: description
        };

        monthTransactions.push(transaction);
      }

      // Add transactions to user's transaction list
      transactions[userId].push(...monthTransactions);

      // Update balance with cashback
      monthTransactions.forEach(txn => {
        balances[userId] += txn.credits;
      });

      // Sort transactions by date (most recent first)
      transactions[userId].sort((a, b) => new Date(b.date) - new Date(a.date));

      // Emit wallet refresh event
      emitToClients('refresh-wallet', { userId });
      
      // Emit balance refresh event
      emitToClients('refresh-balance', { userId });

      console.log(`Added ${monthTransactions.length} transactions for ${monthName}. Total spending: £${monthlySpendingTarget.toFixed(2)}`);
      
      // Check if monthly spending exceeds AI roast thresholds
      if (monthlySpendingTarget >= EMERGENCY_ROAST_THRESHOLD) {
        // Emergency roast threshold (1500+)
        console.log(`Emergency roast threshold exceeded for ${monthName}: £${monthlySpendingTarget.toFixed(2)}`);
        emitToClients('trigger-ai-roast', { 
          userId,
          month: monthName,
          monthlySpending: monthlySpendingTarget,
          thresholdType: 'emergency',
          threshold: EMERGENCY_ROAST_THRESHOLD
        });
      } else if (monthlySpendingTarget >= ROAST_THRESHOLD) {
        // Regular roast threshold (1300+)
        console.log(`Roast threshold exceeded for ${monthName}: £${monthlySpendingTarget.toFixed(2)}`);
        emitToClients('trigger-ai-roast', { 
          userId,
          month: monthName,
          monthlySpending: monthlySpendingTarget,
          thresholdType: 'regular',
          threshold: ROAST_THRESHOLD
        });
      }

      // Move to next month
      currentMonthIndex++;

      // Schedule next month update
      if (currentMonthIndex < MONTHS_IN_YEAR) {
        const timeoutId = setTimeout(runMonth, UPDATE_INTERVAL_MS);
        // Store timeout ID so it can be cancelled
        if (testSimulations[userId]) {
          testSimulations[userId].timeoutId = timeoutId;
        }
      } else {
        if (testSimulations[userId]) {
          testSimulations[userId].isRunning = false;
          testSimulations[userId].timeoutId = null;
        }
        emitToClients('test-complete', { userId });
        console.log('Test simulation complete for user:', userId);
      }
    };

    // Start the simulation
    runMonth();

    // Return immediately to client
    res.json({
      success: true,
      message: 'Test simulation started',
      duration: `${MONTHS_IN_YEAR * (UPDATE_INTERVAL_MS / 1000)} seconds`,
      transactionsPerMonth: TRANSACTIONS_PER_MONTH
    });

  } catch (error) {
    console.error('Error in start-test endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

// End test endpoint - stops a running test simulation (require authentication)
app.get('/api/user/end-test', verifySession, (req, res) => {
  try {
    const userId = req.session.userId;

    // Check if a test is running for this user
    if (!testSimulations[userId] || !testSimulations[userId].isRunning) {
      return res.json({
        success: false,
        message: 'No test simulation is currently running for this user',
        isRunning: false
      });
    }

    // Set stop flag to stop the simulation
    testSimulations[userId].stopFlag = true;

    // Clear the timeout if it exists
    if (testSimulations[userId].timeoutId) {
      clearTimeout(testSimulations[userId].timeoutId);
      testSimulations[userId].timeoutId = null;
    }

    // Mark as not running
    testSimulations[userId].isRunning = false;

    // Emit WebSocket event to notify clients
    emitToClients('test-stopped', { userId });

    console.log('Test simulation stopped for user:', userId);

    res.json({
      success: true,
      message: 'Test simulation stopped successfully',
      isRunning: false
    });

  } catch (error) {
    console.error('Error in end-test endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is ready for connections`);
});

