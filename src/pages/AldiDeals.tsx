import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getPartnerPerks, redeemPartnerPerk, type PartnerDeal } from "@/lib/api";
import { getIcon } from "@/lib/iconMap";
import { useWebSocket } from "@/contexts/WebSocketContext";

export default function AldiDeals() {
  const navigate = useNavigate();
  const { partner } = useParams<{ partner: string }>();
  const partnerSlug = partner || "aldi";
  const [deals, setDeals] = useState<PartnerDeal[]>([]);
  const [partnerName, setPartnerName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<PartnerDeal | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { socket } = useWebSocket();

  useEffect(() => {
    const fetchPartnerPerks = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        const response = await getPartnerPerks(partnerSlug);
        setDeals(response.perks);
        setPartnerName(response.partner.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load partner perks');
        console.error('Error fetching partner perks:', err);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchPartnerPerks(true); // Initial load

    // Listen for WebSocket events
    if (socket) {
      socket.on('new-deal-added', (data: { partner: string; deal: any }) => {
        // Only refresh if the new deal is for the current partner
        if (data.partner.toLowerCase() === partnerSlug.toLowerCase()) {
          console.log('New deal added via WebSocket, refreshing deals...');
          fetchPartnerPerks(false);
        }
      });

      return () => {
        socket.off('new-deal-added');
      };
    }
  }, [partnerSlug, socket]);

  const handleAddToCalendar = (deal: PartnerDeal | null) => {
    // In a real app, this would integrate with calendar APIs
    if (deal) {
      console.log("Adding to calendar:", deal.title);
    }
    setSelectedDeal(null);
  };

  const handleRedeem = async (deal: PartnerDeal | null) => {
    if (!deal) {
      return;
    }

    try {
      const response = await redeemPartnerPerk(partnerSlug, deal.id);
      
      if (response.success) {
        // Show success banner
        setBanner({ type: 'success', message: `Claimed perk: ${deal.title}` });
        setSelectedDeal(null);
        
        // Auto-hide banner after 5 seconds
        setTimeout(() => setBanner(null), 5000);
      }
    } catch (err) {
      console.error('Failed to redeem partner perk:', err);
      setBanner({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Failed to redeem perk' 
      });
      
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
            onClick={() => navigate("/perks")}
            className="text-primary-foreground hover:bg-black/20 dark:hover:bg-white/20 border-4 border-black dark:border-white brutal-hover"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-black uppercase">{partnerName.toUpperCase() || "DEALS"} DEALS</h1>
            <p className="text-xs font-black uppercase tracking-wider">STUDENT OFFERS</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
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

        {loading ? (
          <div className="text-center py-8">
            <p className="font-black uppercase">Loading deals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="font-black uppercase text-destructive">Error: {error}</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-black uppercase">No deals available</p>
          </div>
        ) : (
          deals.map((deal) => {
            const IconComponent = getIcon(deal.icon);
            return (
              <Card 
                key={deal.id}
                className="brutal-card cursor-pointer transform hover:rotate-[1deg] transition-transform"
                onClick={() => setSelectedDeal(deal)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary border-4 border-black dark:border-white flex items-center justify-center shrink-0">
                      <IconComponent className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black mb-2 uppercase">{deal.title}</h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase">{deal.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>

      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-md brutal bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase">
              {selectedDeal && (
                <>
                  <div className="w-12 h-12 bg-primary border-4 border-black dark:border-white flex items-center justify-center">
                    {(() => {
                      const IconComponent = getIcon(selectedDeal.icon);
                      return <IconComponent className="w-6 h-6 text-primary-foreground" />;
                    })()}
                  </div>
                  {selectedDeal.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm font-bold pt-4 uppercase">
              {selectedDeal?.fullDescription || selectedDeal?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-3 mt-4">
            <Button 
              className="w-full brutal font-black uppercase"
              onClick={() => handleRedeem(selectedDeal)}
            >
              REDEEM NOW
            </Button>
            <Button 
              variant="outline" 
              className="w-full brutal-hover font-black uppercase"
              onClick={() => handleAddToCalendar(selectedDeal)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              ADD TO CALENDAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
