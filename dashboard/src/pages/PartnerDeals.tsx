import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PartnerNav from "@/components/partner/PartnerNav";
import { Plus, Edit, Trash2, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getDeals, type Deal } from "@/lib/api";

const PartnerDeals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetchDeals(true); // Initial load with loading state
    
    // Poll for real-time updates every 2 seconds
    const interval = setInterval(() => {
      fetchDeals(false); // Poll without loading state
    }, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchDeals = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      const response = await getDeals();
      setDeals(response.deals);
    } catch (error: any) {
      if (isInitialLoad) {
        toast.error("Failed to fetch deals");
      }
      console.error('Error fetching deals:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    
    // Note: Deals are managed in server configuration
    toast.info("Deals are managed in the server configuration. Please contact the administrator to modify deals.");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      case "expired": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PartnerNav />
        <div className="container mx-auto p-6">
          <p className="text-muted-foreground">Loading deals...</p>
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
            <h1 className="text-4xl font-bold text-foreground">Your Deals</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage and track your student deals
            </p>
          </div>
          <Button onClick={() => navigate("/partner/deals/new")} size="lg" className="shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Deal
          </Button>
        </div>

        {deals.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No deals yet</h3>
              <p className="text-muted-foreground mb-4">Create your first deal to start attracting students</p>
              <Button onClick={() => navigate("/partner/deals/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Deal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <Card key={deal.id} className="glass-card hover:scale-105 transition-transform duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{deal.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {deal.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(deal.status)}>
                      {deal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {deal.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{deal.views} views</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      <span>{deal.redemptions} redeemed</span>
                    </div>
                  </div>

                  {deal.valid_to && (
                    <p className="text-xs text-muted-foreground">
                      Valid until {format(new Date(deal.valid_to), "MMM dd, yyyy")}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/partner/deals/${deal.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(deal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerDeals;
