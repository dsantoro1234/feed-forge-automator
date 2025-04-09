
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeedHistory, FeedTemplate, Product } from '@/types';
import { mockFeedHistory, mockSampleProducts } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { generateGoogleFeed, generateMetaFeed, generateTrovaprezziCSV } from '@/utils/feedGenerators';
import { toast } from 'sonner';

interface FeedHistoryContextType {
  history: FeedHistory[];
  isLoading: boolean;
  generateFeed: (template: FeedTemplate) => Promise<void>;
  downloadFeed: (historyId: string) => void;
  deleteFeedHistory: (historyId: string) => void;
}

const FeedHistoryContext = createContext<FeedHistoryContextType | undefined>(undefined);

export const FeedHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<FeedHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would load the history from an API or localStorage
    // For the demo, we'll use the mock data and simulate a loading delay
    const timer = setTimeout(() => {
      setHistory(mockFeedHistory);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const generateFeed = async (template: FeedTemplate): Promise<void> => {
    // In a real app, you would fetch products from the API
    // For the demo, we'll use the mock products
    try {
      toast.info('Generating feed...', { duration: 2000 });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let fileUrl = '#';
      let content = '';
      
      // Generate appropriate feed based on template type
      if (template.type === 'google') {
        content = generateGoogleFeed(mockSampleProducts, template);
        fileUrl = URL.createObjectURL(new Blob([content], { type: 'application/xml' }));
      } else if (template.type === 'meta') {
        content = generateMetaFeed(mockSampleProducts, template);
        fileUrl = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));
      } else if (template.type === 'trovaprezzi') {
        content = generateTrovaprezziCSV(mockSampleProducts, template);
        fileUrl = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));
      }
      
      const newHistory: FeedHistory = {
        id: uuidv4(),
        templateId: template.id,
        templateName: template.name,
        type: template.type,
        generatedAt: new Date().toISOString(),
        status: 'success',
        fileUrl,
        productCount: mockSampleProducts.length,
        warningCount: 0
      };
      
      setHistory(prev => [newHistory, ...prev]);
      toast.success('Feed generated successfully');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error generating feed:', error);
      
      const newHistory: FeedHistory = {
        id: uuidv4(),
        templateId: template.id,
        templateName: template.name,
        type: template.type,
        generatedAt: new Date().toISOString(),
        status: 'error',
        errorMessage: 'Error generating feed',
        productCount: 0,
        warningCount: 0
      };
      
      setHistory(prev => [newHistory, ...prev]);
      toast.error('Failed to generate feed');
      
      return Promise.reject(error);
    }
  };

  const downloadFeed = (historyId: string) => {
    const item = history.find(h => h.id === historyId);
    if (!item || !item.fileUrl || item.fileUrl === '#') {
      toast.error('Feed file not available');
      return;
    }

    // In a real app, you would download the file from a server
    // For the demo, we'll simulate a download using the Blob URL
    const link = document.createElement('a');
    link.href = item.fileUrl;
    const extension = item.type === 'google' ? '.xml' : '.csv';
    link.download = `${item.templateName.toLowerCase().replace(/\s+/g, '-')}-${new Date(item.generatedAt).toISOString().slice(0, 10)}${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFeedHistory = (historyId: string) => {
    setHistory(prev => prev.filter(h => h.id !== historyId));
    toast.success('Feed history entry deleted');
  };

  return (
    <FeedHistoryContext.Provider
      value={{
        history,
        isLoading,
        generateFeed,
        downloadFeed,
        deleteFeedHistory
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
