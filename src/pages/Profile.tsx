import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, MapPin, Award, Settings, LogOut, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSimulation } from "@/contexts/SimulationContext";
import { startTest, endTest } from "@/lib/api";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const { payments } = useSimulation();
  
  const totalEarned = payments.reduce((sum, p) => sum + p.credits, 0);
  const redeemed = 45.50;
  const available = totalEarned - redeemed;

  const handleStartSimulation = async () => {
    try {
      await startTest();
      toast.success('Test simulation started!', {
        description: 'Transactions will be added every 7 seconds for 12 months.'
      });
    } catch (error) {
      console.error('Failed to start test:', error);
      toast.error('Failed to start simulation', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const handleEndSimulation = async () => {
    try {
      await endTest();
      toast.success('Test simulation stopped!', {
        description: 'The running test has been stopped.'
      });
    } catch (error) {
      console.error('Failed to stop test:', error);
      toast.error('Failed to stop simulation', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
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
          <div>
            <h1 className="text-4xl font-black uppercase">PROFILE</h1>
            <p className="text-xs font-black uppercase tracking-wider">YOUR ACCOUNT</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <Card className="brutal-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-24 h-24 border-4 border-black dark:border-white">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-black">
                  JS
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-black uppercase">JOHN SMITH</h2>
                <p className="text-sm font-bold text-muted-foreground uppercase">STUDENT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase">INFO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">EMAIL</p>
                <p className="font-black">john.smith@university.ac.uk</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">ADDRESS</p>
                <p className="font-black">STUDENT HOUSING, BLOCK A</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">MEMBER SINCE</p>
                <p className="font-black">JANUARY 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="brutal-card bg-accent transform rotate-[1deg]">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase text-black dark:text-white">REWARDS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-3xl font-black text-black dark:text-white">£{totalEarned.toFixed(0)}</p>
                <p className="text-xs font-bold text-black/80 dark:text-white/80 uppercase">EARNED</p>
              </div>
              <div>
                <p className="text-3xl font-black text-black dark:text-white">£{redeemed.toFixed(0)}</p>
                <p className="text-xs font-bold text-black/80 dark:text-white/80 uppercase">REDEEMED</p>
              </div>
              <div>
                <p className="text-3xl font-black text-black dark:text-white">£{available.toFixed(0)}</p>
                <p className="text-xs font-bold text-black/80 dark:text-white/80 uppercase">AVAILABLE</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="brutal-card bg-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase text-black dark:text-white">Run simulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={handleStartSimulation}
                className="brutal-hover flex-1 font-black uppercase"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
              <Button 
                onClick={handleEndSimulation}
                variant="outline"
                className="brutal-hover font-black uppercase"
                size="lg"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button variant="outline" className="brutal-hover w-full justify-start font-black uppercase" size="lg">
            <Settings className="w-5 h-5 mr-2" />
            SETTINGS
          </Button>
          <Button variant="outline" className="brutal-hover w-full justify-start text-destructive hover:text-destructive font-black uppercase" size="lg">
            <LogOut className="w-5 h-5 mr-2" />
            LOG OUT
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
