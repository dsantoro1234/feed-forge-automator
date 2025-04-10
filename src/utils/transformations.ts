
import { Transformation } from '@/types';

// Add any necessary utility functions for transformations here
export const applyTransformation = (value: any, transformation: Transformation): any => {
  switch (transformation.type) {
    case 'replace':
      return value.replace(transformation.find || '', transformation.replace || '');
    case 'append':
      return `${value}${transformation.value || ''}`;
    case 'prepend':
      return `${transformation.value || ''}${value}`;
    case 'lowercase':
      return String(value).toLowerCase();
    case 'uppercase':
      return String(value).toUpperCase();
    case 'number_format':
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(transformation.decimals || 2);
    case 'substring':
      return String(value).substring(
        transformation.start || 0,
        transformation.end !== undefined ? transformation.end : undefined
      );
    case 'currency_conversion':
      const amount = parseFloat(value);
      if (isNaN(amount)) return value;
      const rate = transformation.rate || 1;
      return (amount * rate).toFixed(2);
    default:
      return value;
  }
};

// Function to apply multiple transformations in sequence
export const applyTransformations = (value: any, transformations: Transformation[] = []): any => {
  return transformations.reduce((currentValue, transformation) => {
    return applyTransformation(currentValue, transformation);
  }, value);
};
