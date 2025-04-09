
export interface ApiConfig {
  endpoint: string;
  apiKey: string;
  tableName: string;
}

export interface ClientConfig {
  name: string;
  logo?: string;
  scheduleFrequency: 'hourly' | 'daily' | 'weekly';
  scheduleDay?: number; // 0-6 for day of week if weekly
  scheduleHour: number; // 0-23
}

export type FeedType = 'google' | 'meta' | 'trovaprezzi';

export type FieldTransformationType = 
  | 'none' 
  | 'uppercase' 
  | 'lowercase' 
  | 'capitalize' 
  | 'trim'
  | 'number_format'
  | 'date_format'
  | 'concatenate';

export interface FieldTransformation {
  type: FieldTransformationType;
  params?: Record<string, any>;
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  isRequired: boolean;
  defaultValue?: string;
  transformations: FieldTransformation[];
  description?: string; // Added description for field documentation
  example?: string; // Added example value
}

export interface FeedTemplate {
  id: string;
  name: string;
  description: string;
  type: FeedType;
  mappings: FieldMapping[];
  isActive: boolean;
  lastGenerated?: string;
}

export interface FeedHistory {
  id: string;
  templateId: string;
  templateName: string;
  type: FeedType;
  generatedAt: string;
  status: 'success' | 'error' | 'warning';
  fileUrl?: string;
  errorMessage?: string;
  productCount: number;
  warningCount: number;
}

export interface Product {
  [key: string]: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  product?: Partial<Product>;
}

export interface ValidationWarning {
  field: string;
  message: string;
  product?: Partial<Product>;
}

// New Google Shopping specific types
export type GoogleProductAvailability = 
  | 'in stock' 
  | 'out of stock' 
  | 'preorder' 
  | 'backorder';

export type GoogleProductCondition = 
  | 'new' 
  | 'refurbished' 
  | 'used';

export type GoogleProductAgeGroup = 
  | 'newborn' 
  | 'infant' 
  | 'toddler' 
  | 'kids' 
  | 'adult';

export type GoogleProductGender = 
  | 'male' 
  | 'female' 
  | 'unisex';

export type GoogleProductAdult = 
  | 'yes' 
  | 'no';

export interface GoogleShoppingFields {
  // Required fields
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  availability: GoogleProductAvailability;
  price: string;
  brand?: string; // Required for most product categories
  gtin?: string; // Required if available
  mpn?: string; // Required if available
  condition?: GoogleProductCondition;
  
  // Optional fields
  additional_image_link?: string[];
  age_group?: GoogleProductAgeGroup;
  color?: string;
  gender?: GoogleProductGender;
  item_group_id?: string;
  material?: string;
  pattern?: string;
  product_type?: string;
  google_product_category?: string;
  adult?: GoogleProductAdult;
  multipack?: number;
  is_bundle?: boolean;
  energy_efficiency_class?: string;
  min_energy_efficiency_class?: string;
  max_energy_efficiency_class?: string;
  sale_price?: string;
  sale_price_effective_date?: string;
  expiration_date?: string;
  shipping?: string;
  shipping_weight?: string;
  custom_label_0?: string;
  custom_label_1?: string;
  custom_label_2?: string;
  custom_label_3?: string;
  custom_label_4?: string;
}
