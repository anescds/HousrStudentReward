import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PartnerNav from "@/components/partner/PartnerNav";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { getDeals, type Deal } from "@/lib/api";

const EditDeal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) {
        toast.error("Deal ID not found");
        navigate("/partner/deals");
        return;
      }

      try {
        const response = await getDeals();
        const foundDeal = response.deals.find(d => d.id === id);
        
        if (!foundDeal) {
          toast.error("Deal not found");
          navigate("/partner/deals");
          return;
        }

        setDeal(foundDeal);
      } catch (error) {
        toast.error("Failed to fetch deal");
        navigate("/partner/deals");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [navigate, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Note: Deals are managed in server configuration
    toast.info("Deals are managed in the server configuration. Please contact the administrator to modify deals.");
    navigate("/partner/deals");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PartnerNav />
        <div className="container mx-auto p-6">
          <p className="text-muted-foreground">Loading deal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <PartnerNav />
      
      <div className="container mx-auto p-6 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/partner/deals")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Deals
        </Button>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Deal</CardTitle>
            <CardDescription>
              Update your deal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deal ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{deal.title}</h3>
                  <p className="text-muted-foreground">{deal.description}</p>
                  {deal.fullDescription && (
                    <p className="text-sm text-muted-foreground mt-2">{deal.fullDescription}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Views: {deal.views}</span>
                  <span>Redemptions: {deal.redemptions}</span>
                  <span>Status: {deal.status}</span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-muted-foreground mb-4">
                    Deals are managed in the server configuration file. To modify this deal, 
                    please contact the administrator or modify the server configuration.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/partner/deals")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Deals
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading deal information...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditDeal;
