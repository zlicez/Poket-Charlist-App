import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import CharactersList from "@/pages/CharactersList";
import CharacterSheet from "@/pages/CharacterSheet";
import SharedCharacterSheet from "@/pages/SharedCharacterSheet";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CharactersList} />
      <Route path="/character/:id" component={CharacterSheet} />
      <Route path="/shared/:token" component={SharedCharacterSheet} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <ConnectionStatus />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
