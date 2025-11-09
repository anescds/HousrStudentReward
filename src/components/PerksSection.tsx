import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPerks, getBalance, redeemPerk, type Perk } from "@/lib/api";
import { getIcon } from "@/lib/iconMap";
import { X } from "lucide-react";
import { useWebSocket } from "@/contexts/WebSocketContext";

interface PerksSectionProps {
  onBalanceUpdate?: (newBalance: number) => void;
}

export const PerksSection = ({ onBalanceUpdate }: PerksSectionProps) => {
  const [perks, setPerks] = useState<Perk[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { socket } = useWebSocket();

  useEffect(() => {
    const fetchData = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        const [perksResponse, balanceResponse] = await Promise.all([
          getPerks(),
          getBalance()
        ]);
        setPerks(perksResponse.perks);
        setBalance(balanceResponse.balance);
      } catch (error) {
        console.error('Error fetching perks:', error);
        const storedBalance = localStorage.getItem('user_balance');
        if (storedBalance) {
          setBalance(parseFloat(storedBalance));
        }
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchData(true); // Initial load

    // Listen for WebSocket events
    if (socket) {
      socket.on('new-deal-added', () => {
        console.log('New deal added via WebSocket, refreshing perks...');
        fetchData(false);
      });

      return () => {
        socket.off('new-deal-added');
      };
    }
  }, [socket]);

  const handleRedeemPerk = async (perk: Perk) => {
    try {
      const response = await redeemPerk({
        perkId: perk.id,
        perkName: perk.name,
        cost: perk.cost
      });

      if (response.success && response.newBalance !== undefined) {
        // Update balance
        setBalance(response.newBalance);
        localStorage.setItem('user_balance', response.newBalance.toString());
        
        // Notify parent component if callback provided
        if (onBalanceUpdate) {
          onBalanceUpdate(response.newBalance);
        }
        
        // Show success banner
        setBanner({ type: 'success', message: `Claimed perk: ${perk.name}` });
        
        // Auto-hide banner after 5 seconds
        setTimeout(() => setBanner(null), 5000);
      }
    } catch (err: any) {
      console.error('Failed to redeem perk:', err);
      
      // Show error banner
      const errorMessage = err.message && err.message.includes('Insufficient funds') 
        ? 'Insufficient funds' 
        : err.message || 'Failed to redeem perk';
      setBanner({ type: 'error', message: errorMessage });
      
      // Auto-hide banner after 5 seconds
      setTimeout(() => setBanner(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black uppercase text-foreground">PERKS</h3>
        <Button variant="outline" size="sm" className="brutal font-black uppercase text-xs">
          ALL
        </Button>
      </div>

      {/* Banner for success/error messages */}
      {banner && (
        <Card className={`brutal ${
          banner.type === 'success' 
            ? 'bg-success text-black' 
            : 'bg-destructive text-destructive-foreground'
        }`}>
          <CardContent className="p-4 flex items-center justify-between">
            <p className="font-black uppercase text-sm">{banner.message}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setBanner(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <p className="text-sm font-black uppercase text-muted-foreground">Loading perks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {perks.map((perk) => {
            const IconComponent = getIcon(perk.icon);
            const canAfford = balance >= perk.cost;
            return (
              <Card key={perk.id} className="brutal-card p-5 transform hover:rotate-[1deg] transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="bg-accent p-3 border-4 border-black dark:border-white">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black uppercase text-foreground">{perk.name}</p>
                      <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">
                        {perk.description}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">
                        {perk.category}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="brutal bg-primary hover:bg-primary-light text-primary-foreground font-black"
                    disabled={!canAfford && perk.cost > 0}
                    onClick={() => handleRedeemPerk(perk)}
                  >
                    {perk.cost === 0 ? "USE" : `£${perk.cost}`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
