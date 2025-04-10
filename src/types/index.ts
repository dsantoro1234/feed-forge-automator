
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
  | 'concatenate'
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'add_percentage'
  | 'subtract_percentage'
  | 'truncate'                  // Nuovo: troncamento testo
  | 'replace'                   // Nuovo: sostituzione testo
  | 'combine_fields'            // Nuovo: unione campi
  | 'extract_substring'         // Nuovo: estrazione sottostringhe
  | 'custom_round'              // Nuovo: arrotondamento personalizzato
  | 'unit_conversion'           // Nuovo: conversione unità di misura
  | 'conditional_mapping'       // Nuovo: mappatura condizionale
  | 'color_normalize'           // Nuovo: normalizzazione colori
  | 'dynamic_url'               // Nuovo: URL dinamici
  | 'remove_html'               // Nuovo: pulizia HTML
  | 'value_mapping'             // Nuovo: mappatura valori
  | 'currency_conversion';      // Nuovo: conversione valuta

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

// Nuova interface per i tassi di cambio
export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  lastUpdated: string;
  source: 'api' | 'manual';
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
  shipping_length?: string;
  shipping_width?: string;
  shipping_height?: string;
  shipping_label?: string;
  transit_time_label?: string;
  max_handling_time?: number;
  min_handling_time?: number;
  tax?: string;
  tax_category?: string;
  size?: string;
  size_type?: string;
  size_system?: string;
  installment?: string;
  subscription_cost?: string;
  loyalty_points?: string;
  display_ads_id?: string;
  display_ads_similar_ids?: string;
  display_ads_title?: string;
  display_ads_link?: string;
  display_ads_value?: string;
  promotion_id?: string;
  included_destination?: string[];
  excluded_destination?: string[];
  ads_redirect?: string;
  custom_label_0?: string;
  custom_label_1?: string;
  custom_label_2?: string;
  custom_label_3?: string;
  custom_label_4?: string;
  unit_pricing_measure?: string;
  unit_pricing_base_measure?: string;
  cost_of_goods_sold?: string;
  availability_date?: string;
  sell_on_google_quantity?: number;
}
