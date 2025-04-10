
import React, { useState } from 'react';
import { FieldMapping, FieldTransformation } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, ArrowRight, Plus, Edit, Info } from 'lucide-react';
import { useTemplates } from '@/contexts/TemplateContext';
import { useProducts } from '@/contexts/ProductContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TransformationEditor from './TransformationEditor';

interface FieldMappingCardProps {
  templateId: string;
  mapping: FieldMapping;
}

const FieldMappingCard: React.FC<FieldMappingCardProps> = ({ templateId, mapping }) => {
  const { updateFieldMapping, deleteFieldMapping } = useTemplates();
  const { getProductFields } = useProducts();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [sourceField, setSourceField] = useState(mapping.sourceField);
  const [targetField, setTargetField] = useState(mapping.targetField);
  const [isRequired, setIsRequired] = useState(mapping.isRequired);
  const [defaultValue, setDefaultValue] = useState(mapping.defaultValue || '');
  const availableSourceFields = getProductFields();
  
  const handleSave = () => {
    updateFieldMapping(templateId, mapping.id, {
      sourceField,
      targetField,
      isRequired,
      defaultValue: defaultValue || undefined
    });
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    deleteFieldMapping(templateId, mapping.id);
  };
  
  const handleAddTransformation = () => {
    // Utilizziamo 'replace' come tipo predefinito invece di 'none'
    const newTransformations = [...mapping.transformations, { type: 'replace' } as FieldTransformation];
    updateFieldMapping(templateId, mapping.id, { transformations: newTransformations });
  };
  
  const handleUpdateTransformation = (index: number, transformation: FieldTransformation) => {
    const newTransformations = [...mapping.transformations];
    newTransformations[index] = transformation;
    updateFieldMapping(templateId, mapping.id, { transformations: newTransformations });
  };
  
  const handleRemoveTransformation = (index: number) => {
    const newTransformations = [...mapping.transformations];
    newTransformations.splice(index, 1);
    updateFieldMapping(templateId, mapping.id, { transformations: newTransformations });
  };
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sourceField">Source Field</Label>
                <Select
                  value={sourceField}
                  onValueChange={setSourceField}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field from database" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSourceFields.map(f => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetField">Target Field</Label>
                <Input
                  id="targetField"
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value)}
                  placeholder="id"
                  readOnly={true} // Don't allow changing the target field
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultValue">Default Value</Label>
                <Input
                  id="defaultValue"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="Default value if source is empty"
                />
              </div>
              <div className="flex items-center gap-2 h-full">
                <Label htmlFor="isRequired" className="cursor-pointer">Required Field</Label>
                <Switch
                  id="isRequired"
                  checked={isRequired}
                  onCheckedChange={setIsRequired}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Mapping
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">{mapping.sourceField || '(not mapped)'}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{mapping.targetField}</span>
                {mapping.isRequired && (
                  <Badge variant="secondary" className="ml-2 bg-red-50 text-red-700 border-red-200">Required</Badge>
                )}
                {mapping.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{mapping.description}</p>
                        {mapping.example && (
                          <p className="text-xs text-muted-foreground mt-1">Example: {mapping.example}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            
            {mapping.defaultValue && (
              <div className="text-sm text-muted-foreground mb-2">
                Default: <span className="font-medium">{mapping.defaultValue}</span>
              </div>
            )}
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Transformations</Label>
                <Button variant="outline" size="sm" onClick={handleAddTransformation}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              
              {mapping.transformations.length === 0 ? (
                <div className="text-sm text-muted-foreground italic">No transformations</div>
              ) : (
                <div className="space-y-2">
                  {mapping.transformations.map((transformation, index) => (
                    <div key={index} className="border rounded-md p-3 bg-muted/10">
                      <TransformationEditor
                        transformation={transformation}
                        onUpdate={(newTransformation) => handleUpdateTransformation(index, newTransformation)}
                        onDelete={() => handleRemoveTransformation(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FieldMappingCard;
