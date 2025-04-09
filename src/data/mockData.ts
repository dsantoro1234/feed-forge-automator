
import { ApiConfig, ClientConfig, FeedTemplate, FeedHistory, Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const mockApiConfig: ApiConfig = {
  endpoint: 'https://xano-api-example.com/api/products',
  apiKey: 'sample-api-key',
  tableName: 'products'
};

export const mockClientConfig: ClientConfig = {
  name: 'Demo Store',
  logo: 'https://placehold.co/100x50/0066ff/ffffff?text=Demo',
  scheduleFrequency: 'daily',
  scheduleHour: 8
};

export const mockTemplates: FeedTemplate[] = [
  {
    id: uuidv4(),
    name: 'Google Shopping Feed',
    description: 'Standard Google Merchant feed template',
    type: 'google',
    isActive: true,
    lastGenerated: '2023-07-15T08:30:00Z',
    mappings: [
      {
        id: uuidv4(),
        sourceField: 'id',
        targetField: 'id',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'title',
        targetField: 'title',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'description',
        targetField: 'description',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'link',
        targetField: 'link',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'image_link',
        targetField: 'image_link',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'price',
        targetField: 'price',
        isRequired: true,
        transformations: [
          {
            type: 'number_format',
            params: {
              decimals: 2,
              decimalSeparator: '.',
              thousandsSeparator: ''
            }
          }
        ]
      },
      {
        id: uuidv4(),
        sourceField: 'availability',
        targetField: 'availability',
        isRequired: true,
        defaultValue: 'in stock',
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'brand',
        targetField: 'brand',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'gtin',
        targetField: 'gtin',
        isRequired: false,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'mpn',
        targetField: 'mpn',
        isRequired: false,
        transformations: []
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Facebook/Meta Catalog Feed',
    description: 'Standard Meta catalog feed for Facebook and Instagram',
    type: 'meta',
    isActive: true,
    lastGenerated: '2023-07-14T10:15:00Z',
    mappings: [
      {
        id: uuidv4(),
        sourceField: 'id',
        targetField: 'id',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'title',
        targetField: 'title',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'description',
        targetField: 'description',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'link',
        targetField: 'link',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'image_link',
        targetField: 'image_link',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'price',
        targetField: 'price',
        isRequired: true,
        transformations: [
          {
            type: 'number_format',
            params: {
              decimals: 2,
              decimalSeparator: '.',
              thousandsSeparator: ''
            }
          }
        ]
      },
      {
        id: uuidv4(),
        sourceField: 'availability',
        targetField: 'availability',
        isRequired: true,
        defaultValue: 'in stock',
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'brand',
        targetField: 'brand',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'condition',
        targetField: 'condition',
        isRequired: false,
        defaultValue: 'new',
        transformations: []
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Trovaprezzi Feed',
    description: 'Feed standard per Trovaprezzi',
    type: 'trovaprezzi',
    isActive: false,
    mappings: [
      {
        id: uuidv4(),
        sourceField: 'id',
        targetField: 'id',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'title',
        targetField: 'name',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'description',
        targetField: 'description',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'link',
        targetField: 'link',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'image_link',
        targetField: 'image',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'price',
        targetField: 'price',
        isRequired: true,
        transformations: [
          {
            type: 'number_format',
            params: {
              decimals: 2,
              decimalSeparator: '.',
              thousandsSeparator: ''
            }
          }
        ]
      },
      {
        id: uuidv4(),
        sourceField: 'availability',
        targetField: 'stock',
        isRequired: true,
        defaultValue: 'available',
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'brand',
        targetField: 'brand',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'category',
        targetField: 'category',
        isRequired: true,
        transformations: []
      },
      {
        id: uuidv4(),
        sourceField: 'shipping_cost',
        targetField: 'shipping',
        isRequired: false,
        defaultValue: '0',
        transformations: []
      }
    ]
  }
];

export const mockFeedHistory: FeedHistory[] = [
  {
    id: uuidv4(),
    templateId: mockTemplates[0].id,
    templateName: mockTemplates[0].name,
    type: 'google',
    generatedAt: '2023-07-15T08:30:00Z',
    status: 'success',
    fileUrl: '#',
    productCount: 1250,
    warningCount: 15
  },
  {
    id: uuidv4(),
    templateId: mockTemplates[1].id,
    templateName: mockTemplates[1].name,
    type: 'meta',
    generatedAt: '2023-07-14T10:15:00Z',
    status: 'success',
    fileUrl: '#',
    productCount: 1250,
    warningCount: 23
  },
  {
    id: uuidv4(),
    templateId: mockTemplates[0].id,
    templateName: mockTemplates[0].name,
    type: 'google',
    generatedAt: '2023-07-14T08:30:00Z',
    status: 'error',
    errorMessage: 'Connection to API failed',
    productCount: 0,
    warningCount: 0
  }
];

export const mockSampleProducts: Product[] = [
  {
    id: '1',
    title: 'Smartphone Premium XYZ',
    description: 'Smartphone di ultima generazione con fotocamera avanzata e batteria a lunga durata',
    link: 'https://example.com/products/smartphone-premium-xyz',
    image_link: 'https://example.com/images/smartphone-premium-xyz.jpg',
    price: 799.99,
    availability: 'in stock',
    brand: 'XYZ Electronics',
    gtin: '1234567890123',
    mpn: 'XYZ-SP-1000',
    condition: 'new',
    category: 'Elettronica > Smartphone',
    shipping_cost: '0'
  },
  {
    id: '2',
    title: 'Laptop Professionale ABC',
    description: 'Laptop potente per professionisti e gamers con scheda grafica dedicata',
    link: 'https://example.com/products/laptop-professionale-abc',
    image_link: 'https://example.com/images/laptop-professionale-abc.jpg',
    price: 1299.99,
    availability: 'in stock',
    brand: 'ABC Computing',
    gtin: '2345678901234',
    mpn: 'ABC-LP-2000',
    condition: 'new',
    category: 'Elettronica > Computer > Laptop',
    shipping_cost: '0'
  },
  {
    id: '3',
    title: 'Smartwatch Fitness Pro',
    description: 'Smartwatch impermeabile con monitoraggio della salute e GPS integrato',
    link: 'https://example.com/products/smartwatch-fitness-pro',
    image_link: 'https://example.com/images/smartwatch-fitness-pro.jpg',
    price: 199.99,
    availability: 'in stock',
    brand: 'Fitness Gear',
    gtin: '3456789012345',
    mpn: 'FG-SW-3000',
    condition: 'new',
    category: 'Elettronica > Wearable > Smartwatch',
    shipping_cost: '0'
  }
];
