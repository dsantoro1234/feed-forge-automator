
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import TemplateList from './pages/TemplateList';
import TemplateDetail from './pages/TemplateDetail';
import CreateTemplate from './pages/CreateTemplate';
import History from './pages/History';
import Settings from './pages/Settings';
import ExchangeRates from './pages/ExchangeRates';
import NotFound from './pages/NotFound';
import Index from './pages/Index';

import { ProductProvider } from './contexts/ProductContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { FeedHistoryProvider } from './contexts/FeedHistoryContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ExchangeRateProvider } from './contexts/ExchangeRateContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="feed-ui-theme">
        {/* Rearranging provider order to fix dependency issues */}
        <ConfigProvider>
          <ExchangeRateProvider>
            <ProductProvider>
              <TemplateProvider>
                <FeedHistoryProvider>
                  <Router>
                    <Routes>
                      <Route path="/" element={<Layout />}>
                        <Route index element={<Index />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="templates" element={<TemplateList />} />
                        <Route path="templates/:id" element={<TemplateDetail />} />
                        <Route path="templates/create" element={<CreateTemplate />} />
                        <Route path="history" element={<History />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="exchange-rates" element={<ExchangeRates />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </Router>
                  <Toaster />
                </FeedHistoryProvider>
              </TemplateProvider>
            </ProductProvider>
          </ExchangeRateProvider>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
