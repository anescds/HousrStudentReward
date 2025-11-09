import { Coffee, Dumbbell, ShoppingBag, Home, Gift, Sparkles, Percent, Pizza, Apple, ChefHat, Clock, Users, Leaf } from "lucide-react";

// Map icon string names to icon components
export const iconMap: Record<string, React.ElementType> = {
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

export function getIcon(iconName: string): React.ElementType {
  return iconMap[iconName.toLowerCase()] || Gift;
}

