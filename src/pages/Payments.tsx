import { useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Home as HomeIcon, Zap, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSimulation } from "@/contexts/SimulationContext";

const getIcon = (type: string) => {
  switch (type) {
    case "rent":
      return HomeIcon;
    case "utilities":
      return Zap;
    case "bills":
      return Wifi;
    default:
      return HomeIcon;
  }
};

export default function Payments() {
  const navigate = useNavigate();
  const { payments, refreshTransactions } = useSimulation();

  // Refresh transactions when page loads
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

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
          <div>
            <h1 className="text-4xl font-black uppercase">PAYMENTS</h1>
            <p className="text-xs font-black uppercase tracking-wider">ALL TRANSACTIONS</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {payments.map((payment) => {
          const Icon = getIcon(payment.type);
          return (
            <Card key={payment.id} className="brutal-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary border-4 border-black dark:border-white flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-black uppercase">{payment.description}</p>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(payment.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl">£{payment.amount.toFixed(2)}</p>
                    <p className="text-xs text-success font-black">+£{payment.credits.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}
