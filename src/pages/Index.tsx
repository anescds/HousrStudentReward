import { useState, useEffect, useCallback } from "react";
import { WalletCard } from "@/components/WalletCard";
import { QuickActions } from "@/components/QuickActions";
import { RecentPayments } from "@/components/RecentPayments";
import { PerksSection } from "@/components/PerksSection";
import { BottomNav } from "@/components/BottomNav";
import { PaymentConfetti } from "@/components/PaymentConfetti";
import { AIRoastCard } from "@/components/AIRoastCard";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimulation } from "@/contexts/SimulationContext";
import { getBalance } from "@/lib/api";
import { useWebSocket } from "@/contexts/WebSocketContext";

const Index = () => {
  const { payments, refreshTransactions } = useSimulation();
  const [showConfetti, setShowConfetti] = useState(false);
  // Initialize balance from localStorage immediately (before API call completes)
  const [balance, setBalance] = useState<number>(() => {
    const storedBalance = localStorage.getItem('user_balance');
    return storedBalance ? parseFloat(storedBalance) : 0;
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch balance from API
  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const balanceResponse = await getBalance();
      setBalance(balanceResponse.balance);
      // Also update localStorage for consistency
      localStorage.setItem('user_balance', balanceResponse.balance.toString());
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      // Fallback to localStorage if available
      const storedBalance = localStorage.getItem('user_balance');
      if (storedBalance) {
        setBalance(parseFloat(storedBalance));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch balance on component mount (page load/refresh)
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const { socket } = useWebSocket();

  // Refresh balance when page becomes visible again (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing balance...');
        fetchBalance();
      }
    };

    const handleFocus = () => {
      console.log('Window gained focus, refreshing balance...');
      fetchBalance();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchBalance]);

  // Listen for WebSocket events to refresh balance and transactions
  useEffect(() => {
    if (socket) {
      socket.on('refresh-wallet', () => {
        console.log('WebSocket: refresh-wallet event received, refreshing balance...');
        fetchBalance();
        refreshTransactions();
      });

      socket.on('refresh-balance', () => {
        console.log('WebSocket: refresh-balance event received, refreshing balance...');
        fetchBalance();
      });

      socket.on('test-month-update', (data: { month: string; monthIndex: number; totalMonths: number }) => {
        console.log(`Test simulation: ${data.month} (${data.monthIndex}/${data.totalMonths})`);
        // Refresh balance and transactions when month updates
        fetchBalance();
        refreshTransactions();
      });

      return () => {
        socket.off('refresh-wallet');
        socket.off('refresh-balance');
        socket.off('test-month-update');
      };
    }
  }, [socket, fetchBalance, refreshTransactions]);
  
  // Calculate monthly earned (current month) from payments
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyEarned = payments
    .filter(p => {
      const date = new Date(p.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.credits, 0);

  const handlePaymentSuccess = async (amount: number, newBalance: number) => {
    // Update balance immediately with the value from the transaction response
    setBalance(newBalance);
    localStorage.setItem('user_balance', newBalance.toString());
    setShowConfetti(true);
    
    // Refresh transactions from wallet endpoint
    await refreshTransactions();
    
    // Also refresh balance from API to ensure consistency
    await fetchBalance();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PaymentConfetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-6 sticky top-0 z-10 border-b-8 border-black dark:border-white shadow-[0_8px_0_0_rgba(0,0,0,1)] dark:shadow-[0_8px_0_0_rgba(255,255,255,1)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase">HOUSR</h1>
            <p className="text-xs font-black uppercase tracking-wider">STUDENT REWARDS</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-black/20 dark:hover:bg-white/20 border-4 border-black dark:border-white brutal-hover"
          >
            <Bell className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Wallet Balance Card */}
        <WalletCard balance={balance} monthlyEarned={monthlyEarned} />
        
        {/* Quick Actions */}
        <QuickActions onPaymentSuccess={handlePaymentSuccess} />
        
        {/* AI Roast Section */}
        <AIRoastCard balance={balance} monthlyEarned={monthlyEarned} />
        
        {/* Recent Payments */}
        <RecentPayments />
        
        {/* Perks Section */}
        <PerksSection onBalanceUpdate={(newBalance) => {
          setBalance(newBalance);
          localStorage.setItem('user_balance', newBalance.toString());
        }} />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
