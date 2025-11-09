// General perks data
export const generalPerks = [
  { 
    id: 1, 
    name: "Coffee Voucher", 
    cost: 5, 
    icon: "coffee", 
    category: "Food & Drink", 
    description: "£5 off at Costa Coffee" 
  },
  { 
    id: 2, 
    name: "Gym Pass", 
    cost: 15, 
    icon: "dumbbell", 
    category: "Fitness", 
    description: "1 month free gym access" 
  },
  { 
    id: 3, 
    name: "Shopping Discount", 
    cost: 10, 
    icon: "shopping-bag", 
    category: "Shopping", 
    description: "10% off at ASOS" 
  },
  { 
    id: 4, 
    name: "Rent Discount", 
    cost: 25, 
    icon: "home", 
    category: "Housing", 
    description: "£25 off next rent payment" 
  },
  { 
    id: 5, 
    name: "Premium Perks Box", 
    cost: 50, 
    icon: "gift", 
    category: "Special", 
    description: "Mystery box of student essentials" 
  },
  { 
    id: 6, 
    name: "Entertainment Pass", 
    cost: 20, 
    icon: "sparkles", 
    category: "Entertainment", 
    description: "Cinema tickets for 2" 
  },
];

// Partners data
export const partners = [
  { 
    id: 1, 
    name: "Aldi", 
    slug: "aldi",
    logo: "/images/partners/aldi-logo.png", 
    route: "/perks/aldi",
    deals: [
      { 
        id: 1,
        title: "Off-Peak Saver", 
        description: "5% cashback on weekday shops", 
        icon: "percent",
        fullDescription: "Shop on any weekday (Mon-Fri) to get 5% cashback on your entire shop."
      },
      { 
        id: 2,
        title: "Study-Session Bundle", 
        description: "15% off on Drinks, Snacks & Easy Meals", 
        icon: "coffee",
        fullDescription: "Get 15% off when you buy one item from each category: Drinks, Snacks, and Easy Meals."
      },
      { 
        id: 3,
        title: "Flatmate Feast Bonus", 
        description: "Free pizza with £60+ spend", 
        icon: "pizza",
        fullDescription: "Spend over £60 in one group transaction and get a free pizza for the flat."
      },
      { 
        id: 4,
        title: "End-of-Loan Recipe Challenge", 
        description: "Scan 3 pantry items to get a recipe and 25% off the missing ingredients.", 
        icon: "chef-hat",
        fullDescription: "Scan 3 pantry items to get a recipe and 25% off the missing ingredients."
      },
      { 
        id: 5,
        title: "Fresh Start Challenge", 
        description: "Buy 5 different fresh produce items on a Monday or Tuesday to get £2 cashback.", 
        icon: "leaf",
        fullDescription: "Buy 5 different fresh produce items on a Monday or Tuesday to get £2 cashback."
      },
    ]
  },
  { 
    id: 2, 
    name: "Lidl", 
    slug: "lidl",
    logo: "/images/partners/lidl-logo.png", 
    route: "/perks/lidl",
    deals: [
      { 
        id: 1,
        title: "Bakery Boost", 
        description: "10% off all bakery items", 
        icon: "coffee",
        fullDescription: "Get 10% off all bakery items when you shop at Lidl."
      },
      { 
        id: 2,
        title: "Snack Attack", 
        description: "Buy 2 get 1 free on snacks", 
        icon: "gift",
        fullDescription: "Buy 2 get 1 free on selected snacks and treats."
      },
      { 
        id: 3,
        title: "Weekly Saver", 
        description: "£5 off £30 weekly shop", 
        icon: "percent",
        fullDescription: "Spend £30 or more in a single transaction and get £5 cashback."
      },
    ]
  },
  { 
    id: 3, 
    name: "Morrisons", 
    slug: "morrisons",
    logo: "/images/partners/morrisons-logo.png", 
    route: "/perks/morrisons",
    deals: [
      { 
        id: 1,
        title: "Meal Deal Magic", 
        description: "20% off all meal deals", 
        icon: "shopping-bag",
        fullDescription: "Get 20% off all meal deals when you shop at Morrisons."
      },
      { 
        id: 2,
        title: "Breakfast Buddy", 
        description: "Free coffee with breakfast purchase", 
        icon: "coffee",
        fullDescription: "Get a free coffee when you purchase any breakfast item."
      },
      { 
        id: 3,
        title: "Sunday Special", 
        description: "Extra student discount on Sundays", 
        icon: "percent",
        fullDescription: "Get an extra 10% student discount on all purchases every Sunday."
      },
    ]
  },
  { 
    id: 4, 
    name: "Co-op", 
    slug: "coop",
    logo: "/images/partners/coop-logo.png", 
    route: "/perks/coop",
    deals: [
      { 
        id: 1,
        title: "Tuesday Treat", 
        description: "Double points every Tuesday", 
        icon: "sparkles",
        fullDescription: "Earn double reward points on all purchases made on Tuesdays."
      },
      { 
        id: 2,
        title: "Own Brand Bonus", 
        description: "15% off Co-op own-brand products", 
        icon: "percent",
        fullDescription: "Get 15% off all Co-op own-brand products."
      },
      { 
        id: 3,
        title: "Fresh Five", 
        description: "Buy 5 fresh items, get £2 cashback", 
        icon: "apple",
        fullDescription: "Buy 5 different fresh produce items and get £2 cashback."
      },
    ]
  },
];

