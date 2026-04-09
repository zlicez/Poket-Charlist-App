import { useEffect } from "react";
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

/** Removes the HTML-level loading screen that shows before the JS bundle loads */
function HtmlLoaderRemover() {
  useEffect(() => {
    const el = document.getElementById("app-loader");
    if (!el) return;
    el.style.opacity = "0";
    const t = setTimeout(() => el.remove(), 450);
    return () => clearTimeout(t);
  }, []);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <HtmlLoaderRemover />
          <Toaster />
          <ConnectionStatus />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
