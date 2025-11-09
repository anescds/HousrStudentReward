import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home } from "lucide-react";
import { createTransaction } from "@/lib/api";

interface PaymentDialogProps {
  onPaymentSuccess: (amount: number, balance: number) => void;
}

export const PaymentDialog = ({ onPaymentSuccess }: PaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Pay Rent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill description when dialog opens
  useEffect(() => {
    if (open) {
      setDescription("Pay Rent");
      setAmount("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount > 0 && description.trim()) {
      setLoading(true);
      setError(null);
      
      try {
        // Create transaction in the backend
        const transactionData = {
          amount: paymentAmount,
          description: description.trim(),
          type: "payment",
          merchant: description.trim()
        };
        
        const response = await createTransaction(transactionData);
        
        // Call success callback with amount and updated balance
        onPaymentSuccess(paymentAmount, response.balance);
        setOpen(false);
        setAmount("");
        setDescription("");
      } catch (err) {
        console.error('Failed to create transaction:', err);
        setError(err instanceof Error ? err.message : 'Failed to process payment');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please enter both amount and description');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="brutal-hover flex-col h-auto py-6 gap-2 bg-card"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-black uppercase">Transact</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] brutal bg-card">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase">MAKE PAYMENT</DialogTitle>
              <DialogDescription className="font-bold uppercase text-xs">
                ENTER AMOUNT & DESCRIPTION - YOU'LL EARN 5% REWARDS!
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount" className="font-black uppercase text-sm">AMOUNT (£)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="brutal"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="font-black uppercase text-sm">DESCRIPTION</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="e.g., Rent Payment, Groceries, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="brutal"
                />
              </div>
              <div className="bg-success p-4 text-black font-bold border-4 border-black dark:border-white">
                <p className="uppercase text-sm">
                  🎉 REWARDS: <span className="font-black">{amount ? `£${(parseFloat(amount) * 0.05).toFixed(2)}` : '£0.00'}</span>
                </p>
              </div>
            </div>
            {error && (
              <div className="bg-destructive text-destructive-foreground p-3 rounded border-4 border-black dark:border-white">
                <p className="text-sm font-bold uppercase">{error}</p>
              </div>
            )}
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full brutal font-black uppercase"
                disabled={loading}
              >
                {loading ? "PROCESSING..." : "COMPLETE PAYMENT"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
