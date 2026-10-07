import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContentShieldProvider } from "@/lib/content-shield";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import Welcome from "@/pages/welcome";
import Onboarding from "@/pages/onboarding";
import Personalize from "@/pages/personalize";
import Results from "@/pages/results";
import Home from "@/pages/home";
import CoachPage from "@/pages/coach";
import LearnLibrary from "@/pages/learn/index";
import LessonDetail from "@/pages/learn/lesson";
import CommunityPage from "@/pages/community/index";
import DailyCheckin from "@/pages/daily/index";
import PanicButton from "@/pages/panic/index";
import FocusButton from "@/pages/focus";
import FocusAnalytics from "@/pages/focus-analytics";
import SeedGarden from "@/pages/garden/index";
import GrowthTimeline from "@/pages/garden/timeline";
import Settings from "@/pages/settings";

/**
 * Wraps a route component: redirects to /login if the user is not authenticated.
 * Shows nothing while the session check is in progress (avoids flash).
 */
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null; // or a spinner
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  // Don't render routes until we know auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={() => user ? <Redirect to="/home" /> : <LoginPage />} />

      {/* Root redirect */}
      <Route path="/" component={() => <Redirect to={user ? "/home" : "/login"} />} />

      {/* Protected routes */}
      <Route path="/welcome"          component={() => <ProtectedRoute component={Welcome} />} />
      <Route path="/onboarding"       component={() => <ProtectedRoute component={Onboarding} />} />
      <Route path="/personalize"      component={() => <ProtectedRoute component={Personalize} />} />
      <Route path="/results"          component={() => <ProtectedRoute component={Results} />} />
      <Route path="/home"             component={() => <ProtectedRoute component={Home} />} />
      <Route path="/coach"            component={() => <ProtectedRoute component={CoachPage} />} />
      <Route path="/learn"            component={() => <ProtectedRoute component={LearnLibrary} />} />
      <Route path="/learn/:lessonId"  component={() => <ProtectedRoute component={LessonDetail} />} />
      <Route path="/community"        component={() => <ProtectedRoute component={CommunityPage} />} />
      <Route path="/daily"            component={() => <ProtectedRoute component={DailyCheckin} />} />
      <Route path="/panic"            component={() => <ProtectedRoute component={PanicButton} />} />
      <Route path="/focus"            component={() => <ProtectedRoute component={FocusButton} />} />
      <Route path="/focus-analytics"  component={() => <ProtectedRoute component={FocusAnalytics} />} />
      <Route path="/garden"           component={() => <ProtectedRoute component={SeedGarden} />} />
      <Route path="/timeline"         component={() => <ProtectedRoute component={GrowthTimeline} />} />
      <Route path="/settings"         component={() => <ProtectedRoute component={Settings} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ContentShieldProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </ContentShieldProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
