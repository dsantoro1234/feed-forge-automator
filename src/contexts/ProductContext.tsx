
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { mockSampleProducts } from '@/data/mockData';
import { useConfig } from './ConfigContext';
import { toast } from 'sonner';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  getProductFields: () => string[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiConfig } = useConfig();

  const fetchProducts = async (): Promise<Product[]> => {
    setIsLoading(true);
    setError(null);
    
    // In a real app, this would fetch from the actual API
    // For now, we'll use mock data with a delay to simulate API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If API config is not set, we'll show an error
      if (!apiConfig.endpoint || !apiConfig.apiKey) {
        throw new Error('API configuration is not set. Please configure API settings first.');
      }
      
      // In a real app, this would be:
      // const response = await fetch(`${apiConfig.endpoint}/${apiConfig.tableName}`, {
      //   headers: { 'Authorization': `Bearer ${apiConfig.apiKey}` }
      // });
      // const data = await response.json();
      // return data;
      
      // For demo, return mock data
      return mockSampleProducts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProducts = async (): Promise<void> => {
    const data = await fetchProducts();
    setProducts(data);
  };

  useEffect(() => {
    refreshProducts();
  }, [apiConfig.endpoint, apiConfig.apiKey, apiConfig.tableName]);

  const getProductFields = (): string[] => {
    if (products.length === 0) return [];
    
    // Get all unique field names from all products
    const fieldSet = new Set<string>();
    products.forEach(product => {
      Object.keys(product).forEach(key => fieldSet.add(key));
    });
    
    return Array.from(fieldSet).sort();
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        refreshProducts,
        getProductFields,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
