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
import AuthPage from "@/pages/auth-page";
import RegisterPage from "@/pages/register-page";
import ProgramDetail from "@/pages/program-detail";
import WorkoutDetailPage from "@/pages/workout-detail";
import Header from "@/components/layout/Header";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { BackToTop } from "@/components/ui/back-to-top";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function AppRoutes() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/discover" component={Discover} />
      <ProtectedRoute path="/calendar" component={Calendar} />
      <ProtectedRoute path="/favorites" component={Favorites} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/programs/:id" component={ProgramDetail} />
      <ProtectedRoute path="/workout/:id" component={WorkoutDetailPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/register" component={RegisterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Get current route
  const [location] = useLocation();
  
  // Check if we're on an auth-related page
  const isAuthPage = location === '/auth' || location === '/register';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
