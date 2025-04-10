
import React, { useState } from 'react';
import { FieldTransformation, FieldTransformationType } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useExchangeRates } from '@/contexts/ExchangeRateContext';

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
  const { rates, isPremium } = useExchangeRates();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Utility function to create a new transformation with updated properties
  const updateTransformation = (updates: Partial<FieldTransformation>) => {
    onUpdate({
      ...transformation,
      ...updates,
    });
  };
  
  // Utility to update params
  const updateParams = (paramUpdates: Record<string, any>) => {
    onUpdate({
      ...transformation,
      params: {
        ...(transformation.params || {}),
        ...paramUpdates
      }
    });
  };
  
  // Render different controls based on transformation type
  const renderTransformationControls = () => {
    const type = transformation.type;
    
    if (type === 'none') {
      return <p className="text-sm text-muted-foreground">Select a transformation type</p>;
    }
    
    switch (type) {
      case 'uppercase':
      case 'lowercase':
      case 'capitalize':
      case 'trim':
      case 'remove_html':
        // These transformations don't need additional parameters
        return null;
        
      case 'number_format':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="decimals">Decimal Places</Label>
                <Input
                  id="decimals"
                  type="number"
                  min="0"
                  max="10"
                  value={transformation.params?.decimals || 2}
                  onChange={(e) => updateParams({ decimals: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="decimalSeparator">Decimal Separator</Label>
                <Input
                  id="decimalSeparator"
                  value={transformation.params?.decimalSeparator || '.'}
                  onChange={(e) => updateParams({ decimalSeparator: e.target.value })}
                  maxLength={1}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="thousandsSeparator">Thousands Separator</Label>
              <Input
                id="thousandsSeparator"
                value={transformation.params?.thousandsSeparator || ','}
                onChange={(e) => updateParams({ thousandsSeparator: e.target.value })}
                maxLength={1}
              />
            </div>
          </div>
        );
        
      case 'date_format':
        return (
          <div>
            <Label htmlFor="format">Date Format</Label>
            <Select
              value={transformation.params?.format || 'yyyy-MM-dd'}
              onValueChange={(value) => updateParams({ format: value })}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yyyy-MM-dd">ISO (yyyy-MM-dd)</SelectItem>
                <SelectItem value="dd/MM/yyyy">European (dd/MM/yyyy)</SelectItem>
                <SelectItem value="MM/dd/yyyy">US (MM/dd/yyyy)</SelectItem>
                <SelectItem value="yyyy-MM-dd HH:mm:ss">Full ISO (yyyy-MM-dd HH:mm:ss)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'concatenate':
        return (
          <div>
            <Label htmlFor="template">Template</Label>
            <Input
              id="template"
              value={transformation.params?.template || '{value}'}
              onChange={(e) => updateParams({ template: e.target.value })}
              placeholder="{value} suffix"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{value}'} to insert the field value
            </p>
          </div>
        );
        
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
        return (
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              step="any"
              value={transformation.params?.value || 0}
              onChange={(e) => updateParams({ value: parseFloat(e.target.value) })}
            />
          </div>
        );
        
      case 'add_percentage':
      case 'subtract_percentage':
        return (
          <div>
            <Label htmlFor="percentage">Percentage (%)</Label>
            <Input
              id="percentage"
              type="number"
              step="any"
              value={transformation.params?.percentage || 0}
              onChange={(e) => updateParams({ percentage: parseFloat(e.target.value) })}
            />
          </div>
        );
        
      case 'truncate':
        return (
          <div className="space-y-2">
            <div>
              <Label htmlFor="maxLength">Max Length</Label>
              <Input
                id="maxLength"
                type="number"
                min="1"
                value={transformation.params?.maxLength || 100}
                onChange={(e) => updateParams({ maxLength: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ellipsis"
                checked={transformation.params?.ellipsis || false}
                onCheckedChange={(checked) => updateParams({ ellipsis: checked })}
              />
              <Label htmlFor="ellipsis">Add ellipsis (...) if truncated</Label>
            </div>
          </div>
        );
        
      case 'replace':
        return (
          <div className="space-y-2">
            <div>
              <Label htmlFor="search">Search for</Label>
              <Input
                id="search"
                value={transformation.params?.search || ''}
                onChange={(e) => updateParams({ search: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="replace">Replace with</Label>
              <Input
                id="replace"
                value={transformation.params?.replace || ''}
                onChange={(e) => updateParams({ replace: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="regex"
                checked={transformation.params?.regex || false}
                onCheckedChange={(checked) => updateParams({ regex: checked })}
              />
              <Label htmlFor="regex">Use regular expressions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="caseInsensitive"
                checked={transformation.params?.caseInsensitive || false}
                onCheckedChange={(checked) => updateParams({ caseInsensitive: checked })}
              />
              <Label htmlFor="caseInsensitive">Case insensitive</Label>
            </div>
          </div>
        );
        
      case 'extract_substring':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="start">Start Index</Label>
              <Input
                id="start"
                type="number"
                min="0"
                value={transformation.params?.start || 0}
                onChange={(e) => updateParams({ start: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="end">End Index (optional)</Label>
              <Input
                id="end"
                type="number"
                min="0"
                value={transformation.params?.end || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateParams({ end: val ? parseInt(val) : undefined });
                }}
              />
            </div>
          </div>
        );
        
      case 'custom_round':
        return (
          <div className="space-y-2">
            <div>
              <Label htmlFor="type">Rounding Type</Label>
              <Select
                value={transformation.params?.type || 'nearest'}
                onValueChange={(value) => updateParams({ type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select rounding type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Round to nearest</SelectItem>
                  <SelectItem value="ceil">Round up (ceiling)</SelectItem>
                  <SelectItem value="floor">Round down (floor)</SelectItem>
                  <SelectItem value="pricePoint">Price point (e.g., .99)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {transformation.params?.type === 'pricePoint' ? (
              <div>
                <Label htmlFor="ending">Price Ending</Label>
                <Input
                  id="ending"
                  value={transformation.params?.ending || '.99'}
                  onChange={(e) => updateParams({ ending: e.target.value })}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="nearest">Nearest Value</Label>
                <Input
                  id="nearest"
                  type="number"
                  step="any"
                  value={transformation.params?.nearest || 1}
                  onChange={(e) => updateParams({ nearest: parseFloat(e.target.value) })}
                />
              </div>
            )}
          </div>
        );
        
      case 'unit_conversion':
        return (
          <div>
            <Label htmlFor="conversion">Conversion Type</Label>
            <Select
              value={transformation.params?.conversion || 'in_to_cm'}
              onValueChange={(value) => updateParams({ conversion: value })}
            >
              <SelectTrigger id="conversion">
                <SelectValue placeholder="Select conversion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_to_cm">Inches to Centimeters</SelectItem>
                <SelectItem value="cm_to_in">Centimeters to Inches</SelectItem>
                <SelectItem value="ft_to_cm">Feet to Centimeters</SelectItem>
                <SelectItem value="m_to_ft">Meters to Feet</SelectItem>
                <SelectItem value="lb_to_kg">Pounds to Kilograms</SelectItem>
                <SelectItem value="kg_to_lb">Kilograms to Pounds</SelectItem>
                <SelectItem value="oz_to_g">Ounces to Grams</SelectItem>
                <SelectItem value="g_to_oz">Grams to Ounces</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'color_normalize':
        return (
          <div className="space-y-2">
            <div>
              <Label htmlFor="language">Source Language</Label>
              <Select
                value={transformation.params?.language || 'it'}
                onValueChange={(value) => updateParams({ language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="useCustomMap"
                checked={transformation.params?.useCustomMap || false}
                onCheckedChange={(checked) => updateParams({ useCustomMap: checked })}
              />
              <Label htmlFor="useCustomMap">Use custom color mappings</Label>
            </div>
            
            {transformation.params?.useCustomMap && (
              <div>
                <Label>Custom Mappings (not implemented in UI yet)</Label>
                <p className="text-xs text-muted-foreground">
                  In a real app, this would allow defining custom color mappings
                </p>
              </div>
            )}
          </div>
        );
        
      case 'dynamic_url':
        return (
          <div className="space-y-2">
            <div>
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={transformation.params?.baseUrl || ''}
                onChange={(e) => updateParams({ baseUrl: e.target.value })}
                placeholder="https://example.com/product"
              />
            </div>
            <div>
              <Label htmlFor="paramName">Parameter Name</Label>
              <Input
                id="paramName"
                value={transformation.params?.paramName || 'id'}
                onChange={(e) => updateParams({ paramName: e.target.value })}
              />
            </div>
          </div>
        );
        
      case 'currency_conversion':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="from">From Currency</Label>
                <Select
                  value={transformation.params?.from || 'EUR'}
                  onValueChange={(value) => updateParams({ from: value })}
                >
                  <SelectTrigger id="from">
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="to">To Currency</Label>
                <Select
                  value={transformation.params?.to || 'USD'}
                  onValueChange={(value) => updateParams({ to: value })}
                >
                  <SelectTrigger id="to">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="useOfficial"
                checked={transformation.params?.useOfficial || false}
                disabled={!isPremium}
                onCheckedChange={(checked) => updateParams({ useOfficial: checked })}
              />
              <div>
                <Label htmlFor="useOfficial" className={!isPremium ? "text-muted-foreground" : ""}>
                  Use official exchange rates {!isPremium && "(Premium feature)"}
                </Label>
                {!isPremium && (
                  <p className="text-xs text-muted-foreground">
                    Upgrade to premium to use up-to-date exchange rates
                  </p>
                )}
              </div>
            </div>
            
            {!transformation.params?.useOfficial && (
              <div>
                <Label htmlFor="manualRate">Manual Exchange Rate</Label>
                <Input
                  id="manualRate"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={transformation.params?.manualRate || 1}
                  onChange={(e) => updateParams({ manualRate: parseFloat(e.target.value) })}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="format"
                checked={transformation.params?.format || false}
                onCheckedChange={(checked) => updateParams({ format: checked })}
              />
              <Label htmlFor="format">Format result</Label>
            </div>
            
            {transformation.params?.format && (
              <div>
                <Label htmlFor="decimals">Decimal Places</Label>
                <Input
                  id="decimals"
                  type="number"
                  min="0"
                  max="10"
                  value={transformation.params?.decimals || 2}
                  onChange={(e) => updateParams({ decimals: parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>
        );
        
      case 'combine_fields':
      case 'conditional_mapping':
      case 'value_mapping':
        return (
          <div>
            <p className="text-sm text-muted-foreground">
              This transformation requires more complex configuration and is not fully implemented in the UI.
              In a complete application, this would include fields for adding mappings or conditions.
            </p>
          </div>
        );
        
      default:
        return <p className="text-sm text-muted-foreground">No parameters needed</p>;
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label htmlFor="transformation-type">Transformation Type</Label>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      
      <Select
        value={transformation.type}
        onValueChange={(value) => updateTransformation({ type: value as FieldTransformationType })}
      >
        <SelectTrigger id="transformation-type">
          <SelectValue placeholder="Select transformation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="uppercase">Convert to UPPERCASE</SelectItem>
          <SelectItem value="lowercase">Convert to lowercase</SelectItem>
          <SelectItem value="capitalize">Capitalize Words</SelectItem>
          <SelectItem value="trim">Trim Whitespace</SelectItem>
          <SelectItem value="number_format">Format Number</SelectItem>
          <SelectItem value="date_format">Format Date</SelectItem>
          <SelectItem value="concatenate">Concatenate Text</SelectItem>
          <SelectItem value="add">Add Value</SelectItem>
          <SelectItem value="subtract">Subtract Value</SelectItem>
          <SelectItem value="multiply">Multiply by Value</SelectItem>
          <SelectItem value="divide">Divide by Value</SelectItem>
          <SelectItem value="add_percentage">Add Percentage</SelectItem>
          <SelectItem value="subtract_percentage">Subtract Percentage</SelectItem>
          <SelectItem value="truncate">Truncate Text</SelectItem>
          <SelectItem value="replace">Find and Replace</SelectItem>
          <SelectItem value="combine_fields">Combine Multiple Fields</SelectItem>
          <SelectItem value="extract_substring">Extract Substring</SelectItem>
          <SelectItem value="custom_round">Custom Rounding</SelectItem>
          <SelectItem value="unit_conversion">Unit Conversion</SelectItem>
          <SelectItem value="conditional_mapping">Conditional Mapping</SelectItem>
          <SelectItem value="color_normalize">Normalize Color Names</SelectItem>
          <SelectItem value="dynamic_url">Create Dynamic URL</SelectItem>
          <SelectItem value="remove_html">Remove HTML Tags</SelectItem>
          <SelectItem value="value_mapping">Value Mapping</SelectItem>
          <SelectItem value="currency_conversion">Currency Conversion</SelectItem>
        </SelectContent>
      </Select>
      
      {renderTransformationControls()}
    </div>
  );
};

export default TransformationEditor;
