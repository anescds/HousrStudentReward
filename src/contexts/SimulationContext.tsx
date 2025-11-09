import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Payment, payments as initialPayments } from "@/data/payments";
import { getWallet, type Transaction } from "@/lib/api";
import { useWebSocket } from "./WebSocketContext";

interface SimulationContextType {
  payments: Payment[];
  isSimulating: boolean;
  currentMonth: string;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  refreshTransactions: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const generateMonthlyPayments = (monthOffset: number): Payment[] => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthOffset);
  const monthStr = date.toISOString().split('T')[0].slice(0, 7);
  
  const basePayments: Payment[] = [
    {
      id: `${monthOffset}-rent`,
      type: "rent",
      amount: 450,
      credits: 22.50,
      date: `${monthStr}-15`,
      description: `${date.toLocaleDateString('en-GB', { month: 'long' })} Rent`
    }
  ];

  // Random food/entertainment entries (2-5 per month)
  const randomCount = Math.floor(Math.random() * 4) + 2;
  for (let i = 0; i < randomCount; i++) {
    const types = ["utilities", "bills"] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 100) + 50;
    const day = Math.floor(Math.random() * 28) + 1;
    
    const descriptions: Record<typeof type, string[]> = {
      utilities: ["Electricity Bill", "Gas & Water Bill", "Heating", "Energy Bill"],
      bills: ["Internet & Subscriptions", "Mobile Phone", "Gym Membership", "Streaming Services", "Shopping"]
    };
    
    const descList = descriptions[type];
    const description = descList[Math.floor(Math.random() * descList.length)];
    
    basePayments.push({
      id: `${monthOffset}-${type}-${i}`,
      type,
      amount,
      credits: amount * 0.05,
      date: `${monthStr}-${day.toString().padStart(2, '0')}`,
      description
    });
  }

  return basePayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Helper function to convert Transaction to Payment format
const transactionToPayment = (transaction: Transaction): Payment => {
  // Map transaction types to Payment types
  let paymentType: "rent" | "bills" | "utilities" = "bills";
  if (transaction.type === "rent") {
    paymentType = "rent";
  } else if (transaction.type === "utilities") {
    paymentType = "utilities";
  } else if (transaction.type === "bills" || transaction.type === "payment") {
    paymentType = "bills";
  }
  
  return {
    id: transaction.id || '',
    type: paymentType,
    amount: transaction.amount,
    credits: transaction.credits || 0,
    date: transaction.date || new Date().toISOString(),
    description: transaction.description || transaction.merchant || 'Transaction'
  };
};

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [currentMonth, setCurrentMonth] = useState("");

  // Fetch transactions from API
  const refreshTransactions = useCallback(async () => {
    try {
      const walletResponse = await getWallet();
      const transactions = walletResponse.transactions;
      const paymentsFromApi = transactions.map(transactionToPayment);
      setPayments(paymentsFromApi);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Keep existing payments on error
    }
  }, []);

  const { socket } = useWebSocket();

  // Fetch transactions on mount
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  // Listen for WebSocket events to refresh wallet
  useEffect(() => {
    if (socket) {
      socket.on('refresh-wallet', (data: { userId: string }) => {
        console.log('WebSocket: refresh-wallet event received, refreshing transactions...');
        refreshTransactions();
      });

      return () => {
        socket.off('refresh-wallet');
      };
    }
  }, [socket, refreshTransactions]);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setCurrentMonthOffset((prev) => {
        const newOffset = prev + 1;
        if (newOffset > 12) {
          setIsSimulating(false);
          return prev;
        }
        
        const date = new Date();
        date.setMonth(date.getMonth() - newOffset);
        setCurrentMonth(date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }));
        
        // Generate cumulative payments for all months up to current
        const allPayments: Payment[] = [];
        for (let i = 0; i <= newOffset; i++) {
          allPayments.push(...generateMonthlyPayments(i));
        }
        setPayments(allPayments);
        
        return newOffset;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const startSimulation = () => {
    setIsSimulating(true);
    setCurrentMonthOffset(0);
    const date = new Date();
    setCurrentMonth(date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }));
    setPayments(generateMonthlyPayments(0));
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentMonthOffset(0);
    setCurrentMonth("");
    setPayments(initialPayments);
  };

  return (
    <SimulationContext.Provider value={{
      payments,
      isSimulating,
      currentMonth,
      startSimulation,
      stopSimulation,
      resetSimulation,
      refreshTransactions
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within SimulationProvider");
  }
  return context;
};
