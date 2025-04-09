
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfig } from '@/contexts/ConfigContext';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Client name is required' }),
  logo: z.string().url().optional(),
  scheduleFrequency: z.enum(['hourly', 'daily', 'weekly']),
  scheduleDay: z.number().min(0).max(6).optional(),
  scheduleHour: z.number().min(0).max(23),
});

const ClientConfigForm = () => {
  const { clientConfig, updateClientConfig } = useConfig();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: clientConfig.name,
      logo: clientConfig.logo,
      scheduleFrequency: clientConfig.scheduleFrequency,
      scheduleDay: clientConfig.scheduleDay,
      scheduleHour: clientConfig.scheduleHour,
    },
  });

  const watchFrequency = form.watch('scheduleFrequency');

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateClientConfig(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Store Name" {...field} />
              </FormControl>
              <FormDescription>
                The name of your store or business
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                URL to your company logo (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="scheduleFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How often to generate feeds
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {watchFrequency === 'weekly' && (
            <FormField
              control={form.control}
              name="scheduleDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Day of week for weekly schedule
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="scheduleHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hour of Day</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hour" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Hour to generate feeds (24h format)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit">Save Client Configuration</Button>
      </form>
    </Form>
  );
};

export default ClientConfigForm;
