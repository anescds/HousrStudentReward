import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PartnerNav from "@/components/partner/PartnerNav";
import { toast } from "sonner";
import { ArrowLeft, Save, Coffee, Dumbbell, ShoppingBag, Home, Gift, Sparkles, Percent, Pizza, Apple, ChefHat, Clock, Users, Leaf, Wand2 } from "lucide-react";
import { addPerk } from "@/lib/api";

// Icon map for the dropdown
const iconMap: Record<string, React.ElementType> = {
  coffee: Coffee,
  dumbbell: Dumbbell,
  "shopping-bag": ShoppingBag,
  home: Home,
  gift: Gift,
  sparkles: Sparkles,
  percent: Percent,
  pizza: Pizza,
  apple: Apple,
  "chef-hat": ChefHat,
  clock: Clock,
  users: Users,
  leaf: Leaf,
};

const iconNames = Object.keys(iconMap);

const CreateDeal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fullDescription: "",
    icon: "gift",
  });

  const handleAutofill = () => {
    setFormData({
      title: "Freshers Market",
      description: "50% all fruit and veg for freshers week",
      fullDescription: "50% all fruit and veg for freshers week 19th September - 26th September. In store deal only",
      icon: "apple",
    });
    toast.success("Form autofilled!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error("Please fill in title and description");
      return;
    }

    setLoading(true);

    try {
      await addPerk({
        title: formData.title,
        description: formData.description,
        fullDescription: formData.fullDescription || formData.description,
        icon: formData.icon,
      });

      toast.success("Deal created successfully!");
      navigate("/partner/deals");
    } catch (error: any) {
      toast.error(error.message || "Failed to create deal");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Create New Deal</CardTitle>
                <CardDescription>
                  Set up a new deal to attract students to your business
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAutofill}
                className="flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Autofill
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Deal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Student Discount on All Items"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the deal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Detailed description of the deal..."
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger id="icon">
                    <SelectValue>
                      {formData.icon && iconMap[formData.icon] ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = iconMap[formData.icon];
                            return <IconComponent className="w-4 h-4" />;
                          })()}
                          <span className="capitalize">{formData.icon.replace('-', ' ')}</span>
                        </div>
                      ) : (
                        "Select an icon"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {iconNames.map((iconName) => {
                      const IconComponent = iconMap[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2 w-full">
                            <IconComponent className="w-4 h-4" />
                            <span className="capitalize flex-1 text-center">{iconName.replace('-', ' ')}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Deal"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/partner/deals")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateDeal;
