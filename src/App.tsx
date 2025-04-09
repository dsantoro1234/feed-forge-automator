
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import TemplateList from "./pages/TemplateList";
import TemplateDetail from "./pages/TemplateDetail";
import CreateTemplate from "./pages/CreateTemplate";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { ConfigProvider } from "./contexts/ConfigContext";
import { TemplateProvider } from "./contexts/TemplateContext";
import { FeedHistoryProvider } from "./contexts/FeedHistoryContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ConfigProvider>
        <TemplateProvider>
          <FeedHistoryProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/templates" element={<TemplateList />} />
                  <Route path="/templates/new" element={<CreateTemplate />} />
                  <Route path="/templates/:id" element={<TemplateDetail />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </FeedHistoryProvider>
        </TemplateProvider>
      </ConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
