import { Home, Gift, CreditCard, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: BarChart3, label: "Stats", path: "/infographics" },
  { icon: Gift, label: "Perks", path: "/perks" },
  { icon: User, label: "Profile", path: "/profile" }
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-8 border-black dark:border-white shadow-[0_-8px_0_0_rgba(0,0,0,1)] dark:shadow-[0_-8px_0_0_rgba(255,255,255,1)]">
      <div className="max-w-md mx-auto px-2 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 py-2 px-2 transition-colors text-muted-foreground hover:text-foreground font-black uppercase"
              activeClassName="text-primary"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
