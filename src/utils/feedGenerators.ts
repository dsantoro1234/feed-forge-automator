
import { FeedTemplate, Product, FieldMapping } from '@/types';
import { applyTransformations } from './transformations';
import { validateGoogleFeed, validateMetaFeed, validateTrovaprezzi } from './validation';

export const generateGoogleFeed = (products: Product[], template: FeedTemplate): string => {
  let xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>${template.name}</title>
  <link>https://example.com</link>
  <description>${template.description}</description>
`;

  for (const product of products) {
    const validationResult = validateGoogleFeed(product, template.mappings);
    
    if (!validationResult.isValid) {
      console.warn(`Skipping invalid product: ${product.id || 'Unknown'}`, validationResult.errors);
      continue;
    }

    xmlOutput += '  <item>\n';
    for (const mapping of template.mappings) {
      const sourceValue = product[mapping.sourceField];
      const value = sourceValue !== undefined && sourceValue !== null 
        ? applyTransformations(sourceValue, mapping.transformations)
        : mapping.defaultValue;
        
      if (value !== undefined && value !== null && value !== '') {
        xmlOutput += `    <g:${mapping.targetField}><![CDATA[${value}]]></g:${mapping.targetField}>\n`;
      }
    }
    xmlOutput += '  </item>\n';
  }

  xmlOutput += `</channel>
</rss>`;

  return xmlOutput;
};

export const generateMetaFeed = (products: Product[], template: FeedTemplate): string => {
  // Get all target fields for CSV header
  const headers = template.mappings.map(mapping => mapping.targetField);
  let csvOutput = headers.join(',') + '\n';

  for (const product of products) {
    const validationResult = validateMetaFeed(product, template.mappings);
    
    if (!validationResult.isValid) {
      console.warn(`Skipping invalid product: ${product.id || 'Unknown'}`, validationResult.errors);
      continue;
    }

    const values = headers.map(header => {
      const mapping = template.mappings.find(m => m.targetField === header);
      if (!mapping) return '';
      
      const sourceValue = product[mapping.sourceField];
      const value = sourceValue !== undefined && sourceValue !== null 
        ? applyTransformations(sourceValue, mapping.transformations)
        : mapping.defaultValue || '';
        
      // Escape commas with quotes for CSV format
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    
    csvOutput += values.join(',') + '\n';
  }

  return csvOutput;
};

export const generateTrovaprezziCSV = (products: Product[], template: FeedTemplate): string => {
  // The implementation is similar to Meta CSV but with Trovaprezzi-specific validations
  const headers = template.mappings.map(mapping => mapping.targetField);
  let csvOutput = headers.join(',') + '\n';

  for (const product of products) {
    const validationResult = validateTrovaprezzi(product, template.mappings);
    
    if (!validationResult.isValid) {
      console.warn(`Skipping invalid product: ${product.id || 'Unknown'}`, validationResult.errors);
      continue;
    }

    const values = headers.map(header => {
      const mapping = template.mappings.find(m => m.targetField === header);
      if (!mapping) return '';
      
      const sourceValue = product[mapping.sourceField];
      const value = sourceValue !== undefined && sourceValue !== null 
        ? applyTransformations(sourceValue, mapping.transformations)
        : mapping.defaultValue || '';
        
      // Escape commas with quotes for CSV format
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    
    csvOutput += values.join(',') + '\n';
  }

  return csvOutput;
};
