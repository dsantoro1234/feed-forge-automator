
import { FieldMapping, Product, ValidationResult } from '@/types';

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
  
  // Additional Google-specific validations would go here
  // For example, check for valid GTINs, MPNs, etc.
  
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
