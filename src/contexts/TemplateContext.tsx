
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
  getGoogleShoppingFields: () => { field: string; required: boolean; description: string; example: string }[];
  addPredefinedGoogleFields: (templateId: string) => void;
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

  // New function to get Google Shopping field definitions
  const getGoogleShoppingFields = () => {
    return [
      // Required fields
      { field: 'id', required: true, description: 'A unique identifier for the product', example: 'SKU123' },
      { field: 'title', required: true, description: 'Product title', example: 'Google Pixel 6 128GB Black' },
      { field: 'description', required: true, description: 'Product description', example: 'High-performance smartphone with exceptional camera capabilities.' },
      { field: 'link', required: true, description: 'URL directly linking to your product page', example: 'https://example.com/product/pixel-6' },
      { field: 'image_link', required: true, description: 'URL of the product\'s main image', example: 'https://example.com/images/pixel-6.jpg' },
      { field: 'availability', required: true, description: 'Product\'s availability status', example: 'in stock' },
      { field: 'price', required: true, description: 'Product\'s price with currency code', example: '699.00 USD' },
      
      // Strongly recommended fields (treated as required for most products)
      { field: 'brand', required: true, description: 'Product\'s brand name', example: 'Google' },
      { field: 'gtin', required: false, description: 'Global Trade Item Number (UPC, EAN, JAN, ISBN)', example: '885909950805' },
      { field: 'mpn', required: false, description: 'Manufacturer Part Number', example: 'GA01878-US' },
      { field: 'condition', required: false, description: 'Product\'s condition', example: 'new' },

      // Optional fields
      { field: 'additional_image_link', required: false, description: 'Additional product images (up to 10)', example: 'https://example.com/images/pixel-6-alt1.jpg' },
      { field: 'age_group', required: false, description: 'Target age group', example: 'adult' },
      { field: 'color', required: false, description: 'Product\'s color', example: 'Black' },
      { field: 'gender', required: false, description: 'Target gender', example: 'unisex' },
      { field: 'google_product_category', required: false, description: 'Google product taxonomy category', example: 'Electronics > Communications > Telephony > Mobile Phones' },
      { field: 'item_group_id', required: false, description: 'ID for a group of products that come in different variations', example: 'pixel-6-group' },
      { field: 'material', required: false, description: 'Material the product is made of', example: 'Aluminum and glass' },
      { field: 'pattern', required: false, description: 'Product\'s pattern', example: 'Striped' },
      { field: 'product_type', required: false, description: 'Your product\'s category', example: 'Smartphones' },
      { field: 'sale_price', required: false, description: 'Discounted price with currency', example: '649.00 USD' },
      { field: 'sale_price_effective_date', required: false, description: 'Date range when sale price is in effect', example: '2023-01-15T13:00:00-08:00/2023-01-22T15:30:00-08:00' },
      { field: 'shipping', required: false, description: 'Shipping cost and delivery time', example: 'US:CA:Ground:9.99 USD' },
      { field: 'shipping_weight', required: false, description: 'Product\'s shipping weight', example: '1.5 kg' },
      { field: 'adult', required: false, description: 'Whether the product contains adult content', example: 'no' },
      { field: 'multipack', required: false, description: 'Number of identical products in a multipack', example: '6' },
      { field: 'is_bundle', required: false, description: 'Whether the product is a bundle of different products', example: 'true' },
      { field: 'custom_label_0', required: false, description: 'Custom grouping of products (label 0)', example: 'Bestseller' },
      { field: 'custom_label_1', required: false, description: 'Custom grouping of products (label 1)', example: 'Summer' },
      { field: 'custom_label_2', required: false, description: 'Custom grouping of products (label 2)', example: 'Clearance' },
      { field: 'custom_label_3', required: false, description: 'Custom grouping of products (label 3)', example: 'New' },
      { field: 'custom_label_4', required: false, description: 'Custom grouping of products (label 4)', example: 'Limited Edition' },
    ];
  };

  // Add all predefined Google Shopping fields to a template
  const addPredefinedGoogleFields = (templateId: string) => {
    const googleFields = getGoogleShoppingFields();
    const template = getTemplateById(templateId);
    
    if (!template) {
      toast.error('Template not found');
      return;
    }
    
    // Get existing field names to avoid duplicates
    const existingFields = new Set(template.mappings.map(m => m.targetField));
    const fieldsToAdd = googleFields.filter(f => !existingFields.has(f.field));
    
    if (fieldsToAdd.length === 0) {
      toast.info('All Google Shopping fields already added');
      return;
    }
    
    // Add all fields
    setTemplates(prev => 
      prev.map(t => {
        if (t.id === templateId) {
          const newMappings = [...t.mappings];
          
          for (const field of fieldsToAdd) {
            newMappings.push({
              id: uuidv4(),
              sourceField: '', // Empty by default, user needs to map
              targetField: field.field,
              isRequired: field.required,
              defaultValue: '',
              transformations: [],
              description: field.description,
              example: field.example
            });
          }
          
          return {
            ...t,
            mappings: newMappings
          };
        }
        return t;
      })
    );
    
    toast.success(`Added ${fieldsToAdd.length} Google Shopping fields`);
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
        deleteFieldMapping,
        getGoogleShoppingFields,
        addPredefinedGoogleFields
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
