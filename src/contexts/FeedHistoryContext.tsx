
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeedHistory, FeedTemplate, Product } from '@/types';
import { mockFeedHistory, mockSampleProducts } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { generateFeedByType, downloadFeedFile } from '@/utils/feedGenerators';
import { toast } from 'sonner';

interface FeedHistoryContextType {
  history: FeedHistory[];
  isLoading: boolean;
  generateFeed: (template: FeedTemplate, customProducts?: Product[]) => Promise<void>;
  downloadFeed: (historyId: string) => void;
  deleteFeedHistory: (historyId: string) => void;
  getPublicFeedUrl: (templateId: string) => string | null;
}

const FeedHistoryContext = createContext<FeedHistoryContextType | undefined>(undefined);

// Generate a persistent "public" URL for a template
const generatePublicFeedUrl = (templateId: string, type: string): string => {
  // In a real app this would be a permanent URL on your server or CDN
  // For this demo we'll use a pseudo URL that represents this concept
  const extension = type === 'google' ? 'xml' : 'csv';
  return `/feeds/${templateId}.${extension}`;
};

export const FeedHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<FeedHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Map to store the latest public URL for each template
  const [publicFeedUrls, setPublicFeedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    // In a real app, you would load the history from an API or localStorage
    // For the demo, we'll use the mock data and simulate a loading delay
    const timer = setTimeout(() => {
      setHistory(mockFeedHistory);
      
      // Initialize publicFeedUrls from history
      const initialUrls: Record<string, string> = {};
      mockFeedHistory.forEach(item => {
        if (item.status === 'success' && item.publicUrl) {
          initialUrls[item.templateId] = item.publicUrl;
        }
      });
      setPublicFeedUrls(initialUrls);
      
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const generateFeed = async (template: FeedTemplate, customProducts?: Product[]): Promise<void> => {
    // Utilizza i prodotti passati o i prodotti mock
    const productsToUse = customProducts || mockSampleProducts;
    
    try {
      toast.info('Generazione feed in corso...', { duration: 2000 });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let fileUrl = '#';
      let content = '';
      
      // Generate appropriate feed based on template type
      content = generateFeedByType(productsToUse, template);
      
      // Create a URL object for download
      const contentType = template.type === 'google' ? 'application/xml' : 'text/csv';
      fileUrl = URL.createObjectURL(new Blob([content], { type: contentType }));
      
      // Generate a permanent public URL for this feed
      const publicUrl = generatePublicFeedUrl(template.id, template.type);
      
      // Update the publicFeedUrls map
      setPublicFeedUrls(prev => ({
        ...prev,
        [template.id]: publicUrl
      }));
      
      const newHistory: FeedHistory = {
        id: uuidv4(),
        templateId: template.id,
        templateName: template.name,
        type: template.type,
        generatedAt: new Date().toISOString(),
        status: 'success',
        fileUrl,
        publicUrl, // Add the public URL
        productCount: productsToUse.length,
        warningCount: 0
      };
      
      setHistory(prev => [newHistory, ...prev]);
      toast.success('Feed generato con successo');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Errore durante la generazione del feed:', error);
      
      const newHistory: FeedHistory = {
        id: uuidv4(),
        templateId: template.id,
        templateName: template.name,
        type: template.type,
        generatedAt: new Date().toISOString(),
        status: 'error',
        errorMessage: 'Errore durante la generazione del feed',
        productCount: 0,
        warningCount: 0
      };
      
      setHistory(prev => [newHistory, ...prev]);
      toast.error('Impossibile generare il feed');
      
      return Promise.reject(error);
    }
  };

  const downloadFeed = (historyId: string) => {
    const item = history.find(h => h.id === historyId);
    if (!item || !item.fileUrl || item.fileUrl === '#') {
      toast.error('File feed non disponibile');
      return;
    }

    // Use the new utility function for downloading
    const extension = item.type === 'google' ? '.xml' : '.csv';
    const filename = `${item.templateName.toLowerCase().replace(/\s+/g, '-')}-${new Date(item.generatedAt).toISOString().slice(0, 10)}${extension}`;
    
    // Crea una funzione per ottenere il contenuto del feed dalla URL
    const fetchAndDownload = async () => {
      try {
        const response = await fetch(item.fileUrl!);
        const content = await response.text();
        downloadFeedFile(content, filename, item.type === 'google' ? 'xml' : 'csv');
      } catch (error) {
        console.error('Errore durante il download del feed:', error);
        toast.error('Impossibile scaricare il feed');
      }
    };

    fetchAndDownload();
  };

  const deleteFeedHistory = (historyId: string) => {
    setHistory(prev => prev.filter(h => h.id !== historyId));
    toast.success('Voce cronologia feed eliminata');
  };

  // Function to get the public URL for a template
  const getPublicFeedUrl = (templateId: string): string | null => {
    return publicFeedUrls[templateId] || null;
  };

  return (
    <FeedHistoryContext.Provider
      value={{
        history,
        isLoading,
        generateFeed,
        downloadFeed,
        deleteFeedHistory,
        getPublicFeedUrl
      }}
    >
      {children}
    </FeedHistoryContext.Provider>
  );
};

export const useFeedHistory = () => {
  const context = useContext(FeedHistoryContext);
  if (context === undefined) {
    throw new Error('useFeedHistory must be used within a FeedHistoryProvider');
  }
  return context;
};
