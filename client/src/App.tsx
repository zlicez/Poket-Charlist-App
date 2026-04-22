import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { UndoToastHost } from "@/components/UndoToastHost";
import { NewRouter } from "@/ds/NewRouter";

/** Removes the HTML-level loading screen that shows before the JS bundle loads. */
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
          <UndoToastHost />
          <ConnectionStatus />
          <NewRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
