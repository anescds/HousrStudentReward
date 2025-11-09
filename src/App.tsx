import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "./contexts/SimulationContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { login, getBalance } from "./lib/api";
import Index from "./pages/Index";
import Payments from "./pages/Payments";
import Perks from "./pages/Perks";
import AldiDeals from "./pages/AldiDeals";
import Profile from "./pages/Profile";
import Infographics from "./pages/Infographics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Auto-login and fetch balance when app loads/refreshes
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Always call login to generate a fresh cookie
        // This ensures we have a valid session even after server restarts
        await login({ userid: 'user', password: 'password' });
        console.log('Auto-login successful - fresh cookie generated');
        
        // Fetch balance after login
        try {
          const balanceResponse = await getBalance();
          console.log('Balance fetched on page load:', balanceResponse.balance);
          // Store balance in localStorage for easy access
          localStorage.setItem('user_balance', balanceResponse.balance.toString());
        } catch (balanceError) {
          console.error('Failed to fetch balance on page load:', balanceError);
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WebSocketProvider>
          <SimulationProvider>
            <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/perks" element={<Perks />} />
              <Route path="/perks/:partner" element={<AldiDeals />} />
              <Route path="/infographics" element={<Infographics />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </SimulationProvider>
        </WebSocketProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  };
  
  export default App;
