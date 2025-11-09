import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, PieChart, BarChart3, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSimulation } from "@/contexts/SimulationContext";
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Infographics() {
  const navigate = useNavigate();
  const { payments } = useSimulation();

  // Process data for visualizations
  const categoryData = payments.reduce((acc, payment) => {
    const existing = acc.find(item => item.name === payment.type);
    if (existing) {
      existing.value += payment.amount;
      existing.count += 1;
    } else {
      acc.push({
        name: payment.type.toUpperCase(),
        value: payment.amount,
        count: 1,
      });
    }
    return acc;
  }, [] as { name: string; value: number; count: number }[]);

  const monthlyData = payments.reduce((acc, payment) => {
    const date = new Date(payment.date);
    const monthKey = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    const existing = acc.find(item => item.month === monthKey);
    if (existing) {
      existing.spent += payment.amount;
      existing.rewards += payment.credits;
    } else {
      acc.push({
        month: monthKey,
        spent: payment.amount,
        rewards: payment.credits,
      });
    }
    return acc;
  }, [] as { month: string; spent: number; rewards: number }[]).reverse();

  const totalEarned = payments.reduce((sum, p) => sum + p.credits, 0);
  const redeemed = 45.50;
  const available = totalEarned - redeemed;
  
  const rewardsData = [
    { name: 'EARNED', value: totalEarned },
    { name: 'REDEEMED', value: redeemed },
    { name: 'AVAILABLE', value: available },
  ];

  // Brutalist color scheme
  const COLORS = ['#00BFA5', '#FFD600', '#FF5252', '#00E676', '#FF6E40', '#00B8D4'];
  const chartColors = {
    spent: '#FF5252',
    rewards: '#00BFA5',
    grid: '#333',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="brutal bg-card p-3">
          <p className="font-black uppercase text-xs">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-bold" style={{ color: entry.color }}>
              {entry.name}: £{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
            <h1 className="text-4xl font-black uppercase">STATS</h1>
            <p className="text-xs font-black uppercase tracking-wider">YOUR DATA VISUALIZED</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="brutal bg-primary transform rotate-[-2deg] hover:rotate-0 transition-transform">
            <CardContent className="p-5">
              <TrendingUp className="w-8 h-8 text-primary-foreground mb-2" />
              <p className="text-xs font-black uppercase text-primary-foreground">TOTAL SPENT</p>
              <p className="text-3xl font-black text-primary-foreground">
                £{payments.reduce((sum, p) => sum + p.amount, 0).toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="brutal bg-success transform rotate-[2deg] hover:rotate-0 transition-transform">
            <CardContent className="p-5">
              <PieChart className="w-8 h-8 text-success-foreground mb-2" />
              <p className="text-xs font-black uppercase text-success-foreground">REWARDS EARNED</p>
              <p className="text-3xl font-black text-success-foreground">
                £{payments.reduce((sum, p) => sum + p.credits, 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Spending by Category */}
        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              SPENDING BREAKDOWN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeWidth={2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'currentColor', fontWeight: 'bold', fontSize: 12 }}
                  stroke="currentColor"
                  strokeWidth={3}
                />
                <YAxis 
                  tick={{ fill: 'currentColor', fontWeight: 'bold', fontSize: 12 }}
                  stroke="currentColor"
                  strokeWidth={3}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              MONTHLY TRENDS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} strokeWidth={2} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'currentColor', fontWeight: 'bold', fontSize: 10 }}
                  stroke="currentColor"
                  strokeWidth={3}
                />
                <YAxis 
                  tick={{ fill: 'currentColor', fontWeight: 'bold', fontSize: 12 }}
                  stroke="currentColor"
                  strokeWidth={3}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontWeight: 'bold', fontSize: 12 }}
                  iconType="square"
                />
                <Line 
                  type="monotone" 
                  dataKey="spent" 
                  stroke={chartColors.spent} 
                  strokeWidth={4}
                  dot={{ fill: chartColors.spent, strokeWidth: 3, r: 6, stroke: '#000' }}
                  name="SPENT"
                />
                <Line 
                  type="monotone" 
                  dataKey="rewards" 
                  stroke={chartColors.rewards} 
                  strokeWidth={4}
                  dot={{ fill: chartColors.rewards, strokeWidth: 3, r: 6, stroke: '#000' }}
                  name="REWARDS"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rewards Pie Chart */}
        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              REWARDS STATUS
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={rewardsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: £${value}`}
                  outerRadius={80}
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={3}
                >
                  {rewardsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-3 mt-4 w-full">
              {rewardsData.map((item, index) => (
                <div key={index} className="text-center p-3 border-4 border-black dark:border-white" style={{ backgroundColor: COLORS[index] }}>
                  <p className="text-xs font-black uppercase text-black">{item.name}</p>
                  <p className="text-xl font-black text-black">£{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Frequency */}
        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              PAYMENT FREQUENCY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black uppercase text-sm">{category.name}</span>
                    <span className="font-black text-sm">{category.count} PAYMENTS</span>
                  </div>
                  <div className="h-4 border-4 border-black dark:border-white relative overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${(category.count / payments.length) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
