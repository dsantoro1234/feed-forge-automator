
import { FieldTransformation, ExchangeRate } from '@/types';
import { format } from 'date-fns';

// Mock di tassi di cambio per lo sviluppo
const mockExchangeRates: ExchangeRate[] = [
  { id: '1', baseCurrency: 'EUR', targetCurrency: 'USD', rate: 1.08, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '2', baseCurrency: 'EUR', targetCurrency: 'GBP', rate: 0.85, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '3', baseCurrency: 'USD', targetCurrency: 'EUR', rate: 0.93, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '4', baseCurrency: 'USD', targetCurrency: 'GBP', rate: 0.79, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '5', baseCurrency: 'GBP', targetCurrency: 'EUR', rate: 1.18, lastUpdated: new Date().toISOString(), source: 'api' },
  { id: '6', baseCurrency: 'GBP', targetCurrency: 'USD', rate: 1.27, lastUpdated: new Date().toISOString(), source: 'api' },
];

// Mappa standard dei colori per normalizzazione
const standardColors: Record<string, string> = {
  'rosso': 'red',
  'blu': 'blue',
  'verde': 'green',
  'giallo': 'yellow',
  'nero': 'black',
  'bianco': 'white',
  'grigio': 'gray',
  'arancione': 'orange',
  'viola': 'purple',
  'rosa': 'pink',
  'marrone': 'brown',
  'azzurro': 'lightblue',
  // Aggiungi altri mapping colori qui
};

// Mappa per le conversioni di unità di misura
const unitConversions: Record<string, Record<string, number>> = {
  'length': {
    'in_to_cm': 2.54,
    'ft_to_cm': 30.48,
    'cm_to_in': 0.3937,
    'm_to_ft': 3.28084,
    // Aggiungi altre conversioni
  },
  'weight': {
    'lb_to_kg': 0.45359237,
    'kg_to_lb': 2.20462,
    'oz_to_g': 28.3495,
    'g_to_oz': 0.03527396,
    // Aggiungi altre conversioni
  },
  // Aggiungi altre categorie di conversione
};

export const getExchangeRate = (baseCurrency: string, targetCurrency: string): number | null => {
  // In una implementazione reale, qui si accederebbbe al database
  const rate = mockExchangeRates.find(
    r => r.baseCurrency === baseCurrency && r.targetCurrency === targetCurrency
  );
  
  return rate ? rate.rate : null;
};

export const applyTransformations = (value: any, transformations: FieldTransformation[], otherFields?: Record<string, any>): any => {
  if (!transformations || transformations.length === 0) {
    return value;
  }

  let result = value;

  for (const transformation of transformations) {
    result = applySingleTransformation(result, transformation, otherFields);
  }

  return result;
};

