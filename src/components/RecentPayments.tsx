import { Card } from "@/components/ui/card";
import { Home, Zap, Wifi, Receipt } from "lucide-react";
import { useSimulation } from "@/contexts/SimulationContext";

const getIcon = (type: string) => {
  switch (type) {
    case "rent":
      return <Home className="w-5 h-5" />;
    case "utilities":
      return <Zap className="w-5 h-5" />;
    case "bills":
    case "payment":
      return <Wifi className="w-5 h-5" />;
    default:
      return <Receipt className="w-5 h-5" />;
  }
};

export const RecentPayments = () => {
  const { payments } = useSimulation();
  // Show only the 3 most recent payments on the home page
  const recentPayments = payments.slice(0, 3);
  
  return (
    <div className="space-y-6">
      <h3 className="text-3xl font-black uppercase text-foreground">RECENT PAYMENTS</h3>
      
      <div className="space-y-4">
        {recentPayments.map((payment) => (
          <Card key={payment.id} className="brutal-card p-5 transform hover:rotate-[-1deg] transition-transform">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary p-3 border-4 border-black dark:border-white">
                  {getIcon(payment.type)}
                </div>
                <div>
                  <p className="font-black uppercase text-foreground">{payment.description}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">
                    {new Date(payment.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-black text-xl text-foreground">£{payment.amount}</p>
                <p className="text-sm font-bold text-success">+£{payment.credits.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
