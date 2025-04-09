
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTemplates } from '@/contexts/TemplateContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FeedTemplate } from '@/types';

const formSchema = z.object({
  sourceField: z.string().min(1, { message: 'Source field is required' }),
  targetField: z.string().min(1, { message: 'Target field is required' }),
  isRequired: z.boolean().default(false),
  defaultValue: z.string().optional(),
});

interface AddFieldMappingFormProps {
  templateId: string;
  onComplete: () => void;
}

const AddFieldMappingForm: React.FC<AddFieldMappingFormProps> = ({ templateId, onComplete }) => {
  const { addFieldMapping, getTemplateById, getGoogleShoppingFields } = useTemplates();
  const template = getTemplateById(templateId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceField: '',
      targetField: '',
      isRequired: false,
      defaultValue: '',
    },
  });

  // Get predefined fields based on template type
  const getPredefinedFields = () => {
    if (!template) return [];
    
    if (template.type === 'google') {
      return getGoogleShoppingFields();
    }
    
    // Add support for other feed types here
    return [];
  };
  
  const predefinedFields = getPredefinedFields();
  
  // Get field info for the selected target field
  const getFieldInfo = (fieldName: string) => {
    if (!template) return null;
    
    if (template.type === 'google') {
      return predefinedFields.find(f => f.field === fieldName);
    }
    
    return null;
  };
  
  const selectedField = form.watch('targetField');
  const fieldInfo = getFieldInfo(selectedField);
  
  // Update required status when selecting a predefined field
  React.useEffect(() => {
    if (fieldInfo) {
      form.setValue('isRequired', fieldInfo.required);
    }
  }, [selectedField, fieldInfo, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Get extra field information if available
    const fieldInfo = getFieldInfo(values.targetField);
    
    addFieldMapping(templateId, {
      sourceField: values.sourceField,
      targetField: values.targetField,
      isRequired: values.isRequired,
      defaultValue: values.defaultValue || '',
      transformations: [],
      description: fieldInfo?.description,
      example: fieldInfo?.example
    });
    
    form.reset();
    onComplete();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sourceField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Field</FormLabel>
                <FormControl>
                  <Input placeholder="product_id" {...field} />
                </FormControl>
                <FormDescription>
                  The field name in your data source
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="targetField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Field</FormLabel>
                <FormControl>
                  {template?.type === 'google' && predefinedFields.length > 0 ? (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a field" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedFields.map(f => (
                          <SelectItem key={f.field} value={f.field}>
                            {f.field} {f.required && <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">Required</Badge>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input placeholder="id" {...field} />
                  )}
                </FormControl>
                <FormDescription>
                  {fieldInfo ? (
                    <span>
                      {fieldInfo.description}
                      <br />
                      <span className="text-xs text-muted-foreground">Example: {fieldInfo.example}</span>
                    </span>
                  ) : (
                    "The field name in the feed output"
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defaultValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Value</FormLabel>
                <FormControl>
                  <Input placeholder="Default value if source is empty" {...field} />
                </FormControl>
                <FormDescription>
                  Optional fallback if source field is empty
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Required Field</FormLabel>
                  <FormDescription>
                    Mark if this field is required in the feed
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit">Add Field Mapping</Button>
        </div>
      </form>
    </Form>
  );
};

export default AddFieldMappingForm;
