
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
    default:
      return value;
  }
};
