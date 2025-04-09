
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { TemplateProvider } from './contexts/TemplateContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <TemplateProvider>
      <App />
    </TemplateProvider>
  </BrowserRouter>
);
