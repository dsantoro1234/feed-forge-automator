
import { FieldMapping, Product, ValidationResult, GoogleProductAvailability, GoogleProductCondition } from '@/types';

export const validateProduct = (product: Product, mappings: FieldMapping[]): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  for (const mapping of mappings) {
    const value = product[mapping.sourceField] || mapping.defaultValue;
    
    // Check required fields
    if (mapping.isRequired && (value === undefined || value === null || value === '')) {
      result.isValid = false;
      result.errors.push({
        field: mapping.targetField,
        message: `Required field ${mapping.targetField} is missing or empty`,
        product: { id: product.id, [mapping.sourceField]: value }
      });
    }
  }

  return result;
};

export const validateGoogleFeed = (product: Product, mappings: FieldMapping[]): ValidationResult => {
  const baseResult = validateProduct(product, mappings);
  
  // Google Shopping specific validations
  const mappedFields: Record<string, any> = {};
  
  // First collect all mapped fields for validation
  for (const mapping of mappings) {
    const value = product[mapping.sourceField] || mapping.defaultValue;
    mappedFields[mapping.targetField] = value;
  }
  
  // Check for required Google Shopping fields
  const requiredFields = ['id', 'title', 'description', 'link', 'image_link', 'price', 'availability'];
  
  for (const field of requiredFields) {
    if (!mappedFields[field]) {
      baseResult.isValid = false;
      baseResult.errors.push({
        field,
        message: `Google Shopping required field "${field}" is missing or empty`,
        product: { id: product.id }
      });
    }
  }
  
  // Check if at least one unique product identifier is present (brand + gtin or brand + mpn)
  const hasGtin = !!mappedFields['gtin'];
  const hasMpn = !!mappedFields['mpn'];
  const hasBrand = !!mappedFields['brand'];
  
  const hasIdentifiers = (hasGtin || hasMpn) && hasBrand;
  
  if (!hasIdentifiers) {
    baseResult.warnings.push({
      field: 'identifiers',
      message: 'Product is missing proper identifiers. Either GTIN or MPN should be provided along with Brand',
      product: { id: product.id }
    });
  }
  
  // Validate availability format
  if (mappedFields['availability']) {
    const validAvailabilityValues: GoogleProductAvailability[] = ['in stock', 'out of stock', 'preorder', 'backorder'];
    if (!validAvailabilityValues.includes(mappedFields['availability'])) {
      baseResult.errors.push({
        field: 'availability',
        message: `Invalid availability value "${mappedFields['availability']}". Must be one of: ${validAvailabilityValues.join(', ')}`,
        product: { id: product.id }
      });
      baseResult.isValid = false;
    }
  }
  
  // Validate price format (currency code required)
  if (mappedFields['price'] && typeof mappedFields['price'] === 'string' && mappedFields['price'].match && !mappedFields['price'].match(/^\d+(\.\d+)?\s[A-Z]{3}$/)) {
    baseResult.warnings.push({
      field: 'price',
      message: 'Price should be in format "100.00 USD" with a space and currency code',
      product: { id: product.id, price: mappedFields['price'] }
    });
  }
  
  // Validate condition if present
  if (mappedFields['condition']) {
    const validConditionValues: GoogleProductCondition[] = ['new', 'refurbished', 'used'];
    if (!validConditionValues.includes(mappedFields['condition'])) {
      baseResult.warnings.push({
        field: 'condition',
        message: `Invalid condition value "${mappedFields['condition']}". Must be one of: ${validConditionValues.join(', ')}`,
        product: { id: product.id }
      });
    }
  }
  
  return baseResult;
};

export const validateMetaFeed = (product: Product, mappings: FieldMapping[]): ValidationResult => {
  const baseResult = validateProduct(product, mappings);
  
  // Additional Meta-specific validations would go here
  
  return baseResult;
};

export const validateTrovaprezzi = (product: Product, mappings: FieldMapping[]): ValidationResult => {
  const baseResult = validateProduct(product, mappings);
  
  // Additional Trovaprezzi-specific validations would go here
  
  return baseResult;
};
