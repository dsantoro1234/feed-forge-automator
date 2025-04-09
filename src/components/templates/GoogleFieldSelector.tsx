
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { useTemplates } from '@/contexts/TemplateContext';

interface GoogleFieldSelectorProps {
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
}

const GoogleFieldSelector: React.FC<GoogleFieldSelectorProps> = ({ 
  templateId, 
  isOpen, 
  onClose 
}) => {
  const { getGoogleShoppingFields, getTemplateById, addSelectedGoogleFields } = useTemplates();
  const template = getTemplateById(templateId);
  const googleFields = getGoogleShoppingFields();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Filter fields based on search term
  const filteredFields = googleFields.filter(field => 
    field.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group fields by required vs optional
  const requiredFields = filteredFields.filter(field => field.required);
  const optionalFields = filteredFields.filter(field => !field.required);

  // Check if a field is already mapped in the template
  const isFieldMapped = (fieldName: string) => {
    if (!template) return false;
    return template.mappings.some(mapping => mapping.targetField === fieldName);
  };

  const handleFieldToggle = (fieldName: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldName) 
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const handleSelectAll = () => {
    const allUnmappedFields = filteredFields
      .filter(field => !isFieldMapped(field.field))
      .map(field => field.field);
      
    setSelectedFields(allUnmappedFields);
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
  };

  const handleAddFields = () => {
    if (selectedFields.length === 0) return;
    
    addSelectedGoogleFields(templateId, selectedFields);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Seleziona Campi Google Shopping</DialogTitle>
          <DialogDescription>
            Seleziona i campi Google Shopping da aggiungere al template
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca campo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Seleziona Tutti
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            Deseleziona Tutti
          </Button>
          <div className="ml-auto text-sm text-muted-foreground">
            {selectedFields.length} campi selezionati
          </div>
        </div>

        <ScrollArea className="h-[50vh] pr-4">
          {/* Required Fields */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-red-600">Campi Obbligatori</h3>
            <div className="space-y-2">
              {requiredFields.map(field => {
                const isMapped = isFieldMapped(field.field);
                return (
                  <div 
                    key={field.field} 
                    className={`flex items-start space-x-3 rounded-md border p-3 ${isMapped ? 'bg-muted' : ''}`}
                  >
                    {!isMapped && (
                      <Checkbox
                        id={`field-${field.field}`}
                        checked={selectedFields.includes(field.field)}
                        onCheckedChange={() => handleFieldToggle(field.field)}
                        disabled={isMapped}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label 
                          htmlFor={`field-${field.field}`}
                          className="font-medium cursor-pointer"
                        >
                          {field.field}
                        </label>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Required
                        </Badge>
                        {isMapped && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Già mappato
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {field.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Esempio: {field.example}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Fields */}
          <div>
            <h3 className="font-medium mb-2">Campi Opzionali</h3>
            <div className="space-y-2">
              {optionalFields.map(field => {
                const isMapped = isFieldMapped(field.field);
                return (
                  <div 
                    key={field.field} 
                    className={`flex items-start space-x-3 rounded-md border p-3 ${isMapped ? 'bg-muted' : ''}`}
                  >
                    {!isMapped && (
                      <Checkbox
                        id={`field-${field.field}`}
                        checked={selectedFields.includes(field.field)}
                        onCheckedChange={() => handleFieldToggle(field.field)}
                        disabled={isMapped}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label 
                          htmlFor={`field-${field.field}`}
                          className="font-medium cursor-pointer"
                        >
                          {field.field}
                        </label>
                        {isMapped && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Già mappato
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {field.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Esempio: {field.example}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleAddFields} disabled={selectedFields.length === 0}>
            Aggiungi {selectedFields.length} Campi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleFieldSelector;
