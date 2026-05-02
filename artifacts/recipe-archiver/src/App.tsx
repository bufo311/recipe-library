import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import RecipeDetail from "@/pages/recipe-detail";
import RecipeNew from "@/pages/recipe-new";
import RecipeEdit from "@/pages/recipe-edit";
import Reference from "@/pages/reference";
import LoginPage from "@/pages/login";
import { AuthProvider, useAuth } from "@/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/recipe/new" component={RecipeNew} />
      <Route path="/recipe/:id" component={RecipeDetail} />
      <Route path="/recipe/:id/edit" component={RecipeEdit} />
      <Route path="/reference" component={Reference} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthGate() {
  const { authenticated, loading } = useAuth();
  if (loading) return null;
  if (!authenticated) return <LoginPage />;
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
