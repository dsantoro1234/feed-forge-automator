
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
  const { addFieldMapping } = useTemplates();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceField: '',
      targetField: '',
      isRequired: false,
      defaultValue: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addFieldMapping(templateId, {
      ...values,
      transformations: []
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
                  <Input placeholder="id" {...field} />
                </FormControl>
                <FormDescription>
                  The field name in the feed output
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
