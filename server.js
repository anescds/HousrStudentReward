const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let users = [
  { id: '1', email: 'student@example.com', name: 'Student User' }
];

let payments = [
  {
    id: '1',
    user_id: '1',
    type: 'rent',
    amount: 450,
    credits: 22.50,
    date: '2025-01-15',
    description: 'January Rent',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: '1',
    type: 'utilities',
    amount: 85,
    credits: 4.25,
    date: '2025-01-10',
    description: 'Electricity Bill',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: '1',
    type: 'bills',
    amount: 120,
    credits: 6.0,
    date: '2025-01-05',
    description: 'Internet & Subscriptions',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let rewards = [
  {
    id: '1',
    user_id: '1',
    balance: 32.75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let partners = [
  {
    id: '1',
    name: 'Aldi',
    logo_url: '/src/assets/aldi-logo.png',
    description: 'Exclusive discounts on groceries',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Co-op',
    logo_url: '/src/assets/coop-logo.png',
    description: 'Student discounts on food and essentials',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Lidl',
    logo_url: '/src/assets/lidl-logo.png',
    description: 'Special offers for students',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Morrisons',
    logo_url: '/src/assets/morrisons-logo.png',
    description: 'Weekly student deals',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let perks = [
  {
    id: '1',
    partner_id: '1',
    title: '10% Off Groceries',
    description: 'Get 10% off your grocery shopping',
    discount_amount: 10.00,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    partner_id: '2',
    title: '5% Student Discount',
    description: 'Show your student ID for 5% off',
    discount_amount: 5.00,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    partner_id: '3',
    title: 'Free Bakery Item',
    description: 'Get a free bakery item with purchases over £15',
    discount_amount: 2.50,
    valid_from: '2025-01-01',
    valid_until: '2025-06-30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    partner_id: '4',
    title: '15% Off Fresh Produce',
    description: 'Get 15% off all fresh produce',
    discount_amount: 15.00,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Routes
app.get('/api/payments', (req, res) => {
  res.json({ payments });
});

app.post('/api/payments', (req, res) => {
  const { type, amount, date, description } = req.body;
  
  // Calculate credits based on payment type and amount
  const credits = amount * 0.05;
  
  const newPayment = {
    id: uuidv4(),
    user_id: '1', // Default user
    type,
    amount: parseFloat(amount),
    credits: parseFloat(credits.toFixed(2)),
    date,
    description,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  payments.unshift(newPayment); // Add to beginning of array
  
  // Update rewards balance
  const userReward = rewards.find(r => r.user_id === '1');
  if (userReward) {
    userReward.balance += newPayment.credits;
    userReward.updated_at = new Date().toISOString();
  }
  
  res.status(201).json({ payment: newPayment });
});

app.get('/api/rewards', (req, res) => {
  const userReward = rewards.find(r => r.user_id === '1');
  
  // Calculate monthly earned
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyEarned = payments
    .filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    })
    .reduce((sum, payment) => sum + payment.credits, 0);
  
  res.json({ 
    balance: userReward ? userReward.balance : 0,
    monthlyEarned
  });
});

app.get('/api/partners', (req, res) => {
  const includePerks = req.query.includePerks === 'true';
  const partnerId = req.query.id;
  
  let result = [...partners];
  
  if (partnerId) {
    result = result.filter(p => p.id === partnerId);
  }
  
  if (includePerks) {
    result = result.map(partner => ({
      ...partner,
      perks: perks.filter(perk => perk.partner_id === partner.id)
    }));
  }
  
  res.json({ partners: result });
});

app.get('/api/perks', (req, res) => {
  const partnerId = req.query.partnerId;
  const perkId = req.query.id;
  
  let result = [...perks];
  
  if (partnerId) {
    result = result.filter(p => p.partner_id === partnerId);
  }
  
  if (perkId) {
    result = result.filter(p => p.id === perkId);
  }
  
  // Add partner data to each perk
  result = result.map(perk => ({
    ...perk,
    partners: partners.find(p => p.id === perk.partner_id)
  }));
  
  res.json({ perks: result });
});

app.post('/api/roast', (req, res) => {
  const { balance, monthlyEarned, recentPayments } = req.body;
  
  // Generate a mock roast
  const roast = `
🎉 **CASH BACK CHAMPION... BUT AT WHAT COST?** 🎉

You've managed to rack up £${balance.toFixed(2)} in rewards! Impressive for someone who clearly spends money like it's going out of style! 💸💸💸

## 🏆 REWARDS FLEX
£${balance.toFixed(2)} in your rewards account! That's enough for... *checks notes*... approximately 1.5 fancy coffees. Living large! ☕️

## 🎯 SPENDING ROAST
Let's talk about these payments, bestie. £${recentPayments[0].amount} on "${recentPayments[0].merchant}"?! 😱 The way you're throwing cash around, you'd think money grows on that plant you bought last month (and probably already killed). 

And don't get me started on your ${recentPayments.length > 1 ? `£${recentPayments[1].amount} "${recentPayments[1].merchant}"` : 'other spending habits'} - that's giving "I'll worry about it tomorrow" energy. 🤦‍♀️

## 💡 REAL TALK
Your monthly rewards of £${monthlyEarned.toFixed(2)} show you're at least getting SOMETHING back from your spending spree. But maybe consider a budget? Just a wild thought! 📊

Keep making those payments on time though - that's actually impressive and your future self will thank you! 👏

**Remember: A penny saved is boring, but a pound earned in rewards is slightly less boring!** 💅
`;
  
  res.json({ roast });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
});

