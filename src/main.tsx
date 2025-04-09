
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { TemplateProvider } from './contexts/TemplateContext'
import { FeedHistoryProvider } from './contexts/FeedHistoryContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <TemplateProvider>
      <FeedHistoryProvider>
        <App />
      </FeedHistoryProvider>
    </TemplateProvider>
  </BrowserRouter>
);
