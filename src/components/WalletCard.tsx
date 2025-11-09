import { Card } from "@/components/ui/card";
import { Coins, TrendingUp } from "lucide-react";
import { AnimatedBalance } from "./AnimatedBalance";

interface WalletCardProps {
  balance: number;
  monthlyEarned: number;
}

export const WalletCard = ({ balance, monthlyEarned }: WalletCardProps) => {
  return (
    <Card className="brutal bg-primary text-primary-foreground p-8 transform rotate-[-1deg]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-wider mb-2">REWARDS BALANCE</p>
          <h2 className="text-6xl font-black">
            <AnimatedBalance value={balance} />
          </h2>
        </div>
        <div className="bg-accent p-4 border-4 border-black dark:border-white">
          <Coins className="w-8 h-8 text-black dark:text-white" />
        </div>
      </div>
      
      <div className="flex items-center gap-3 bg-success p-4 mt-6 border-4 border-black dark:border-white">
        <TrendingUp className="w-5 h-5 text-black dark:text-white font-bold" />
        <span className="text-sm font-bold text-black dark:text-white uppercase">
          +£{monthlyEarned.toFixed(2)} THIS MONTH
        </span>
      </div>
    </Card>
  );
};
