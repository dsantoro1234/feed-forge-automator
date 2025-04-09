
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
