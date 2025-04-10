import { FieldTransformation } from '@/types';

// Helper function to apply transformations to a single field
export const applyTransformation = (value: any, transformation: FieldTransformation): any => {
  if (!transformation || transformation.type === 'none') {
    return value;
  }

  if (value === undefined || value === null) {
    return value;
  }

  switch (transformation.type) {
    case 'uppercase':
      return String(value).toUpperCase();
      
    case 'lowercase':
      return String(value).toLowerCase();
      
    case 'capitalize':
      return String(value).replace(/\b\w/g, char => char.toUpperCase());
      
    case 'trim':
      return String(value).trim();
      
    case 'number_format': {
      if (isNaN(Number(value))) return value;
      
      const decimals = transformation.params?.decimals || 2;
      const decimalSeparator = transformation.params?.decimalSeparator || '.';
      const thousandsSeparator = transformation.params?.thousandsSeparator || ',';
      
      const num = Number(value);
      const parts = num.toFixed(decimals).split('.');
      
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
      
      return parts.join(decimalSeparator);
    }
    
    case 'date_format': {
      try {
        const date = new Date(value);
        const formatString = transformation.params?.format || 'yyyy-MM-dd';
        
        // Simple date formatter - in a real app you'd use a library like date-fns
        return formatString
          .replace('yyyy', date.getFullYear().toString())
          .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
          .replace('dd', date.getDate().toString().padStart(2, '0'))
          .replace('HH', date.getHours().toString().padStart(2, '0'))
          .replace('mm', date.getMinutes().toString().padStart(2, '0'))
          .replace('ss', date.getSeconds().toString().padStart(2, '0'));
      } catch (error) {
        return value;
      }
    }
    
    case 'concatenate': {
      const templateStr = transformation.params?.template || '{value}';
      return templateStr.replace('{value}', String(value));
    }
    
    case 'add': {
      if (isNaN(Number(value))) return value;
      return Number(value) + Number(transformation.params?.value || 0);
    }
    
    case 'subtract': {
      if (isNaN(Number(value))) return value;
      return Number(value) - Number(transformation.params?.value || 0);
    }
    
    case 'multiply': {
      if (isNaN(Number(value))) return value;
      return Number(value) * Number(transformation.params?.value || 1);
    }
    
    case 'divide': {
      if (isNaN(Number(value))) return value;
      const divisor = Number(transformation.params?.value || 1);
      if (divisor === 0) return value;
      return Number(value) / divisor;
    }
    
    case 'add_percentage': {
      if (isNaN(Number(value))) return value;
      const percentage = Number(transformation.params?.percentage || 0);
      return Number(value) * (1 + percentage / 100);
    }
    
    case 'subtract_percentage': {
      if (isNaN(Number(value))) return value;
      const percentage = Number(transformation.params?.percentage || 0);
      return Number(value) * (1 - percentage / 100);
    }
    
    case 'truncate': {
      const maxLength = Number(transformation.params?.maxLength || 100);
      const text = String(value);
      
      if (text.length <= maxLength) {
        return text;
      }
      
      const truncated = text.substring(0, maxLength);
      return transformation.params?.ellipsis ? truncated + '...' : truncated;
    }
    
    case 'replace': {
      const search = transformation.params?.search || '';
      const replace = transformation.params?.replace || '';
      const text = String(value);
      
      if (transformation.params?.regex) {
        try {
          const flags = transformation.params?.caseInsensitive ? 'gi' : 'g';
          const regex = new RegExp(search, flags);
          return text.replace(regex, replace);
        } catch (error) {
          return text;
        }
      } else {
        if (transformation.params?.caseInsensitive) {
          const searchRegex = new RegExp(escapeRegExp(search), 'gi');
          return text.replace(searchRegex, replace);
        } else {
          return text.split(search).join(replace);
        }
      }
    }
    
    case 'combine_fields': {
      // This would need access to all fields, will be handled differently
      return value;
    }
    
    case 'extract_substring': {
      const text = String(value);
      const start = Number(transformation.params?.start || 0);
      const end = transformation.params?.end ? Number(transformation.params.end) : undefined;
      
      return text.substring(start, end);
    }
    
    case 'custom_round': {
      if (isNaN(Number(value))) return value;
      
      const num = Number(value);
      const type = transformation.params?.type || 'nearest';
      
      if (type === 'pricePoint') {
        const ending = transformation.params?.ending || '.99';
        const wholePart = Math.floor(num);
        return parseFloat(wholePart + ending);
      } else {
        const nearest = Number(transformation.params?.nearest || 1);
        
        switch (type) {
          case 'nearest':
            return Math.round(num / nearest) * nearest;
          case 'ceil':
            return Math.ceil(num / nearest) * nearest;
          case 'floor':
            return Math.floor(num / nearest) * nearest;
          default:
            return num;
        }
      }
    }
    
    case 'unit_conversion': {
      if (isNaN(Number(value))) return value;
      
      const num = Number(value);
      const conversionType = transformation.params?.conversion;
      
      switch (conversionType) {
        // Length conversions
        case 'in_to_cm': return num * 2.54;
        case 'cm_to_in': return num / 2.54;
        case 'ft_to_cm': return num * 30.48;
        case 'm_to_ft': return num * 3.28084;
        
        // Weight conversions
        case 'lb_to_kg': return num * 0.453592;
        case 'kg_to_lb': return num * 2.20462;
        case 'oz_to_g': return num * 28.3495;
        case 'g_to_oz': return num / 28.3495;
        
        default:
          return num;
      }
    }
    
    case 'conditional_mapping': {
      const conditions = transformation.params?.conditions || [];
      const text = String(value);
      const num = Number(value);
      
      for (const condition of conditions) {
        let matches = false;
        
        switch (condition.operator) {
          case 'equals':
            matches = value == condition.compareValue;
            break;
          case 'notEquals':
            matches = value != condition.compareValue;
            break;
          case 'greaterThan':
            matches = !isNaN(num) && num > Number(condition.compareValue);
            break;
          case 'lessThan':
            matches = !isNaN(num) && num < Number(condition.compareValue);
            break;
          case 'contains':
            matches = text.includes(condition.compareValue);
            break;
          case 'startsWith':
            matches = text.startsWith(condition.compareValue);
            break;
          case 'endsWith':
            matches = text.endsWith(condition.compareValue);
            break;
        }
        
        if (matches) {
          return condition.result;
        }
      }
      
      return transformation.params?.default !== undefined 
        ? transformation.params.default 
        : value;
    }
    
    case 'color_normalize': {
      // Simplified version - in a real app, you'd have a database of color mappings
      const colorMap: Record<string, Record<string, string>> = {
        it: {
          'rosso': 'red',
          'verde': 'green',
          'blu': 'blue',
          'giallo': 'yellow',
          'nero': 'black',
          'bianco': 'white',
        },
        fr: {
          'rouge': 'red',
          'vert': 'green',
          'bleu': 'blue',
          'jaune': 'yellow',
          'noir': 'black',
          'blanc': 'white',
        },
        de: {
          'rot': 'red',
          'grün': 'green',
          'blau': 'blue',
          'gelb': 'yellow',
          'schwarz': 'black',
          'weiß': 'white',
        },
        es: {
          'rojo': 'red',
          'verde': 'green',
          'azul': 'blue',
          'amarillo': 'yellow',
          'negro': 'black',
          'blanco': 'white',
        }
      };
      
      const text = String(value).toLowerCase();
      const language = transformation.params?.language || 'it';
      
      // Use custom mappings if enabled
      if (transformation.params?.useCustomMap && transformation.params?.customMap) {
        const customMap = transformation.params.customMap as Record<string, string>;
        for (const [src, target] of Object.entries(customMap)) {
          if (text === src.toLowerCase()) {
            return target;
          }
        }
      }
      
      // Use default mappings
      const languageMap = colorMap[language as keyof typeof colorMap] || {};
      return languageMap[text] || value;
    }
    
    case 'dynamic_url': {
      const baseUrl = transformation.params?.baseUrl || '';
      const paramName = transformation.params?.paramName || 'id';
      const additionalParams = transformation.params?.additionalParams || {};
      
      let url = baseUrl;
      
      // Add parameter separator
      if (url.includes('?')) {
        url += '&';
      } else {
        url += '?';
      }
      
      // Add main parameter
      url += `${paramName}=${encodeURIComponent(value)}`;
      
      // Add additional parameters
      for (const [key, val] of Object.entries(additionalParams)) {
        url += `&${key}=${encodeURIComponent(String(val))}`;
      }
      
      return url;
    }
    
    case 'remove_html': {
      return String(value).replace(/<[^>]*>/g, '');
    }
    
    case 'value_mapping': {
      const mappings = transformation.params?.mappings || {};
      const text = String(value);
      const caseSensitive = transformation.params?.caseSensitive || false;
      const keepOriginal = transformation.params?.keepOriginal !== false;
      
      if (caseSensitive) {
        const result = mappings[text];
        return result !== undefined ? result : (keepOriginal ? value : '');
      } else {
        const lowerText = text.toLowerCase();
        for (const [key, val] of Object.entries(mappings)) {
          if (key.toLowerCase() === lowerText) {
            return val;
          }
        }
        return keepOriginal ? value : '';
      }
    }
    
    case 'currency_conversion': {
      if (isNaN(Number(value))) return value;
      
      const num = Number(value);
      const from = transformation.params?.from || 'EUR';
      const to = transformation.params?.to || 'USD';
      
      // In a real app, this would use real exchange rate data
      let rate = 1.0;
      
      if (transformation.params?.useOfficial) {
        // Would fetch from some API or database in a real app
        const mockRates: Record<string, Record<string, number>> = {
          'EUR': { 'USD': 1.08, 'GBP': 0.86, 'JPY': 160.5 },
          'USD': { 'EUR': 0.93, 'GBP': 0.79, 'JPY': 149.5 },
          'GBP': { 'EUR': 1.16, 'USD': 1.26, 'JPY': 187.2 },
        };
        
        rate = (mockRates[from] && mockRates[from][to]) || 1.0;
      } else {
        // Use manual rate
        rate = Number(transformation.params?.manualRate || 1.0);
      }
      
      const converted = num * rate;
      
      if (transformation.params?.format) {
        const decimals = Number(transformation.params?.decimals || 2);
        return Number(converted.toFixed(decimals));
      }
      
      return converted;
    }
    
    default:
      return value;
  }
};

