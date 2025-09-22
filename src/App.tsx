import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import { CollectorAPI } from '@/utils/api';

const queryClient = new QueryClient();

const App = () => {
  const [currentCollector, setCurrentCollector] = useState<string | null>(null);

  useEffect(() => {
    // Check if collector is already logged in
    const collector = CollectorAPI.getCurrentCollector();
    if (collector) {
      setCurrentCollector(collector.id);
    }
  }, []);

  const handleLogin = (collectorId: string) => {
    setCurrentCollector(collectorId);
  };

  const handleLogout = () => {
    CollectorAPI.logout();
    setCurrentCollector(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {currentCollector ? (
          <Index collectorId={currentCollector} onLogout={handleLogout} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
