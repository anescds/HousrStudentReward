import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface Deal {
  title: string;
  description: string;
  icon: React.ElementType;
}

interface PartnerPerkCardProps {
  id: number;
  name: string;
  logo: string;
  route: string;
  deals: Deal[];
}

export const PartnerPerkCard = ({ id, name, logo, route, deals }: PartnerPerkCardProps) => {
  const navigate = useNavigate();
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect visibility in center of screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!cardRef.current) return;
          
          const rect = entry.boundingClientRect;
          const viewportHeight = window.innerHeight;
          
          // Calculate if card is in the middle 40% of the viewport
          const cardCenter = rect.top + rect.height / 2;
          const viewportCenter = viewportHeight / 2;
          const threshold = viewportHeight * 0.2; // 20% tolerance on each side
          
          const isInCenter = Math.abs(cardCenter - viewportCenter) < threshold;
          setIsVisible(isInCenter && entry.isIntersecting);
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // Check at every 1%
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Auto-cycle deals only if visible and not paused
  useEffect(() => {
    if (!isVisible || isPaused) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentDealIndex((prev) => (prev + 1) % deals.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [deals.length, isVisible, isPaused]);

  const currentDeal = deals[currentDealIndex];
  const DealIcon = currentDeal.icon;

  const handleDealSelect = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDealIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  const handleCardClick = () => {
    if (route !== "#") {
      navigate(route);
    }
  };

  return (
    <Card 
      ref={cardRef}
      className="brutal-card cursor-pointer group relative overflow-hidden isolate"
      onClick={handleCardClick}
    >
      {/* Animated background effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
        style={{ zIndex: 0 }}
      />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-6">
          {/* Left side - Logo */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="w-28 h-28 bg-card border-4 border-black dark:border-white p-3 flex items-center justify-center transform group-hover:rotate-[-5deg] transition-transform">
              <img 
                src={logo} 
                alt={`${name} logo`}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-black text-xl uppercase text-center">{name}</h3>
          </div>

          {/* Right side - Cycling deals */}
          <div className="flex-1 min-w-0">
            <div 
              className={`transition-all duration-300 ${
                isAnimating 
                  ? 'opacity-0 translate-x-4 scale-95' 
                  : 'opacity-100 translate-x-0 scale-100'
              }`}
            >
              <div className="bg-accent/80 p-5 border-4 border-black dark:border-white relative overflow-hidden">
                {/* Glitch effect bars */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-1 bg-primary transition-transform duration-200 ${
                    isAnimating ? 'translate-x-0' : 'translate-x-[-100%]'
                  }`}
                />
                <div 
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-destructive transition-transform duration-200 ${
                    isAnimating ? 'translate-x-0' : 'translate-x-[100%]'
                  }`}
                />
                
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary border-4 border-black dark:border-white flex items-center justify-center shrink-0 transform group-hover:scale-110 transition-transform">
                    <DealIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm uppercase text-black dark:text-white mb-1 tracking-wider">
                      {currentDeal.title}
                    </p>
                    <p className="text-xs font-bold text-black/80 dark:text-white/80 leading-tight line-clamp-4">
                      {currentDeal.description}
                    </p>
                  </div>
                </div>

                {/* Deal indicator dots - clickable */}
                <div className="flex gap-2 mt-4 justify-center">
                  {deals.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleDealSelect(index, e)}
                      className={`h-2 transition-all duration-300 border-2 border-black dark:border-white hover:scale-125 active:scale-110 cursor-pointer ${
                        index === currentDealIndex 
                          ? 'w-8 bg-primary' 
                          : 'w-2 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'
                      }`}
                      aria-label={`View deal ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
