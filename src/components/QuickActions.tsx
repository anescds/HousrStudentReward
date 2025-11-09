import { Button } from "@/components/ui/button";
import { Gift, History } from "lucide-react";
import { PaymentDialog } from "./PaymentDialog";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  onPaymentSuccess: (amount: number) => void;
}

export const QuickActions = ({ onPaymentSuccess }: QuickActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button 
        variant="outline" 
        className="brutal-hover flex-col h-auto py-6 gap-2 bg-card"
        onClick={() => navigate("/perks")}
      >
        <Gift className="w-6 h-6" />
        <span className="text-xs font-black uppercase">Perks</span>
      </Button>
      
      <PaymentDialog onPaymentSuccess={onPaymentSuccess} />
      
      <Button 
        variant="outline" 
        className="brutal-hover flex-col h-auto py-6 gap-2 bg-card"
        onClick={() => navigate("/payments")}
      >
        <History className="w-6 h-6" />
        <span className="text-xs font-black uppercase">History</span>
      </Button>
    </div>
  );
};
