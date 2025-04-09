
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

// In a real implementation, this would be a server-side directory
const FEEDS_DIRECTORY = '/feeds';

// Generate paths for feed files
const generateFeedPaths = (templateId: string, type: string): { publicUrl: string, filePath: string } => {
  const extension = type === 'google' ? 'xml' : 'csv';
  const fileName = `${templateId}.${extension}`;
  
  // In a production environment, this would be a server path
  const filePath = `${FEEDS_DIRECTORY}/${fileName}`;
  
  // URL that will be accessible publicly
  const publicUrl = `/feeds/${fileName}`;
  
  return { publicUrl, filePath };
};

// Simulate writing to a physical file (would be server-side in production)
const saveToFile = async (content: string, filePath: string): Promise<boolean> => {
  console.log(`Saving feed to ${filePath}`);
  
  // In a real implementation, this would write to the filesystem
  // For the demo, we're simulating successful file creation
  
  // Simulate a small delay for "file writing"
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Store the content in localStorage for demo purposes
  // In a real app, this would be a file on the server
  try {
    localStorage.setItem(`feed_file_${filePath}`, content);
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
      
      // Generate paths for the feed file
      const { publicUrl, filePath } = generateFeedPaths(template.id, template.type);
      
      // Save the feed to a "physical" file
      const saveSuccess = await saveToFile(content, filePath);
      if (!saveSuccess) {
        throw new Error('Failed to save feed file');
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
      
      // Update the template's lastGenerated field by calling the API
      // This would typically be handled by the server in a production environment
      
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
    if (!item || !item.fileUrl || item.fileUrl === '#') {
      toast.error('File feed non disponibile');
      return;
    }

    // Use the existing utility function for downloading
    const extension = item.type === 'google' ? '.xml' : '.csv';
    const filename = `${item.templateName.toLowerCase().replace(/\s+/g, '-')}-${new Date(item.generatedAt).toISOString().slice(0, 10)}${extension}`;
    
    // Create a function to get the feed content
    const fetchAndDownload = async () => {
      try {
        // In a real app, we would fetch from the filePath
        // For the demo, we either use the fileUrl or get from localStorage
        let content;
        
        if (item.filePath && localStorage.getItem(`feed_file_${item.filePath}`)) {
          // Get from our simulated file system
          content = localStorage.getItem(`feed_file_${item.filePath}`);
        } else if (item.fileUrl) {
          // Fallback to the URL blob
          const response = await fetch(item.fileUrl);
          content = await response.text();
        }
        
        if (!content) {
          throw new Error('Feed content not available');
        }
        
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
    
    if (item && item.filePath) {
      // In a real app, we would delete the file from the filesystem
      // For the demo, we'll remove it from localStorage
      localStorage.removeItem(`feed_file_${item.filePath}`);
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
