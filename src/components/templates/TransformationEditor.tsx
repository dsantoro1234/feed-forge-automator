
import React, { useState } from 'react';
import { FieldTransformation, FieldTransformationType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { useExchangeRates } from '@/contexts/ExchangeRateContext';
import { useProducts } from '@/contexts/ProductContext';

interface TransformationEditorProps {
  transformation: FieldTransformation;
  onUpdate: (transformation: FieldTransformation) => void;
  onRemove: () => void;
}

const TransformationEditor: React.FC<TransformationEditorProps> = ({ 
  transformation, 
  onUpdate, 
  onRemove 
}) => {
  const { exchangeRates, isSubscriptionActive } = useExchangeRates();
  const { getProductFields } = useProducts();
  const availableSourceFields = getProductFields();
  
  const transformationLabels: Record<FieldTransformationType, string> = {
    'none': 'No transformation',
    'uppercase': 'Uppercase',
    'lowercase': 'Lowercase',
    'capitalize': 'Capitalize',
    'trim': 'Trim',
    'number_format': 'Number format',
    'date_format': 'Date format',
    'concatenate': 'Concatenate',
    'add': 'Add (number)',
    'subtract': 'Subtract (number)',
    'multiply': 'Multiply (number)',
    'divide': 'Divide (number)',
    'add_percentage': 'Add percentage (%)',
    'subtract_percentage': 'Subtract percentage (%)',
    'truncate': 'Truncate text',
    'replace': 'Replace text',
    'combine_fields': 'Combine fields',
    'extract_substring': 'Extract substring',
    'custom_round': 'Custom rounding',
    'unit_conversion': 'Unit conversion',
    'conditional_mapping': 'Conditional mapping',
    'color_normalize': 'Normalize color',
    'dynamic_url': 'Dynamic URL',
    'remove_html': 'Remove HTML',
    'value_mapping': 'Value mapping',
    'currency_conversion': 'Currency conversion'
  };
  
  const needsNumericParam = (type: FieldTransformationType) => {
    return ['add', 'subtract', 'multiply', 'divide'].includes(type);
  };

  const needsPercentageParam = (type: FieldTransformationType) => {
    return ['add_percentage', 'subtract_percentage'].includes(type);
  };
  
  const getCategoryForTransformation = (type: FieldTransformationType): string => {
    if (['uppercase', 'lowercase', 'capitalize', 'trim', 'truncate', 'replace', 'remove_html', 'extract_substring'].includes(type)) {
      return 'Text';
    } else if (['add', 'subtract', 'multiply', 'divide', 'add_percentage', 'subtract_percentage', 'custom_round', 'number_format'].includes(type)) {
      return 'Number';
    } else if (['date_format'].includes(type)) {
      return 'Date';
    } else if (['currency_conversion', 'unit_conversion'].includes(type)) {
      return 'Conversion';
    } else if (['concatenate', 'combine_fields', 'dynamic_url'].includes(type)) {
      return 'Combining';
    } else if (['conditional_mapping', 'value_mapping', 'color_normalize'].includes(type)) {
      return 'Mapping';
    }
    return 'Other';
  };
  
  // Raggruppa le trasformazioni per categoria
  const groupedTransformations: Record<string, FieldTransformationType[]> = {};
  Object.keys(transformationLabels).forEach((key) => {
    const type = key as FieldTransformationType;
    if (type === 'none') return; // Escludi 'none' dai gruppi
    
    const category = getCategoryForTransformation(type);
    if (!groupedTransformations[category]) {
      groupedTransformations[category] = [];
    }
    groupedTransformations[category].push(type);
  });
  
  // Ordinamento personalizzato delle categorie
  const categoryOrder = ['Text', 'Number', 'Date', 'Conversion', 'Combining', 'Mapping', 'Other'];
  
  const updateParam = (paramName: string, value: any) => {
    onUpdate({
      ...transformation,
      params: {
        ...transformation.params,
        [paramName]: value
      }
    });
  };
  
  // Unità di misura disponibili per la conversione
  const unitConversions = {
    'length': [
      { value: 'in_to_cm', label: 'Inches to Centimeters' },
      { value: 'cm_to_in', label: 'Centimeters to Inches' },
      { value: 'ft_to_cm', label: 'Feet to Centimeters' },
      { value: 'm_to_ft', label: 'Meters to Feet' },
    ],
    'weight': [
      { value: 'lb_to_kg', label: 'Pounds to Kilograms' },
      { value: 'kg_to_lb', label: 'Kilograms to Pounds' },
      { value: 'oz_to_g', label: 'Ounces to Grams' },
      { value: 'g_to_oz', label: 'Grams to Ounces' },
    ]
  };
  
  const renderTransformationParams = () => {
    switch (transformation.type) {
      case 'none':
        return <p className="text-sm text-muted-foreground">Select a transformation type.</p>;
        
      case 'number_format':
        return (
          <div className="space-y-2">
            <div>
              <Label>Decimal Places</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={transformation.params?.decimals || 2}
                onChange={(e) => updateParam('decimals', parseInt(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Decimal Separator</Label>
                <Input
                  type="text"
                  maxLength={1}
                  value={transformation.params?.decimalSeparator || '.'}
                  onChange={(e) => updateParam('decimalSeparator', e.target.value)}
                />
              </div>
              <div>
                <Label>Thousands Separator</Label>
                <Input
                  type="text"
                  maxLength={1}
                  value={transformation.params?.thousandsSeparator || ','}
                  onChange={(e) => updateParam('thousandsSeparator', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
        
      case 'date_format':
        return (
          <div>
            <Label>Date Format</Label>
            <Select
              value={transformation.params?.format || 'yyyy-MM-dd'}
              onValueChange={(value) => updateParam('format', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yyyy-MM-dd">ISO (2023-04-25)</SelectItem>
                <SelectItem value="dd/MM/yyyy">European (25/04/2023)</SelectItem>
                <SelectItem value="MM/dd/yyyy">US (04/25/2023)</SelectItem>
                <SelectItem value="dd MMMM yyyy">Long (25 April 2023)</SelectItem>
                <SelectItem value="MMMM dd, yyyy">Month first (April 25, 2023)</SelectItem>
                <SelectItem value="yyyy-MM-dd'T'HH:mm:ss">ISO with time (2023-04-25T14:30:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'concatenate':
        return (
          <div>
            <Label>Template (use {`{value}`} for the field value)</Label>
            <Input
              type="text"
              value={transformation.params?.template || ''}
              onChange={(e) => updateParam('template', e.target.value)}
              placeholder="Example: Product: {value}"
            />
          </div>
        );
        
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
        return (
          <div>
            <Label>Value</Label>
            <Input
              type="number"
              step="0.01"
              value={transformation.params?.value || '0'}
              onChange={(e) => updateParam('value', e.target.value)}
            />
          </div>
        );
        
      case 'add_percentage':
      case 'subtract_percentage':
        return (
          <div className="flex items-center gap-2">
            <Label className="w-full">Percentage</Label>
            <Input
              type="number"
              step="0.01"
              className="w-24"
              value={transformation.params?.percentage || '0'}
              onChange={(e) => updateParam('percentage', e.target.value)}
            />
            <span>%</span>
          </div>
        );
        
      case 'truncate':
        return (
          <div className="space-y-2">
            <div>
              <Label>Max Length</Label>
              <Input
                type="number"
                min="1"
                value={transformation.params?.maxLength || '100'}
                onChange={(e) => updateParam('maxLength', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ellipsis"
                checked={transformation.params?.ellipsis || false}
                onCheckedChange={(checked) => updateParam('ellipsis', checked)}
              />
              <Label htmlFor="ellipsis">Add ellipsis (...) if truncated</Label>
            </div>
          </div>
        );
        
      case 'replace':
        return (
          <div className="space-y-2">
            <div>
              <Label>Search For</Label>
              <Input
                type="text"
                value={transformation.params?.search || ''}
                onChange={(e) => updateParam('search', e.target.value)}
                placeholder="Text to find"
              />
            </div>
            <div>
              <Label>Replace With</Label>
              <Input
                type="text"
                value={transformation.params?.replace || ''}
                onChange={(e) => updateParam('replace', e.target.value)}
                placeholder="Replacement text"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="regex"
                checked={transformation.params?.regex || false}
                onCheckedChange={(checked) => updateParam('regex', checked)}
              />
              <Label htmlFor="regex">Use regex</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="caseInsensitive"
                checked={transformation.params?.caseInsensitive || false}
                onCheckedChange={(checked) => updateParam('caseInsensitive', checked)}
              />
              <Label htmlFor="caseInsensitive">Case insensitive</Label>
            </div>
          </div>
        );
        
      case 'combine_fields':
        return (
          <div className="space-y-2">
            <div>
              <Label>Fields to combine</Label>
              <Select
                value="select"
                onValueChange={(field) => {
                  if (field === 'select') return;
                  
                  const currentFields = transformation.params?.fields || [];
                  if (!currentFields.includes(field)) {
                    updateParam('fields', [...currentFields, field]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fields to combine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select a field</SelectItem>
                  {availableSourceFields.map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(transformation.params?.fields || []).length > 0 && (
              <div className="space-y-1">
                <Label>Selected fields:</Label>
                <div className="space-y-1">
                  {(transformation.params?.fields || []).map((field: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-md">
                      <span>{field}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const currentFields = [...(transformation.params?.fields || [])];
                          currentFields.splice(idx, 1);
                          updateParam('fields', currentFields);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <Label>Separator</Label>
              <Input
                type="text"
                value={transformation.params?.separator || ' '}
                onChange={(e) => updateParam('separator', e.target.value)}
                placeholder="Space, comma, etc."
              />
            </div>
            
            <div>
              <Label>Template (optional)</Label>
              <Input
                type="text"
                value={transformation.params?.template || ''}
                onChange={(e) => updateParam('template', e.target.value)}
                placeholder="Example: {value} - {field1} - {field2}"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {`{value}`} for the main field and {`{fieldName}`} for other fields
              </p>
            </div>
          </div>
        );
        
      case 'extract_substring':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start Position</Label>
              <Input
                type="number"
                min="0"
                value={transformation.params?.start || '0'}
                onChange={(e) => updateParam('start', e.target.value)}
              />
            </div>
            <div>
              <Label>End Position (optional)</Label>
              <Input
                type="number"
                min="0"
                value={transformation.params?.end || ''}
                onChange={(e) => updateParam('end', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'custom_round':
        return (
          <div className="space-y-2">
            <div>
              <Label>Rounding Type</Label>
              <Select
                value={transformation.params?.type || 'nearest'}
                onValueChange={(value) => updateParam('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rounding type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Nearest</SelectItem>
                  <SelectItem value="ceil">Ceiling (round up)</SelectItem>
                  <SelectItem value="floor">Floor (round down)</SelectItem>
                  <SelectItem value="pricePoint">Price point</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {transformation.params?.type !== 'pricePoint' ? (
              <div>
                <Label>Round to nearest</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={transformation.params?.nearest || '1'}
                  onChange={(e) => updateParam('nearest', e.target.value)}
                  placeholder="1, 0.5, 0.1, etc."
                />
              </div>
            ) : (
              <div>
                <Label>Price ending</Label>
                <Input
                  type="text"
                  value={transformation.params?.ending || '.99'}
                  onChange={(e) => updateParam('ending', e.target.value)}
                  placeholder=".99, .50, etc."
                />
              </div>
            )}
          </div>
        );
        
      case 'unit_conversion':
        return (
          <div className="space-y-2">
            <div>
              <Label>Conversion Category</Label>
              <Select
                value={transformation.params?.type || 'length'}
                onValueChange={(value) => {
                  updateParam('type', value);
                  // Reset the conversion when changing category
                  updateParam('conversion', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="length">Length</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Conversion</Label>
              <Select
                value={transformation.params?.conversion || ''}
                onValueChange={(value) => updateParam('conversion', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select conversion" />
                </SelectTrigger>
                <SelectContent>
                  {(unitConversions[transformation.params?.type as keyof typeof unitConversions] || []).map(
                    (conv) => (
                      <SelectItem key={conv.value} value={conv.value}>
                        {conv.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'conditional_mapping':
        return (
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const conditions = transformation.params?.conditions || [];
                updateParam('conditions', [
                  ...conditions,
                  { operator: 'equals', compareValue: '', result: '' }
                ]);
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Condition
            </Button>
            
            {(transformation.params?.conditions || []).map((condition: any, idx: number) => (
              <div key={idx} className="border rounded-md p-2 space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Condition {idx + 1}</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const conditions = [...(transformation.params?.conditions || [])];
                      conditions.splice(idx, 1);
                      updateParam('conditions', conditions);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => {
                      const conditions = [...(transformation.params?.conditions || [])];
                      conditions[idx].operator = value;
                      updateParam('conditions', conditions);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="notEquals">Not equals</SelectItem>
                      <SelectItem value="greaterThan">Greater than</SelectItem>
                      <SelectItem value="lessThan">Less than</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="startsWith">Starts with</SelectItem>
                      <SelectItem value="endsWith">Ends with</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Value to compare"
                    value={condition.compareValue}
                    onChange={(e) => {
                      const conditions = [...(transformation.params?.conditions || [])];
                      conditions[idx].compareValue = e.target.value;
                      updateParam('conditions', conditions);
                    }}
                  />
                  
                  <Input
                    placeholder="Result"
                    value={condition.result}
                    onChange={(e) => {
                      const conditions = [...(transformation.params?.conditions || [])];
                      conditions[idx].result = e.target.value;
                      updateParam('conditions', conditions);
                    }}
                  />
                </div>
              </div>
            ))}
            
            <div>
              <Label>Default Result (if no conditions match)</Label>
              <Input
                value={transformation.params?.default || ''}
                onChange={(e) => updateParam('default', e.target.value)}
                placeholder="Default value (empty = keep original)"
              />
            </div>
          </div>
        );
        
      case 'color_normalize':
        return (
          <div className="space-y-2">
            <div>
              <Label>Source Language</Label>
              <Select
                value={transformation.params?.language || 'it'}
                onValueChange={(value) => updateParam('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="customMap"
                checked={transformation.params?.useCustomMap || false}
                onCheckedChange={(checked) => {
                  updateParam('useCustomMap', checked);
                  if (checked && !transformation.params?.customMap) {
                    updateParam('customMap', {});
                  }
                }}
              />
              <Label htmlFor="customMap">Use custom color mapping</Label>
            </div>
            
            {transformation.params?.useCustomMap && (
              <div className="space-y-2 border rounded-md p-2">
                <Label>Custom Color Mappings</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Source color"
                    className="text-sm"
                    value={transformation.params?.newMapKey || ''}
                    onChange={(e) => updateParam('newMapKey', e.target.value)}
                  />
                  <div className="flex gap-1">
                    <Input
                      placeholder="Target color"
                      className="text-sm"
                      value={transformation.params?.newMapValue || ''}
                      onChange={(e) => updateParam('newMapValue', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (!transformation.params?.newMapKey) return;
                        
                        const customMap = {
                          ...(transformation.params?.customMap || {}),
                          [transformation.params.newMapKey]: transformation.params.newMapValue || ''
                        };
                        
                        updateParam('customMap', customMap);
                        updateParam('newMapKey', '');
                        updateParam('newMapValue', '');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {Object.entries(transformation.params?.customMap || {}).map(([key, value], idx) => (
                  <div key={idx} className="flex justify-between items-center p-1 border rounded-md text-sm">
                    <div className="flex items-center gap-2">
                      <span>{key}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <span>{value}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const customMap = { ...(transformation.params?.customMap || {}) };
                        delete customMap[key];
                        updateParam('customMap', customMap);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'dynamic_url':
        return (
          <div className="space-y-2">
            <div>
              <Label>Base URL</Label>
              <Input
                type="text"
                value={transformation.params?.baseUrl || ''}
                onChange={(e) => updateParam('baseUrl', e.target.value)}
                placeholder="https://example.com/product"
              />
            </div>
            <div>
              <Label>Parameter Name</Label>
              <Input
                type="text"
                value={transformation.params?.paramName || 'id'}
                onChange={(e) => updateParam('paramName', e.target.value)}
                placeholder="id"
              />
            </div>
            <div>
              <Label>Additional Parameters</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  placeholder="Parameter name"
                  className="text-sm"
                  value={transformation.params?.newParamKey || ''}
                  onChange={(e) => updateParam('newParamKey', e.target.value)}
                />
                <div className="flex gap-1">
                  <Input
                    placeholder="Value"
                    className="text-sm"
                    value={transformation.params?.newParamValue || ''}
                    onChange={(e) => updateParam('newParamValue', e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (!transformation.params?.newParamKey) return;
                      
                      const additionalParams = {
                        ...(transformation.params?.additionalParams || {}),
                        [transformation.params.newParamKey]: transformation.params.newParamValue || ''
                      };
                      
                      updateParam('additionalParams', additionalParams);
                      updateParam('newParamKey', '');
                      updateParam('newParamValue', '');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {Object.entries(transformation.params?.additionalParams || {}).map(([key, value], idx) => (
                <div key={idx} className="flex justify-between items-center p-1 border rounded-md text-sm mt-1">
                  <div className="flex items-center gap-2">
                    <span>{key}</span>
                    <span>=</span>
                    <span>{value}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const additionalParams = { ...(transformation.params?.additionalParams || {}) };
                      delete additionalParams[key];
                      updateParam('additionalParams', additionalParams);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'value_mapping':
        return (
          <div className="space-y-2">
            <div>
              <Label>Value Mappings</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  placeholder="Source value"
                  className="text-sm"
                  value={transformation.params?.newMapKey || ''}
                  onChange={(e) => updateParam('newMapKey', e.target.value)}
                />
                <div className="flex gap-1">
                  <Input
                    placeholder="Target value"
                    className="text-sm"
                    value={transformation.params?.newMapValue || ''}
                    onChange={(e) => updateParam('newMapValue', e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (!transformation.params?.newMapKey) return;
                      
                      const mappings = {
                        ...(transformation.params?.mappings || {}),
                        [transformation.params.newMapKey]: transformation.params.newMapValue || ''
                      };
                      
                      updateParam('mappings', mappings);
                      updateParam('newMapKey', '');
                      updateParam('newMapValue', '');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {Object.entries(transformation.params?.mappings || {}).map(([key, value], idx) => (
                <div key={idx} className="flex justify-between items-center p-1 border rounded-md text-sm mt-1">
                  <div className="flex items-center gap-2">
                    <span>{key}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span>{value}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const mappings = { ...(transformation.params?.mappings || {}) };
                      delete mappings[key];
                      updateParam('mappings', mappings);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="caseSensitive"
                checked={transformation.params?.caseSensitive || false}
                onCheckedChange={(checked) => updateParam('caseSensitive', checked)}
              />
              <Label htmlFor="caseSensitive">Case sensitive mapping</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="keepOriginal"
                checked={transformation.params?.keepOriginal !== false}
                onCheckedChange={(checked) => updateParam('keepOriginal', checked)}
              />
              <Label htmlFor="keepOriginal">Keep original if not mapped</Label>
            </div>
          </div>
        );
        
      case 'currency_conversion':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>From Currency</Label>
                <Select
                  value={transformation.params?.from || 'EUR'}
                  onValueChange={(value) => updateParam('from', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Source currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'].map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>To Currency</Label>
                <Select
                  value={transformation.params?.to || 'USD'}
                  onValueChange={(value) => updateParam('to', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Target currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'].map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="useOfficial"
                checked={transformation.params?.useOfficial || false}
                disabled={!isSubscriptionActive}
                onCheckedChange={(checked) => {
                  if (!isSubscriptionActive && checked) {
                    // Se l'utente tenta di usare i tassi ufficiali senza abbonamento
                    // mostriamo un messaggio e non permettiamo l'attivazione
                    return;
                  }
                  updateParam('useOfficial', checked);
                }}
              />
              <Label 
                htmlFor="useOfficial" 
                className={!isSubscriptionActive ? "text-muted-foreground flex items-center gap-1" : ""}
              >
                Use official exchange rates
                {!isSubscriptionActive && <Lock className="h-3 w-3 text-amber-500" />}
              </Label>
            </div>
            
            {!transformation.params?.useOfficial && (
              <div>
                <Label>Manual Exchange Rate</Label>
                <Input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={transformation.params?.manualRate || '1'}
                  onChange={(e) => updateParam('manualRate', e.target.value)}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="formatCurrency"
                checked={transformation.params?.format || false}
                onCheckedChange={(checked) => updateParam('format', checked)}
              />
              <Label htmlFor="formatCurrency">Format result with decimals</Label>
            </div>
            
            {transformation.params?.format && (
              <div>
                <Label>Decimal Places</Label>
                <Input
                  type="number"
                  min="0"
                  max="6"
                  value={transformation.params?.decimals || '2'}
                  onChange={(e) => updateParam('decimals', e.target.value)}
                />
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const ChevronRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>Type</Label>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <Select
        value={transformation.type}
        onValueChange={(value) => {
          // Se il tipo è cambiato, azzera i parametri a meno che il nuovo tipo è dello stesso gruppo
          const newType = value as FieldTransformationType;
          const currentCategory = getCategoryForTransformation(transformation.type);
          const newCategory = getCategoryForTransformation(newType);
          
          // Resetta i params solo se la categoria è cambiata
          onUpdate({
            type: newType,
            params: currentCategory === newCategory ? transformation.params : {}
          });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select transformation type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No transformation</SelectItem>
          
          {categoryOrder.map(category => (
            <React.Fragment key={category}>
              <SelectItem value={`__${category}__`} disabled>
                -- {category} --
              </SelectItem>
              {groupedTransformations[category]?.map(type => (
                <SelectItem key={type} value={type}>
                  {transformationLabels[type]}
                </SelectItem>
              ))}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
      
      <div className="mt-2">
        {renderTransformationParams()}
      </div>
    </div>
  );
};

export default TransformationEditor;