const applySingleTransformation = (value: any, transformation: FieldTransformation, otherFields?: Record<string, any>): any => {
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
    
    case 'add_percentage':
      const addPercentValue = parseFloat(value);
      const addPercentParam = parseFloat(transformation.params?.percentage || '0');
      if (isNaN(addPercentValue)) return value;
      return addPercentValue + (addPercentValue * addPercentParam / 100);
    
    case 'subtract_percentage':
      const subtractPercentValue = parseFloat(value);
      const subtractPercentParam = parseFloat(transformation.params?.percentage || '0');
      if (isNaN(subtractPercentValue)) return value;
      return subtractPercentValue - (subtractPercentValue * subtractPercentParam / 100);
      
    // Nuove trasformazioni
    case 'truncate':
      const maxLength = parseInt(transformation.params?.maxLength || '100');
      const stringValue = String(value);
      
      if (stringValue.length <= maxLength) return stringValue;
      
      const ellipsis = transformation.params?.ellipsis === true;
      return ellipsis 
        ? stringValue.substring(0, maxLength) + '...' 
        : stringValue.substring(0, maxLength);
    
    case 'replace':
      const search = transformation.params?.search || '';
      const replace = transformation.params?.replace || '';
      const useRegex = transformation.params?.regex === true;
      
      if (useRegex && search) {
        try {
          const flags = transformation.params?.caseInsensitive ? 'gi' : 'g';
          const regex = new RegExp(search, flags);
          return String(value).replace(regex, replace);
        } catch (error) {
          console.error('Regex replacement error:', error);
          return value;
        }
      }
      
      return String(value).replace(new RegExp(search, 'g'), replace);
      
    case 'combine_fields':
      if (!otherFields) return value;
      
      const fields = transformation.params?.fields || [];
      const separator = transformation.params?.separator || ' ';
      const template = transformation.params?.template || '';
      
      // Se non ci sono altri campi da combinare, ritorna il valore originale
      if (fields.length === 0) return value;
      
      // Ottieni i valori dei campi specificati
      const fieldValues: Record<string, any> = { value };
      for (const field of fields) {
        fieldValues[field] = otherFields[field] || '';
      }
      
      // Se c'è un template, sostituisci i valori in esso
      if (template) {
        let result = template;
        for (const [key, val] of Object.entries(fieldValues)) {
          result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
        }
        return result;
      }
      
      // Altrimenti unisci i valori con il separatore
      return [String(value), ...fields.map(f => String(otherFields[f] || ''))].join(separator);
      
    case 'extract_substring':
      const start = parseInt(transformation.params?.start || '0');
      const end = transformation.params?.end 
        ? parseInt(transformation.params.end)
        : undefined;
      return String(value).substring(start, end);
      
    case 'custom_round':
      const roundValue = parseFloat(value);
      if (isNaN(roundValue)) return value;
      
      const roundType = transformation.params?.type || 'nearest';
      const nearest = parseFloat(transformation.params?.nearest || '1');
      
      if (roundType === 'nearest') {
        return Math.round(roundValue / nearest) * nearest;
      } else if (roundType === 'ceil') {
        return Math.ceil(roundValue / nearest) * nearest;
      } else if (roundType === 'floor') {
        return Math.floor(roundValue / nearest) * nearest;
      } else if (roundType === 'pricePoint') {
        // Arrotondamento a un prezzo con terminazione specifica (es. .99)
        const base = Math.floor(roundValue);
        const ending = transformation.params?.ending || '.99';
        return parseFloat(`${base}${ending}`);
      }
      
      return roundValue;
      
    case 'unit_conversion':
      const unitValue = parseFloat(value);
      if (isNaN(unitValue)) return value;
      
      const conversionType = transformation.params?.type || '';
      const conversionKey = transformation.params?.conversion || '';
      
      if (!unitConversions[conversionType] || !unitConversions[conversionType][conversionKey]) {
        return value;
      }
      
      const factor = unitConversions[conversionType][conversionKey];
      return unitValue * factor;
      
    case 'conditional_mapping':
      const conditions = transformation.params?.conditions || [];
      const defaultResult = transformation.params?.default !== undefined 
        ? transformation.params.default 
        : value;
      
      // Verifica ogni condizione e applica la trasformazione corrispondente
      for (const condition of conditions) {
        const { operator, compareValue, result } = condition;
        
        switch (operator) {
          case 'equals':
            if (value == compareValue) return result;
            break;
          case 'notEquals':
            if (value != compareValue) return result;
            break;
          case 'greaterThan':
            if (parseFloat(value) > parseFloat(compareValue)) return result;
            break;
          case 'lessThan':
            if (parseFloat(value) < parseFloat(compareValue)) return result;
            break;
          case 'contains':
            if (String(value).includes(String(compareValue))) return result;
            break;
          case 'startsWith':
            if (String(value).startsWith(String(compareValue))) return result;
            break;
          case 'endsWith':
            if (String(value).endsWith(String(compareValue))) return result;
            break;
          // Aggiungi altri operatori se necessario
        }
      }
      
      return defaultResult;
      
    case 'color_normalize':
      const colorValue = String(value).toLowerCase().trim();
      const normalizeLanguage = transformation.params?.language || 'it';
      
      // Usa la mappa standard o una mappa personalizzata
      const colorMap = transformation.params?.customMap || standardColors;
      
      return colorMap[colorValue] || value;
      
    case 'dynamic_url':
      const baseUrl = transformation.params?.baseUrl || '';
      const paramName = transformation.params?.paramName || 'id';
      const additionalParams = transformation.params?.additionalParams || {};
      
      // Crea l'URL base
      let url = baseUrl;
      
      // Aggiungi il parametro principale
      url += url.includes('?') ? '&' : '?';
      url += `${paramName}=${encodeURIComponent(value)}`;
      
      // Aggiungi eventuali parametri aggiuntivi
      for (const [key, val] of Object.entries(additionalParams)) {
        url += `&${key}=${encodeURIComponent(String(val))}`;
      }
      
      return url;
      
    case 'remove_html':
      return String(value).replace(/<[^>]*>/g, '');
      
    case 'value_mapping':
      const mappings = transformation.params?.mappings || {};
      const caseSensitive = transformation.params?.caseSensitive === true;
      
      const lookupValue = caseSensitive ? String(value) : String(value).toLowerCase();
      const mappingKeys = Object.keys(mappings);
      
      for (const key of mappingKeys) {
        const compareKey = caseSensitive ? key : key.toLowerCase();
        if (lookupValue === compareKey) {
          return mappings[key];
        }
      }
      
      // Ritorna il valore originale se non ci sono mapping corrispondenti
      return transformation.params?.keepOriginal !== false ? value : '';
      
    case 'currency_conversion':
      const currencyValue = parseFloat(value);
      if (isNaN(currencyValue)) return value;
      
      const from = transformation.params?.from || 'EUR';
      const to = transformation.params?.to || 'USD';
      const manualRate = parseFloat(transformation.params?.manualRate || '0');
      const useOfficial = transformation.params?.useOfficial === true;
      
      let exchangeRate: number | null = null;
      
      // Prima prova a usare il tasso manuale se fornito
      if (!useOfficial && manualRate > 0) {
        exchangeRate = manualRate;
      } else {
        // Altrimenti usa i tassi ufficiali (da API/DB)
        exchangeRate = getExchangeRate(from, to);
      }
      
      if (!exchangeRate) {
        console.warn(`Exchange rate not found for ${from} to ${to}`);
        return value;
      }
      
      const convertedValue = currencyValue * exchangeRate;
      
      // Formatta il risultato se richiesto
      if (transformation.params?.format === true) {
        const decimals = transformation.params?.decimals || 2;
        return convertedValue.toFixed(decimals);
      }
      
      return convertedValue;
      
    default:
      return value;
  }
};
