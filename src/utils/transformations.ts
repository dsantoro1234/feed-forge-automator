
import { FieldTransformation } from '@/types';
import { format } from 'date-fns';

export const applyTransformations = (value: any, transformations: FieldTransformation[]): any => {
  if (!transformations || transformations.length === 0) {
    return value;
  }

  let result = value;

  for (const transformation of transformations) {
    result = applySingleTransformation(result, transformation);
  }

  return result;
};

const applySingleTransformation = (value: any, transformation: FieldTransformation): any => {
  if (value === null || value === undefined) {
    return value;
  }

  switch (transformation.type) {
    case 'uppercase':
      return String(value).toUpperCase();
    case 'lowercase':
      return String(value).toLowerCase();
    case 'capitalize':
      return String(value)
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    case 'trim':
      return String(value).trim();
    case 'number_format':
      const numberValue = parseFloat(value);
      if (isNaN(numberValue)) return value;
      
      const decimals = transformation.params?.decimals || 2;
      const decimalSeparator = transformation.params?.decimalSeparator || '.';
      const thousandsSeparator = transformation.params?.thousandsSeparator || ',';
      
      const parts = numberValue.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
      
      return parts.join(decimalSeparator);
    case 'date_format':
      try {
        const dateValue = new Date(value);
        const formatString = transformation.params?.format || 'yyyy-MM-dd';
        return format(dateValue, formatString);
      } catch (error) {
        console.error('Date formatting error:', error);
        return value;
      }
    case 'concatenate':
      const template = transformation.params?.template || '';
      return template.replace(/\{value\}/g, String(value));
    
    // Nuove trasformazioni per operazioni matematiche
    case 'add':
      const addValue = parseFloat(value);
      const addParam = parseFloat(transformation.params?.value || '0');
      if (isNaN(addValue)) return value;
      return addValue + addParam;
    
    case 'subtract':
      const subtractValue = parseFloat(value);
      const subtractParam = parseFloat(transformation.params?.value || '0');
      if (isNaN(subtractValue)) return value;
      return subtractValue - subtractParam;
    
    case 'multiply':
      const multiplyValue = parseFloat(value);
      const multiplyParam = parseFloat(transformation.params?.value || '0');
      if (isNaN(multiplyValue)) return value;
      return multiplyValue * multiplyParam;
    
    case 'divide':
      const divideValue = parseFloat(value);
      const divideParam = parseFloat(transformation.params?.value || '0');
      if (isNaN(divideValue) || divideParam === 0) return value;
      return divideValue / divideParam;
      
    default:
      return value;
  }
};
