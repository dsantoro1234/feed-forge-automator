
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeedTemplate, FieldMapping } from '@/types';
import { mockTemplates } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface TemplateContextType {
  templates: FeedTemplate[];
  isLoading: boolean;
  getTemplateById: (id: string) => FeedTemplate | undefined;
  createTemplate: (template: Omit<FeedTemplate, 'id'>) => void;
  updateTemplate: (id: string, template: Partial<FeedTemplate>) => void;
  deleteTemplate: (id: string) => void;
  addFieldMapping: (templateId: string, mapping: Omit<FieldMapping, 'id'>) => void;
  updateFieldMapping: (templateId: string, mappingId: string, mapping: Partial<FieldMapping>) => void;
  deleteFieldMapping: (templateId: string, mappingId: string) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<FeedTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would load the templates from an API or localStorage
    // For the demo, we'll use the mock data and simulate a loading delay
    const timer = setTimeout(() => {
      setTemplates(mockTemplates);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getTemplateById = (id: string) => {
    return templates.find(template => template.id === id);
  };

  const createTemplate = (template: Omit<FeedTemplate, 'id'>) => {
    const newTemplate: FeedTemplate = {
      ...template,
      id: uuidv4()
    };
    setTemplates(prev => [...prev, newTemplate]);
    toast.success('Template created successfully');
  };

  const updateTemplate = (id: string, template: Partial<FeedTemplate>) => {
    setTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...template } : t))
    );
    toast.success('Template updated successfully');
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template deleted successfully');
  };

  const addFieldMapping = (templateId: string, mapping: Omit<FieldMapping, 'id'>) => {
    setTemplates(prev =>
      prev.map(t => {
        if (t.id === templateId) {
          return {
            ...t,
            mappings: [...t.mappings, { ...mapping, id: uuidv4() }]
          };
        }
        return t;
      })
    );
    toast.success('Field mapping added');
  };

  const updateFieldMapping = (
    templateId: string,
    mappingId: string,
    mapping: Partial<FieldMapping>
  ) => {
    setTemplates(prev =>
      prev.map(t => {
        if (t.id === templateId) {
          return {
            ...t,
            mappings: t.mappings.map(m =>
              m.id === mappingId ? { ...m, ...mapping } : m
            )
          };
        }
        return t;
      })
    );
  };

  const deleteFieldMapping = (templateId: string, mappingId: string) => {
    setTemplates(prev =>
      prev.map(t => {
        if (t.id === templateId) {
          return {
            ...t,
            mappings: t.mappings.filter(m => m.id !== mappingId)
          };
        }
        return t;
      })
    );
    toast.success('Field mapping removed');
  };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        isLoading,
        getTemplateById,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        addFieldMapping,
        updateFieldMapping,
        deleteFieldMapping
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};
