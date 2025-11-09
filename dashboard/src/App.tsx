import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { login, getRedeems } from "./lib/api";
import NotFound from "./pages/NotFound";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerDeals from "./pages/PartnerDeals";
import CreateDeal from "./pages/CreateDeal";
import EditDeal from "./pages/EditDeal";
import PartnerAnalytics from "./pages/PartnerAnalytics";

const queryClient = new QueryClient();

const App = () => {
  // Auto-login and fetch redeems when dashboard loads/refreshes - always generate fresh cookie
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Always call login to generate a fresh cookie
        // This ensures we have a valid session even after server restarts
        await login({ dashid: 'admin', password: 'admin' });
        console.log('Dashboard auto-login successful - fresh cookie generated');
        
        // Fetch redeems data on load/refresh
        try {
          const redeemsData = await getRedeems();
          // Store in localStorage for use across components
          localStorage.setItem('dashboard_redeems', JSON.stringify(redeemsData));
          console.log('Dashboard redeems fetched and stored:', redeemsData);
        } catch (error) {
          console.error('Failed to fetch redeems on load:', error);
        }
      } catch (error) {
        console.error('Dashboard auto-login failed:', error);
      }
    };

    autoLogin();
    
    // Also fetch redeems when window gains focus (refresh on tab switch)
    const handleFocus = async () => {
      try {
        const redeemsData = await getRedeems();
        localStorage.setItem('dashboard_redeems', JSON.stringify(redeemsData));
        console.log('Dashboard redeems refreshed on focus');
      } catch (error) {
        console.error('Failed to refresh redeems on focus:', error);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PartnerDashboard />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/partner/deals" element={<PartnerDeals />} />
            <Route path="/partner/deals/new" element={<CreateDeal />} />
            <Route path="/partner/deals/:id/edit" element={<EditDeal />} />
            <Route path="/partner/analytics" element={<PartnerAnalytics />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
