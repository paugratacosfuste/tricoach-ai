import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { TrainingProvider } from "@/contexts/TrainingContext";
import Index from "./pages/Index";
import { CalendarPage } from "./pages/CalendarPage";
import { ProgressPage } from "./pages/ProgressPage";
import { GoalsPage } from "./pages/GoalsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OnboardingProvider>
      <TrainingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TrainingProvider>
    </OnboardingProvider>
  </QueryClientProvider>
);

export default App;
