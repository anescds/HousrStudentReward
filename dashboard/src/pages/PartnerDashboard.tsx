import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PartnerNav from "@/components/partner/PartnerNav";
import { Tag, Eye, ShoppingCart, TrendingUp, Plus, BarChart3 } from "lucide-react";
import { getPartner, getStats } from "@/lib/api";

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeals: 0,
    activeDeals: 0,
    totalViews: 0,
    totalRedemptions: 0,
  });
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => {
    const fetchData = async (isInitialLoad = false) => {
      if (isInitialLoad) {
        setLoading(true);
      }
      try {
        const [partnerResponse, statsResponse] = await Promise.all([
          getPartner(),
          getStats()
        ]);

        setPartner(partnerResponse.partner);
        setStats(statsResponse.stats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchData(true); // Initial load with loading state
    
    // Poll for real-time updates every 2 seconds
    const interval = setInterval(() => {
      fetchData(false); // Poll without loading state
    }, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const statCards = [
    {
      title: "Total Deals",
      value: stats.totalDeals,
      icon: Tag,
      description: `${stats.activeDeals} active`,
      color: "text-primary",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      icon: Eye,
      description: "Students viewed your deals",
      color: "text-primary",
    },
    {
      title: "Total Redemptions",
      value: stats.totalRedemptions,
      icon: ShoppingCart,
      description: "Deals redeemed by students",
      color: "text-primary",
    },
    {
      title: "Conversion Rate",
      value: stats.totalViews > 0 ? `${((stats.totalRedemptions / stats.totalViews) * 100).toFixed(1)}%` : "0%",
      icon: TrendingUp,
      description: "Views to redemptions",
      color: "text-primary",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <PartnerNav />
        <div className="container mx-auto p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <PartnerNav />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Welcome back, {partner?.name || "Aldi"}!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Here's an overview of your partnership performance
            </p>
          </div>
          <Button onClick={() => navigate("/partner/deals/new")} size="lg" className="shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Deal
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="glass-card hover:scale-105 transition-transform duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your partnership</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/partner/deals/new")} variant="default" size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Create New Deal
            </Button>
            <Button onClick={() => navigate("/partner/deals")} variant="outline" size="lg" className="glass">
              <Tag className="w-5 h-5 mr-2" />
              Manage Deals
            </Button>
            <Button onClick={() => navigate("/partner/analytics")} variant="outline" size="lg" className="glass">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerDashboard;
