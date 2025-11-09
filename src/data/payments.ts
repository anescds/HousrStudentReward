export interface Payment {
  id: string;
  type: "rent" | "bills" | "utilities";
  amount: number;
  credits: number;
  date: string;
  description: string;
}

export const payments: Payment[] = [
  {
    id: "1",
    type: "rent",
    amount: 450,
    credits: 22.50,
    date: "2025-01-15",
    description: "January Rent"
  },
  {
    id: "2",
    type: "utilities",
    amount: 85,
    credits: 4.25,
    date: "2025-01-10",
    description: "Electricity Bill"
  },
  {
    id: "3",
    type: "bills",
    amount: 120,
    credits: 6.0,
    date: "2025-01-05",
    description: "Internet & Subscriptions"
  },
  {
    id: "4",
    type: "rent",
    amount: 450,
    credits: 22.5,
    date: "2024-12-15",
    description: "December Rent"
  },
  {
    id: "5",
    type: "utilities",
    amount: 80,
    credits: 4.0,
    date: "2024-12-10",
    description: "Gas & Water Bill"
  },
];