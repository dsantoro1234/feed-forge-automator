
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiConfig, ClientConfig } from '@/types';
import { mockApiConfig, mockClientConfig } from '@/data/mockData';
import { toast } from 'sonner';

interface ConfigContextType {
  apiConfig: ApiConfig;
  clientConfig: ClientConfig;
  updateApiConfig: (config: Partial<ApiConfig>) => void;
  updateClientConfig: (config: Partial<ClientConfig>) => void;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiConfig, setApiConfig] = useState<ApiConfig>(mockApiConfig);
  const [clientConfig, setClientConfig] = useState<ClientConfig>(mockClientConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would load the configurations from localStorage or an API
    // For the demo, we'll use the mock data and simulate a loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const updateApiConfig = (config: Partial<ApiConfig>) => {
    setApiConfig(prev => ({ ...prev, ...config }));
    toast.success('API configuration updated');
  };

  const updateClientConfig = (config: Partial<ClientConfig>) => {
    setClientConfig(prev => ({ ...prev, ...config }));
    toast.success('Client configuration updated');
  };

  return (
    <ConfigContext.Provider
      value={{
        apiConfig,
        clientConfig,
        updateApiConfig,
        updateClientConfig,
        isLoading
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
