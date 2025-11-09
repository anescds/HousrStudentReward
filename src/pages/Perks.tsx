import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { PartnerPerkCard } from "@/components/PartnerPerkCard";
import { getPerks, getPartners, getBalance, redeemPerk, type Perk, type Partner, type PartnerDeal } from "@/lib/api";
import { getIcon } from "@/lib/iconMap";
import { useWebSocket } from "@/contexts/WebSocketContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Perks() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [allPerks, setAllPerks] = useState<Perk[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(
    location.state?.banner || null
  );

  const { socket } = useWebSocket();

  useEffect(() => {
    const fetchData = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        const [perksResponse, partnersResponse, balanceResponse] = await Promise.all([
          getPerks(),
          getPartners(),
          getBalance()
        ]);
        setAllPerks(perksResponse.perks);
        setPartners(partnersResponse.partners);
        setCurrentBalance(balanceResponse.balance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load perks');
        console.error('Error fetching perks:', err);
        // Fallback to localStorage if available
        const storedBalance = localStorage.getItem('user_balance');
        if (storedBalance) {
          setCurrentBalance(parseFloat(storedBalance));
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
        console.log('New deal added via WebSocket, refreshing perks and partners...');
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
        setCurrentBalance(response.newBalance);
        localStorage.setItem('user_balance', response.newBalance.toString());
        
        // Show success banner
        setBanner({ type: 'success', message: `Claimed perk: ${perk.name}` });
        
        // Auto-hide banner after 5 seconds
        setTimeout(() => setBanner(null), 5000);
      }
    } catch (err: any) {
      console.error('Failed to redeem perk:', err);
      
      // Check if it's an insufficient funds error
      if (err.message && err.message.includes('Insufficient funds')) {
        setBanner({ type: 'error', message: 'Insufficient funds' });
      } else {
        setBanner({ type: 'error', message: err.message || 'Failed to redeem perk' });
      }
      
      // Auto-hide banner after 5 seconds
      setTimeout(() => setBanner(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-6 sticky top-0 z-10 border-b-8 border-black dark:border-white shadow-[0_8px_0_0_rgba(0,0,0,1)] dark:shadow-[0_8px_0_0_rgba(255,255,255,1)]">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-black/20 dark:hover:bg-white/20 border-4 border-black dark:border-white brutal-hover"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-black uppercase">PERKS</h1>
            <p className="text-xs font-black uppercase tracking-wider">EXCLUSIVE DEALS</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-32">
        {/* Banner for success/error messages */}
        {banner && (
          <Card className={`brutal mb-4 ${
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

        <Tabs defaultValue="partner" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 brutal bg-card sticky top-[88px] z-20">
            <TabsTrigger value="general" className="font-black uppercase">GENERAL</TabsTrigger>
            <TabsTrigger value="partner" className="font-black uppercase">PARTNERS</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="brutal bg-primary text-primary-foreground transform rotate-[-1deg]">
              <CardContent className="p-6">
                <p className="text-xs font-black uppercase mb-2">YOUR BALANCE</p>
                <p className="text-5xl font-black">£{currentBalance.toFixed(2)}</p>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-8">
                <p className="font-black uppercase">Loading perks...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="font-black uppercase text-destructive">Error: {error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allPerks.map((perk) => {
                  const canAfford = currentBalance >= perk.cost;
                  const IconComponent = getIcon(perk.icon);
                  return (
                    <Card key={perk.id} className="brutal-card">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-primary border-4 border-black dark:border-white flex items-center justify-center shrink-0">
                            <IconComponent className="w-7 h-7 text-primary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-black uppercase">{perk.name}</h3>
                              <Badge variant="secondary" className="shrink-0 brutal font-black">
                                £{perk.cost}
                              </Badge>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">{perk.description}</p>
                            <Button
                              size="sm"
                              disabled={!canAfford}
                              className="w-full brutal font-black uppercase"
                              onClick={() => handleRedeemPerk(perk)}
                            >
                              {canAfford ? "REDEEM" : "INSUFFICIENT"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="partner" className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="font-black uppercase">Loading partners...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="font-black uppercase text-destructive">Error: {error}</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black uppercase">PARTNERS</h2>
                  <Badge variant="secondary" className="text-sm brutal font-black">
                    {partners.reduce((total, partner) => total + partner.deals.length, 0)} DEALS
                  </Badge>
                </div>
                <div className="space-y-5">
                  {partners.map((partner) => {
                    // Convert icon strings to icon components for deals
                    const dealsWithIcons = partner.deals.map(deal => ({
                      ...deal,
                      icon: getIcon(deal.icon)
                    }));
                    
                    return (
                      <PartnerPerkCard
                        key={partner.id}
                        id={partner.id}
                        name={partner.name}
                        logo={partner.logoUrl}
                        route={partner.route}
                        deals={dealsWithIcons}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
