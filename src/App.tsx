
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import TemplateList from './pages/TemplateList';
import TemplateDetail from './pages/TemplateDetail';
import CreateTemplate from './pages/CreateTemplate';
import Products from './pages/Products';
import Settings from './pages/Settings';
import History from './pages/History';
import NotFound from './pages/NotFound';
import FeedRouteHandler from './api/feedRouteHandler';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="templates" element={<TemplateList />} />
        <Route path="templates/new" element={<CreateTemplate />} />
        <Route path="templates/:id" element={<TemplateDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="settings" element={<Settings />} />
        <Route path="history" element={<History />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* API-like routes for feed downloads */}
      <Route path="/api/feeds/:templateId.:format" element={<FeedRouteHandler />} />
    </Routes>
  );
}

export default App;
