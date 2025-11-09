import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { generateRoast } from "@/lib/api";
import { toast } from "sonner";
import { useSimulation } from "@/contexts/SimulationContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { VoicePlayer } from "@/components/VoicePlayer";

interface AIRoastCardProps {
  balance: number;
  monthlyEarned: number;
  spendingThreshold?: number;
}

export const AIRoastCard = ({ balance, monthlyEarned, spendingThreshold = 1300 }: AIRoastCardProps) => {
  const { payments, isSimulating, currentMonth } = useSimulation();
  const [roast, setRoast] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [overThreshold, setOverThreshold] = useState(false);
  const [highestMonth, setHighestMonth] = useState<{ month: string; total: number } | null>(null);

  const handleGenerateRoast = useCallback(async () => {
    setIsLoading(true);
    setHasGenerated(false);
    
    try {
      // Use the actual payments data from the payments tab
      const recentPayments = payments.slice(0, 4).map(p => ({
        merchant: p.description,
        amount: p.amount
      }));

      const data = await generateRoast({ balance, monthlyEarned, recentPayments });

      setRoast(data.roast);
      setHasGenerated(true);
      toast.success('Your financial roast is ready! 🔥', {
        description: 'Brace yourself...'
      });

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('429')) {
        toast.error('Whoa there! Slow down, tiger. Try again in a moment! 🐌');
      } else if (errorMessage.includes('402')) {
        toast.error('AI credits exhausted. Time to top up your workspace! 💳');
      } else {
        toast.error('Failed to generate your roast. Try again!');
      }
    } finally {
      setIsLoading(false);
    }
  }, [balance, monthlyEarned, payments]);

  const { socket } = useWebSocket();

  // Auto-generate roast when simulation advances to new month
  useEffect(() => {
    if (isSimulating && currentMonth) {
      handleGenerateRoast();
    }
  }, [currentMonth, isSimulating, handleGenerateRoast]);

  // Listen for WebSocket event to update threshold state (but don't auto-generate roast)
  useEffect(() => {
    if (socket) {
      socket.on('trigger-ai-roast', (data: { userId: string; month: string; monthlySpending: number; thresholdType?: 'regular' | 'emergency'; threshold?: number }) => {
        console.log('WebSocket: trigger-ai-roast event received, threshold exceeded:', data);
        // Don't automatically generate roast - just let the threshold detection handle the UI
        // The threshold detection useEffect will automatically update the overThreshold state
      });

      return () => {
        socket.off('trigger-ai-roast');
      };
    }
  }, [socket]);

  // Calculate monthly spending totals
  useEffect(() => {
    const monthlyTotals = new Map<string, number>();
    
    payments.forEach(payment => {
      const date = new Date(payment.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      
      const current = monthlyTotals.get(monthKey) || 0;
      monthlyTotals.set(monthKey, current + payment.amount);
    });

    // Find highest spending month
    let maxSpending = 0;
    let maxMonth = '';
    
    monthlyTotals.forEach((total, monthKey) => {
      if (total > maxSpending) {
        maxSpending = total;
        maxMonth = monthKey;
      }
    });

    if (maxSpending > spendingThreshold) {
      const date = new Date(maxMonth + '-01');
      const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      setOverThreshold(true);
      setHighestMonth({ month: monthName, total: maxSpending });
    } else {
      setOverThreshold(false);
      setHighestMonth(null);
    }
  }, [spendingThreshold, payments]);

  return (
    <Card className={`brutal p-6 transform rotate-[1deg] ${overThreshold ? 'bg-destructive' : 'bg-card'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {overThreshold ? (
            <AlertTriangle className="w-7 h-7 text-black dark:text-white" />
          ) : (
            <Sparkles className="w-7 h-7 text-primary" />
          )}
          <h3 className="text-2xl font-black uppercase">
            {overThreshold ? 'ALERT!' : 'AI ROAST'}
          </h3>
        </div>
      </div>
      
      {!hasGenerated ? (
        <div className="space-y-3">
          {overThreshold && highestMonth ? (
            <div className="p-4 bg-accent border-4 border-black dark:border-white mb-4">
              <p className="text-sm font-black uppercase mb-2 text-black dark:text-white">
                🚨 SPENDING ALERT
              </p>
              <p className="text-xs font-bold text-black dark:text-white">
                £{highestMonth.total.toFixed(2)} IN {highestMonth.month.toUpperCase()} 
                (LIMIT: £{spendingThreshold})
              </p>
            </div>
          ) : null}
          <p className="text-sm font-bold uppercase">
            {overThreshold 
              ? "GET YOUR FINANCIAL REALITY CHECK NOW!" 
              : "BRUTALLY HONEST AI FINANCIAL ROAST - NO FILTER!"
            }
          </p>
          <Button
            onClick={handleGenerateRoast}
            disabled={isLoading}
            className={`w-full ${overThreshold ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Roast...
              </>
            ) : (
              <>
                {overThreshold ? <AlertTriangle className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {overThreshold ? 'Get Financial Reality Check' : 'Roast My Finances'}
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <div 
              className="whitespace-pre-wrap text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: roast.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }}
            />
          </div>
          <VoicePlayer text={roast} className="mb-2" />
          <Button
            onClick={handleGenerateRoast}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Roast
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};