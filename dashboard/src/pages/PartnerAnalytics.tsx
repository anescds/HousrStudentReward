import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PartnerNav from "@/components/partner/PartnerNav";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Eye, ShoppingCart, TrendingUp } from "lucide-react";
import { getRedeems, getDeals } from "@/lib/api";

// Aldi deals data (matching server data structure)
const ALDI_DEALS = [
  { id: 1, title: "Off-Peak Saver" },
  { id: 2, title: "Study-Session Bundle" },
  { id: 3, title: "Flatmate Feast Bonus" },
  { id: 4, title: "End-of-Loan Recipe Challenge" },
  { id: 5, title: "Fresh Start Challenge" },
];

interface DealStats {
  id: number;
  title: string;
  views: number;
  redemptions: number;
  conversionRate: number;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const PartnerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dealsStats, setDealsStats] = useState<DealStats[]>([]);
  const [topDeals, setTopDeals] = useState<any[]>([]);
  const [constantViews, setConstantViews] = useState<{ [dealId: number]: number }>({});

  useEffect(() => {
    fetchAnalytics(true); // Initial load with loading state
    
    // Poll for real-time updates every 2 seconds
    const interval = setInterval(() => {
      fetchAnalytics(false); // Poll without loading state
    }, 2000);
    
    // Refresh analytics when window gains focus
    const handleFocus = () => {
      fetchAnalytics(false);
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchAnalytics = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      // Fetch redemption stats and deals (for constant views) from API
      const [redeemsResponse, dealsResponse] = await Promise.all([
        getRedeems(),
        getDeals()
      ]);
      
      const redemptions = redeemsResponse.redemptions;
      
      // On initial load, store constant views from deals endpoint
      if (isInitialLoad && Object.keys(constantViews).length === 0) {
        const initialViews: { [dealId: number]: number } = {};
        dealsResponse.deals.forEach(deal => {
          initialViews[parseInt(deal.id)] = deal.views;
        });
        setConstantViews(initialViews);
      }

      // Map deals with their redemption counts and constant views
      const stats = ALDI_DEALS.map((deal) => {
        const redemptionsCount = redemptions[deal.id] || 0;
        // Use constant views from deals endpoint, or from stored constantViews
        const dealData = dealsResponse.deals.find(d => parseInt(d.id) === deal.id);
        const views = dealData?.views || constantViews[deal.id] || 100;
        
        return {
          id: deal.id,
          title: deal.title,
          views,
          redemptions: redemptionsCount,
          conversionRate: views > 0 ? (redemptionsCount / views) * 100 : 0,
        };
      });

      setDealsStats(stats);

      // Get top 5 deals by redemptions
      const sortedByRedemptions = [...stats]
        .sort((a, b) => b.redemptions - a.redemptions)
        .slice(0, 5);
      setTopDeals(sortedByRedemptions);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PartnerNav />
        <div className="container mx-auto p-6">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (dealsStats.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <PartnerNav />
        <div className="container mx-auto p-6">
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No analytics data yet</h3>
              <p className="text-muted-foreground">Create some deals to start seeing analytics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalViews = dealsStats.reduce((sum, deal) => sum + deal.views, 0);
  const totalRedemptions = dealsStats.reduce((sum, deal) => sum + deal.redemptions, 0);
  const avgConversion = totalViews > 0 ? (totalRedemptions / totalViews) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <PartnerNav />
      
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Detailed insights into your deals performance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Views
              </CardTitle>
              <Eye className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalViews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all active deals
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Redemptions
              </CardTitle>
              <ShoppingCart className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalRedemptions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Students used your deals
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Conversion
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{avgConversion.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Views to redemptions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl">Views vs Redemptions</CardTitle>
              <CardDescription>Compare engagement across your deals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dealsStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="title" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="hsl(var(--chart-2))" name="Views" />
                  <Bar dataKey="redemptions" fill="hsl(var(--chart-4))" name="Redemptions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl">Top Performing Deals</CardTitle>
              <CardDescription>By redemption count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topDeals}
                    dataKey="redemptions"
                    nameKey="title"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.redemptions}`}
                  >
                    {topDeals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Conversion Rates by Deal</CardTitle>
              <CardDescription>Percentage of views that became redemptions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dealsStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="title"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis unit="%" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="conversionRate" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="Conversion Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnerAnalytics;
