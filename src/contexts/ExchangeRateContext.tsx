
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExchangeRate } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface ExchangeRateContextType {
  exchangeRates: ExchangeRate[];
  isLoading: boolean;
  error: string | null;
  addExchangeRate: (rate: Omit<ExchangeRate, 'id' | 'lastUpdated'>) => void;
  updateExchangeRate: (id: string, rate: Partial<ExchangeRate>) => void;
  deleteExchangeRate: (id: string) => void;
  getExchangeRate: (from: string, to: string) => number | null;
  isSubscriptionActive: boolean;
  setSubscriptionActive: (active: boolean) => void;
  refreshRates: () => Promise<void>;
}

// Mock data per i tassi di cambio
const mockExchangeRates: ExchangeRate[] = [
  { id: '1', baseCurrency: 'EUR', targetCurrency: 'USD', rate: 1.08, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '2', baseCurrency: 'EUR', targetCurrency: 'GBP', rate: 0.85, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '3', baseCurrency: 'USD', targetCurrency: 'EUR', rate: 0.93, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '4', baseCurrency: 'USD', targetCurrency: 'GBP', rate: 0.79, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '5', baseCurrency: 'GBP', targetCurrency: 'EUR', rate: 1.18, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '6', baseCurrency: 'GBP', targetCurrency: 'USD', rate: 1.27, lastUpdated: new Date().toISOString(), source: 'api' },
];

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export const ExchangeRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscriptionActive, setSubscriptionActive] = useState(false);

  // Carica i tassi di cambio all'avvio
  useEffect(() => {
    const loadRates = async () => {
      try {
        // In un'app reale, qui ci sarebbe una chiamata API al backend
        // Per ora usiamo i dati di mock
        setTimeout(() => {
          setExchangeRates(mockExchangeRates);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load exchange rates');
        setIsLoading(false);
      }
    };

    loadRates();
  }, []);

  // Funzione per aggiornare i tassi di cambio tramite API
  const refreshRates = async () => {
    // Verifica se l'abbonamento è attivo
    if (!isSubscriptionActive) {
      toast.error('Questa funzionalità è disponibile solo per gli utenti premium');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In un'app reale, qui ci sarebbe una chiamata API per aggiornare i tassi
      // Per ora simuliamo un aggiornamento con piccole variazioni casuali
      await new Promise(resolve => setTimeout(resolve, 2000));

      setExchangeRates(prev => 
        prev.map(rate => ({
          ...rate,
          rate: rate.rate * (1 + (Math.random() * 0.04 - 0.02)), // ±2% variazione
          lastUpdated: new Date().toISOString(),
          source: 'api'
        }))
      );

      toast.success('Tassi di cambio aggiornati con successo');
    } catch (err) {
      setError('Failed to refresh exchange rates');
      toast.error('Errore durante l\'aggiornamento dei tassi di cambio');
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per aggiungere un nuovo tasso di cambio
  const addExchangeRate = (rate: Omit<ExchangeRate, 'id' | 'lastUpdated'>) => {
    const newRate: ExchangeRate = {
      ...rate,
      id: uuidv4(),
      lastUpdated: new Date().toISOString()
    };

    setExchangeRates(prev => [...prev, newRate]);
    toast.success('Tasso di cambio aggiunto');
  };

  // Funzione per aggiornare un tasso di cambio esistente
  const updateExchangeRate = (id: string, rate: Partial<ExchangeRate>) => {
    setExchangeRates(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            ...rate,
            lastUpdated: new Date().toISOString(),
            // Se l'utente modifica manualmente, impostiamo source a 'manual'
            source: 'manual'
          };
        }
        return r;
      })
    );
    toast.success('Tasso di cambio aggiornato');
  };

  // Funzione per eliminare un tasso di cambio
  const deleteExchangeRate = (id: string) => {
    setExchangeRates(prev => prev.filter(r => r.id !== id));
    toast.success('Tasso di cambio eliminato');
  };

  // Funzione per ottenere un tasso di cambio specifico
  const getExchangeRate = (from: string, to: string): number | null => {
    const rate = exchangeRates.find(
      r => r.baseCurrency === from && r.targetCurrency === to
    );
    
    return rate ? rate.rate : null;
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
        getExchangeRate,
        isSubscriptionActive,
        setSubscriptionActive,
        refreshRates
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
