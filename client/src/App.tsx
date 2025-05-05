import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import Calendar from "@/pages/calendar";
import Favorites from "@/pages/favorites";
import Profile from "@/pages/profile";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import Header from "@/components/layout/Header";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { BackToTop } from "@/components/ui/back-to-top";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/discover" component={Discover} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Get current route
  const [location] = useLocation();
  
  // Check if we're on an auth page (login or register)
  const isAuthPage = location === '/login' || location === '/register';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
          {/* Only show header on non-auth pages */}
          {!isAuthPage && <Header />}
          
          <main className="flex-1">
            <AppRoutes />
          </main>
          
          {/* Only show these components on non-auth pages */}
          {!isAuthPage && <MobileNavigation />}
          {!isAuthPage && <BackToTop />}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
