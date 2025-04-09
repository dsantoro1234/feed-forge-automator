
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiConfigForm from '@/components/settings/ApiConfigForm';
import ClientConfigForm from '@/components/settings/ClientConfigForm';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="api">
        <TabsList>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="client">Client Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Xano API Configuration</CardTitle>
              <CardDescription>
                Configure your Xano API connection for product data retrieval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiConfigForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="client" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Settings</CardTitle>
              <CardDescription>
                Configure client information and feed generation schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientConfigForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