// Apply an array of transformations to a value
export const applyTransformations = (value: any, transformations: FieldTransformation[] = []): any => {
  if (!transformations || transformations.length === 0) {
    return value;
  }
  
  let result = value;
  
  for (const transformation of transformations) {
    result = applyTransformation(result, transformation);
  }
  
  return result;
};

// Utility function to combine multiple fields
export const combineFields = (
  mainValue: any, 
  otherFields: Record<string, any>,
  transformation: FieldTransformation
): any => {
  if (transformation.type !== 'combine_fields') {
    return mainValue;
  }
  
  const fields = transformation.params?.fields || [];
  const separator = transformation.params?.separator || ' ';
  let templateStr = transformation.params?.template || '';
  
  if (!templateStr) {
    // If no template provided, just join fields with separator
    const values = [mainValue, ...fields.map(field => otherFields[field] || '')];
    return values.filter(Boolean).join(separator);
  } else {
    // Replace value placeholder
    templateStr = templateStr.replace(/{value}/g, String(mainValue || ''));
    
    // Replace field placeholders
    for (const field of fields) {
      const pattern = new RegExp(`{${field}}`, 'g');
      templateStr = templateStr.replace(pattern, String(otherFields[field] || ''));
    }
    
    return templateStr;
  }
};

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
