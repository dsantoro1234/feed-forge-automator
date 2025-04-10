
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExchangeRate } from '@/types';
import { toast } from 'sonner';

// Mock data for exchange rates
const mockExchangeRates: ExchangeRate[] = [
  { id: '1', fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.85, updatedAt: new Date().toISOString() },
  { id: '2', fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.75, updatedAt: new Date().toISOString() },
  { id: '3', fromCurrency: 'USD', toCurrency: 'CAD', rate: 1.25, updatedAt: new Date().toISOString() },
  { id: '4', fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.18, updatedAt: new Date().toISOString() },
  { id: '5', fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.33, updatedAt: new Date().toISOString() },
];

export interface ExchangeRateContextType {
  exchangeRates: ExchangeRate[];
  isLoading: boolean;
  error: string | null;
  addExchangeRate: (rate: Omit<ExchangeRate, 'id' | 'updatedAt'>) => void;
  updateExchangeRate: (id: string, rate: Partial<ExchangeRate>) => void;
  deleteExchangeRate: (id: string) => void;
  refreshRates: () => Promise<void>;
  // Add the missing properties needed by TransformationEditor
  rates: Record<string, number>;
  isPremium: boolean;
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export const ExchangeRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(mockExchangeRates);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add the isPremium state (for now defaulting to false)
  const [isPremium, setIsPremium] = useState(false);

  // Create a rates object from the exchange rates for easy lookup
  const rates = exchangeRates.reduce((acc, rate) => {
    const key = `${rate.fromCurrency}_${rate.toCurrency}`;
    acc[key] = rate.rate;
    return acc;
  }, {} as Record<string, number>);

  const addExchangeRate = (rate: Omit<ExchangeRate, 'id' | 'updatedAt'>) => {
    const newRate: ExchangeRate = {
      ...rate,
      id: Date.now().toString(),
      updatedAt: new Date().toISOString(),
    };
    setExchangeRates([...exchangeRates, newRate]);
    toast.success('Exchange rate added successfully');
  };

  const updateExchangeRate = (id: string, rate: Partial<ExchangeRate>) => {
    setExchangeRates(
      exchangeRates.map((existingRate) =>
        existingRate.id === id
          ? { ...existingRate, ...rate, updatedAt: new Date().toISOString() }
          : existingRate
      )
    );
    toast.success('Exchange rate updated successfully');
  };

  const deleteExchangeRate = (id: string) => {
    setExchangeRates(exchangeRates.filter((rate) => rate.id !== id));
    toast.success('Exchange rate deleted successfully');
  };

  const refreshRates = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would fetch from an API
      // For the demo, we'll just simulate a delay and use our mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // We would update rates from an API here
      // For now, just showing a success message
      toast.success('Exchange rates refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh exchange rates';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExchangeRateContext.Provider
      value={{
        exchangeRates,
        isLoading,
        error,
        addExchangeRate,
        updateExchangeRate,
        deleteExchangeRate,
        refreshRates,
        // Add the missing properties
        rates,
        isPremium,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
};

export const useExchangeRates = () => {
  const context = useContext(ExchangeRateContext);
  if (context === undefined) {
    throw new Error('useExchangeRates must be used within an ExchangeRateProvider');
  }
  return context;
};
