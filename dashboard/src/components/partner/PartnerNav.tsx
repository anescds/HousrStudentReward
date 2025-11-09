import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Tag, BarChart3 } from "lucide-react";
import aldiLogo from "@/assets/aldi-logo.png";

const PartnerNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/partner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/partner/deals", label: "Deals", icon: Tag },
    { path: "/partner/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <nav className="glass-card border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/partner/dashboard" className="flex items-center space-x-3">
              <img 
                src={aldiLogo} 
                alt="Aldi" 
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-xl text-foreground">Partner Portal</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="flex items-center space-x-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PartnerNav;
