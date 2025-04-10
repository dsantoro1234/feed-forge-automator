
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FieldTransformation } from '@/types';
import { useExchangeRates } from '@/contexts/ExchangeRateContext';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Lock } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TransformationEditorProps {
  transformation: FieldTransformation;
  onUpdate: (transformation: FieldTransformation) => void;
  onDelete: () => void;
}

const TransformationEditor: React.FC<TransformationEditorProps> = ({
  transformation,
  onUpdate,
  onDelete,
}) => {
  const { rates, isPremium } = useExchangeRates();
  const [type, setType] = useState<string>(transformation.type);

  // Update local type when prop changes
  useEffect(() => {
    setType(transformation.type);
  }, [transformation.type]);

  const handleTypeChange = (value: string) => {
    setType(value);
    onUpdate({ ...transformation, type: value as any });
  };

  const renderTransformationOptions = () => {
    switch (type) {
      case 'replace':
        return (
          <div className="space-y-2">
            <div>
              <Label htmlFor="find">Find</Label>
              <Input
                id="find"
                value={transformation.find || ''}
                onChange={(e) =>
                  onUpdate({ ...transformation, find: e.target.value })
                }
                placeholder="Text to replace"
              />
            </div>
            <div>
              <Label htmlFor="replace">Replace with</Label>
              <Input
                id="replace"
                value={transformation.replace || ''}
                onChange={(e) =>
                  onUpdate({ ...transformation, replace: e.target.value })
                }
                placeholder="Replacement text"
              />
            </div>
          </div>
        );

      case 'append':
      case 'prepend':
        return (
          <div>
            <Label htmlFor="value">Value to {type}</Label>
            <Input
              id="value"
              value={transformation.value || ''}
              onChange={(e) =>
                onUpdate({ ...transformation, value: e.target.value })
              }
              placeholder={`Text to ${type}`}
            />
          </div>
        );

      case 'number_format':
        return (
          <div>
            <Label htmlFor="decimals">Decimal places</Label>
            <Input
              id="decimals"
              type="number"
              min="0"
              max="10"
              value={transformation.decimals || 2}
              onChange={(e) =>
                onUpdate({
                  ...transformation,
                  decimals: parseInt(e.target.value),
                })
              }
            />
          </div>
        );

      case 'substring':
        return (
          <div className="space-y-2">
            <div>
              <Label htmlFor="start">Start index</Label>
              <Input
                id="start"
                type="number"
                min="0"
                value={transformation.start || 0}
                onChange={(e) =>
                  onUpdate({
                    ...transformation,
                    start: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="end">End index (optional)</Label>
              <Input
                id="end"
                type="number"
                min="0"
                value={transformation.end !== undefined ? transformation.end : ''}
                onChange={(e) =>
                  onUpdate({
                    ...transformation,
                    end: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>
        );

      case 'currency_conversion':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="fromCurrency">From Currency</Label>
                <Select
                  value={transformation.fromCurrency || 'USD'}
                  onValueChange={(value) =>
                    onUpdate({ ...transformation, fromCurrency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="toCurrency">To Currency</Label>
                <Select
                  value={transformation.toCurrency || 'EUR'}
                  onValueChange={(value) =>
                    onUpdate({ ...transformation, toCurrency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="rate">Conversion Rate</Label>
                {!isPremium && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="cursor-help">
                          <Lock className="h-3 w-3 mr-1" /> Premium
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Automatic rates are a premium feature</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <div className="flex gap-2 items-center">
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={transformation.rate || 1}
                  onChange={(e) =>
                    onUpdate({
                      ...transformation,
                      rate: parseFloat(e.target.value),
                    })
                  }
                />
                
                {isPremium && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const fromCurr = transformation.fromCurrency || 'USD';
                            const toCurr = transformation.toCurrency || 'EUR';
                            const rateKey = `${fromCurr}_${toCurr}`;
                            const currentRate = rates[rateKey] || 1;
                            
                            onUpdate({
                              ...transformation,
                              rate: currentRate,
                            });
                          }}
                        >
                          <CreditCard className="h-4 w-4 mr-1" /> Use Current Rate
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Use the latest exchange rate</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border rounded-md p-4 space-y-4 bg-card">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Label htmlFor="transformation-type">Transformation Type</Label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="replace">Replace Text</SelectItem>
              <SelectItem value="append">Append</SelectItem>
              <SelectItem value="prepend">Prepend</SelectItem>
              <SelectItem value="lowercase">Convert to Lowercase</SelectItem>
              <SelectItem value="uppercase">Convert to Uppercase</SelectItem>
              <SelectItem value="number_format">Format Number</SelectItem>
              <SelectItem value="substring">Substring</SelectItem>
              <SelectItem value="currency_conversion">Currency Conversion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-shrink-0 self-end">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Remove
          </Button>
        </div>
      </div>

      {renderTransformationOptions()}
    </div>
  );
};

export default TransformationEditor;
