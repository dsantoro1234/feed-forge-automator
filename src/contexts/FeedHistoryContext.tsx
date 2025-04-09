
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeedHistory, FeedTemplate, Product } from '@/types';
import { mockFeedHistory, mockSampleProducts } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { generateFeedByType, downloadFeedFile } from '@/utils/feedGenerators';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeedHistoryContextType {
  history: FeedHistory[];
  isLoading: boolean;
  generateFeed: (template: FeedTemplate, customProducts?: Product[]) => Promise<void>;
  downloadFeed: (historyId: string) => void;
  deleteFeedHistory: (historyId: string) => void;
  getPublicFeedUrl: (templateId: string) => string | null;
}

const FeedHistoryContext = createContext<FeedHistoryContextType | undefined>(undefined);

// Storage keys for feed content
const FEED_STORAGE_PREFIX = 'feed_content_';

// Create mock public URL for feeds
const generatePublicFeedUrl = (templateId: string, type: string): string => {
  const extension = type === 'google' ? 'xml' : 'csv';
  return `/api/feeds/${templateId}.${extension}`;
};

// This function actually retrieves the feed content from storage
export const getFeedContent = (templateId: string, type: string): string | null => {
  const extension = type === 'google' ? 'xml' : 'csv';
  const storageKey = `${FEED_STORAGE_PREFIX}${templateId}`;
  return localStorage.getItem(storageKey);
};

// Save feed content to storage
const saveFeedContent = (templateId: string, content: string): boolean => {
  const storageKey = `${FEED_STORAGE_PREFIX}${templateId}`;
  
  try {
    localStorage.setItem(storageKey, content);
    return true;
  } catch (error) {
    console.error('Error saving feed to storage:', error);
    return false;
  }
};

export const FeedHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<FeedHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Map to store the latest public URL for each template
  const [publicFeedUrls, setPublicFeedUrls] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();

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
    // Use provided products or mock products
    const productsToUse = customProducts || mockSampleProducts;
    
    try {
      toast.info('Generazione feed in corso...', { duration: 2000 });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate feed content based on template type
      const content = generateFeedByType(productsToUse, template);
      
      // Create a virtual file path (for display only)
      const extension = template.type === 'google' ? 'xml' : 'csv';
      const filePath = `/feeds/${template.id}.${extension}`;
      
      // Generate a public URL for the feed
      const publicUrl = generatePublicFeedUrl(template.id, template.type);
      
      // Save the feed content to storage using the template ID
      const saveSuccess = saveFeedContent(template.id, content);
      if (!saveSuccess) {
        throw new Error('Failed to save feed content');
      }
      
      // Create a URL object for browser download
      const contentType = template.type === 'google' ? 'application/xml' : 'text/csv';
      const fileUrl = URL.createObjectURL(new Blob([content], { type: contentType }));
      
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
        publicUrl,
        filePath,
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
        errorMessage: error instanceof Error ? error.message : 'Errore durante la generazione del feed',
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
    if (!item || !item.templateId) {
      toast.error('File feed non disponibile');
      return;
    }

    // Create a function to get the feed content
    const fetchAndDownload = async () => {
      try {
        // Get feed content from storage
        const content = getFeedContent(item.templateId, item.type);
        
        if (!content) {
          throw new Error('Feed content not available');
        }
        
        // Generate a filename
        const extension = item.type === 'google' ? '.xml' : '.csv';
        const filename = `${item.templateName.toLowerCase().replace(/\s+/g, '-')}-${new Date(item.generatedAt).toISOString().slice(0, 10)}${extension}`;
        
        // Download the file
        downloadFeedFile(content, filename, item.type === 'google' ? 'xml' : 'csv');
      } catch (error) {
        console.error('Errore durante il download del feed:', error);
        toast.error('Impossibile scaricare il feed');
      }
    };

    fetchAndDownload();
  };

  const deleteFeedHistory = (historyId: string) => {
    // Get the item before we remove it
    const item = history.find(h => h.id === historyId);
    
    if (item && item.templateId) {
      // Remove the feed content from storage
      localStorage.removeItem(`${FEED_STORAGE_PREFIX}${item.templateId}`);
    }
    
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
