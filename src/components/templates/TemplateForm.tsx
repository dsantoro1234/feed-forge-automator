
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FeedTemplate } from '@/types';
import { useTemplates } from '@/contexts/TemplateContext';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Template name is required' }),
  description: z.string(),
  type: z.enum(['google', 'meta', 'trovaprezzi']),
  isActive: z.boolean().default(true),
});

interface TemplateFormProps {
  existingTemplate?: FeedTemplate;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ existingTemplate }) => {
  const { createTemplate, updateTemplate } = useTemplates();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: existingTemplate ? {
      name: existingTemplate.name,
      description: existingTemplate.description,
      type: existingTemplate.type,
      isActive: existingTemplate.isActive,
    } : {
      name: '',
      description: '',
      type: 'google',
      isActive: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (existingTemplate) {
      updateTemplate(existingTemplate.id, values);
      navigate(`/templates/${existingTemplate.id}`);
    } else {
      createTemplate({
        name: values.name,
        description: values.description,
        type: values.type,
        isActive: values.isActive,
        mappings: []
      });
      navigate('/templates');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Google Shopping Feed" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this feed template
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description of this feed template" {...field} />
              </FormControl>
              <FormDescription>
                Optional details about this template
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feed Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feed type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="google">Google Shopping (XML)</SelectItem>
                    <SelectItem value="meta">Meta / Facebook (CSV)</SelectItem>
                    <SelectItem value="trovaprezzi">Trovaprezzi (CSV)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The format and destination of this feed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-auto">
                <div className="space-y-0.5">
                  <FormLabel>Active Template</FormLabel>
                  <FormDescription>
                    Enable/disable this template
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
          <Button type="button" variant="outline" onClick={() => navigate('/templates')}>
            Cancel
          </Button>
          <Button type="submit">
            {existingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TemplateForm;
