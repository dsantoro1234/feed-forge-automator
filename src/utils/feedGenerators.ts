
import { FeedTemplate, Product, FieldMapping } from '@/types';
import { applyTransformations } from './transformations';
import { validateGoogleFeed, validateMetaFeed, validateTrovaprezzi } from './validation';

export const generateGoogleFeed = (products: Product[], template: FeedTemplate): string => {
  // Contatori per statistiche
  let validProductCount = 0;
  let skippedProductCount = 0;
  let warningCount = 0;

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
      skippedProductCount++;
      warningCount += validationResult.warnings.length;
      continue;
    }

    validProductCount++;
    warningCount += validationResult.warnings.length;

    xmlOutput += '  <item>\n';
    
    // Aggiungi i campi mappati
    for (const mapping of template.mappings) {
      const sourceValue = product[mapping.sourceField];
      const value = sourceValue !== undefined && sourceValue !== null 
        ? applyTransformations(sourceValue, mapping.transformations)
        : mapping.defaultValue;
        
      if (value !== undefined && value !== null && value !== '') {
        xmlOutput += `    <g:${mapping.targetField}><![CDATA[${value}]]></g:${mapping.targetField}>\n`;
      }
    }
    
    // Assicurati che l'ID prodotto sia sempre presente (richiesto da Google)
    const hasId = template.mappings.some(m => m.targetField === 'id');
    if (!hasId && product.id) {
      xmlOutput += `    <g:id><![CDATA[${product.id}]]></g:id>\n`;
    }
    
    xmlOutput += '  </item>\n';
  }

  xmlOutput += `</channel>
</rss>`;

  console.log(`Feed generato: ${validProductCount} prodotti validi, ${skippedProductCount} prodotti saltati, ${warningCount} warnings`);
  
  return xmlOutput;
};

export const generateMetaFeed = (products: Product[], template: FeedTemplate): string => {
  // Contatori per statistiche
  let validProductCount = 0;
  let skippedProductCount = 0;
  let warningCount = 0;
  
  // Get all target fields for CSV header
  const headers = template.mappings.map(mapping => mapping.targetField);
  let csvOutput = headers.join(',') + '\n';

  for (const product of products) {
    const validationResult = validateMetaFeed(product, template.mappings);
    
    if (!validationResult.isValid) {
      console.warn(`Skipping invalid product: ${product.id || 'Unknown'}`, validationResult.errors);
      skippedProductCount++;
      warningCount += validationResult.warnings.length;
      continue;
    }

    validProductCount++;
    warningCount += validationResult.warnings.length;

    const values = headers.map(header => {
      const mapping = template.mappings.find(m => m.targetField === header);
      if (!mapping) return '';
      
      const sourceValue = product[mapping.sourceField];
      const value = sourceValue !== undefined && sourceValue !== null 
        ? applyTransformations(sourceValue, mapping.transformations)
        : mapping.defaultValue || '';
        
      // Escape commas and quotes for CSV format
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    
    csvOutput += values.join(',') + '\n';
  }

  console.log(`Feed generato: ${validProductCount} prodotti validi, ${skippedProductCount} prodotti saltati, ${warningCount} warnings`);
  
  return csvOutput;
};

export const generateTrovaprezziCSV = (products: Product[], template: FeedTemplate): string => {
  // Contatori per statistiche
  let validProductCount = 0;
  let skippedProductCount = 0;
  let warningCount = 0;
  
  // The implementation is similar to Meta CSV but with Trovaprezzi-specific validations
  const headers = template.mappings.map(mapping => mapping.targetField);
  let csvOutput = headers.join(',') + '\n';

  for (const product of products) {
    const validationResult = validateTrovaprezzi(product, template.mappings);
    
    if (!validationResult.isValid) {
      console.warn(`Skipping invalid product: ${product.id || 'Unknown'}`, validationResult.errors);
      skippedProductCount++;
      warningCount += validationResult.warnings.length;
      continue;
    }

    validProductCount++;
    warningCount += validationResult.warnings.length;

    const values = headers.map(header => {
      const mapping = template.mappings.find(m => m.targetField === header);
      if (!mapping) return '';
      
      const sourceValue = product[mapping.sourceField];
      const value = sourceValue !== undefined && sourceValue !== null 
        ? applyTransformations(sourceValue, mapping.transformations)
        : mapping.defaultValue || '';
        
      // Escape commas and quotes for CSV format
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    
    csvOutput += values.join(',') + '\n';
  }

  console.log(`Feed generato: ${validProductCount} prodotti validi, ${skippedProductCount} prodotti saltati, ${warningCount} warnings`);
  
  return csvOutput;
};

// Funzione di utilità per scaricare il feed generato
export const downloadFeedFile = (content: string, filename: string, type: 'xml' | 'csv'): void => {
  const contentType = type === 'xml' ? 'application/xml' : 'text/csv';
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Rilascia l'URL oggetto per liberare memoria
  URL.revokeObjectURL(url);
};

// Funzione per generare un feed in base al tipo di template
export const generateFeedByType = (products: Product[], template: FeedTemplate): string => {
  switch (template.type) {
    case 'google':
      return generateGoogleFeed(products, template);
    case 'meta':
      return generateMetaFeed(products, template);
    case 'trovaprezzi':
      return generateTrovaprezziCSV(products, template);
    default:
      throw new Error(`Tipo di feed non supportato: ${template.type}`);
  }
};
