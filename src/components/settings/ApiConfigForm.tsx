
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
import { useConfig } from '@/contexts/ConfigContext';

const formSchema = z.object({
  endpoint: z.string().url({ message: 'Please enter a valid URL' }),
  apiKey: z.string().min(1, { message: 'API key is required' }),
  tableName: z.string().min(1, { message: 'Table name is required' }),
});

const ApiConfigForm = () => {
  const { apiConfig, updateApiConfig } = useConfig();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: apiConfig.endpoint,
      apiKey: apiConfig.apiKey,
      tableName: apiConfig.tableName,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateApiConfig(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="endpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xano API Endpoint</FormLabel>
              <FormControl>
                <Input placeholder="https://api.example.com/products" {...field} />
              </FormControl>
              <FormDescription>
                The base URL of your Xano API endpoint
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Your Xano API key" {...field} />
              </FormControl>
              <FormDescription>
                The authentication key for your Xano API
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tableName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table Name</FormLabel>
              <FormControl>
                <Input placeholder="products" {...field} />
              </FormControl>
              <FormDescription>
                The name of the table containing your product data
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Save API Configuration</Button>
      </form>
    </Form>
  );
};

export default ApiConfigForm;
