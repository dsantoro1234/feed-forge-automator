
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemplates } from '@/contexts/TemplateContext';
import { useFeedHistory } from '@/contexts/FeedHistoryContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateCard from '@/components/dashboard/TemplateCard';
import HistoryTable from '@/components/dashboard/HistoryTable';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, Clock, FileCode, Plus } from 'lucide-react';

const Dashboard = () => {
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { history, isLoading: historyLoading } = useFeedHistory();
  
  const activeTemplates = templates.filter(t => t.isActive);
  const inactiveTemplates = templates.filter(t => !t.isActive);
  
  const recentHistory = [...history].sort((a, b) => {
    return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
  }).slice(0, 5);
  
  const successCount = history.filter(h => h.status === 'success').length;
  const errorCount = history.filter(h => h.status === 'error').length;
  const pendingCount = 0; // Would be implemented with a real scheduling system
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            New Feed Template
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileCode className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-3xl font-bold">{activeTemplates.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful Feeds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-3xl font-bold">{successCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Feed Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-3xl font-bold">{errorCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active Templates</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-4 mt-4">
              {templatesLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading templates...</p>
                </div>
              ) : activeTemplates.length === 0 ? (
                <div className="h-32 flex items-center justify-center border rounded-md bg-muted/20">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">No active templates found</p>
                    <Button asChild>
                      <Link to="/templates/new">Create Template</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                activeTemplates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))
              )}
            </TabsContent>
            <TabsContent value="inactive" className="space-y-4 mt-4">
              {templatesLoading ? (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading templates...</p>
                </div>
              ) : inactiveTemplates.length === 0 ? (
                <div className="h-32 flex items-center justify-center border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No inactive templates</p>
                </div>
              ) : (
                inactiveTemplates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Feed Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="h-32 flex items-center justify-center">
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : recentHistory.length === 0 ? (
              <div className="h-32 flex items-center justify-center">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentHistory.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.status === 'success' ? (
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.templateName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.generatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/history">View All History</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Feed Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryTable history={recentHistory} />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" asChild>
              <Link to="/history">View All History</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
