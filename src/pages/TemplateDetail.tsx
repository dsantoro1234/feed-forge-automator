
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTemplates } from '@/contexts/TemplateContext';
import { useFeedHistory } from '@/contexts/FeedHistoryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateForm from '@/components/templates/TemplateForm';
import FieldMappingCard from '@/components/templates/FieldMappingCard';
import AddFieldMappingForm from '@/components/templates/AddFieldMappingForm';
import { ArrowLeft, Play, Plus, Trash2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockSampleProducts } from '@/data/mockData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates, getTemplateById, deleteTemplate } = useTemplates();
  const { generateFeed } = useFeedHistory();
  
  const [isAddingMapping, setIsAddingMapping] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const template = id ? getTemplateById(id) : undefined;
  
  if (!template) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Template not found</p>
          <Button asChild>
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span onClick={() => navigate('/templates')}>Back to Templates</span>
          </Button>
        </div>
      </div>
    );
  }
  
  const handleGenerateFeed = async () => {
    setIsGenerating(true);
    try {
      await generateFeed(template);
      toast.success('Feed generated successfully');
    } catch (error) {
      console.error('Failed to generate feed:', error);
      toast.error('Failed to generate feed');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDeleteTemplate = () => {
    deleteTemplate(template.id);
    setIsDeleteDialogOpen(false);
    navigate('/templates');
  };
  
  const getTypeBadge = () => {
    switch (template.type) {
      case 'google':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Google Shopping (XML)</Badge>;
      case 'meta':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Meta / Facebook (CSV)</Badge>;
      case 'trovaprezzi':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Trovaprezzi (CSV)</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/templates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{template.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getTypeBadge()}
              {template.isActive ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleGenerateFeed} disabled={isGenerating || !template.isActive}>
            <Play className="h-4 w-4 mr-2" />
            Generate Feed
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="mappings">
        <TabsList>
          <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
          <TabsTrigger value="settings">Template Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="mappings" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Field Mappings</h2>
            <Button onClick={() => setIsAddingMapping(true)} disabled={isAddingMapping}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field Mapping
            </Button>
          </div>
          
          {template.mappings.length === 0 && !isAddingMapping ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No field mappings defined yet</p>
                  <Button onClick={() => setIsAddingMapping(true)}>
                    Add Your First Field Mapping
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {isAddingMapping && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Add New Field Mapping</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddFieldMappingForm 
                      templateId={template.id} 
                      onComplete={() => setIsAddingMapping(false)} 
                    />
                  </CardContent>
                </Card>
              )}
              
              {template.mappings.map(mapping => (
                <FieldMappingCard 
                  key={mapping.id} 
                  templateId={template.id} 
                  mapping={mapping} 
                />
              ))}
            </>
          )}
        </TabsContent>
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateForm existingTemplate={template} />
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
                <p className="text-muted-foreground mb-4">
                  Permanently delete this template and all its mappings. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{template.name}" template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Feed Preview</DialogTitle>
            <DialogDescription>
              Preview of how your data will be formatted in the feed
            </DialogDescription>
          </DialogHeader>
          
          {template.mappings.length === 0 ? (
            <Alert>
              <AlertTitle>No mappings defined</AlertTitle>
              <AlertDescription>
                Add field mappings to see a preview of your feed
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-auto max-h-[50vh] border rounded-md">
              <pre className="p-4 text-xs overflow-auto whitespace-pre-wrap bg-muted font-mono">
                {template.type === 'google' && `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>${template.name}</title>
  <link>https://example.com</link>
  <description>${template.description}</description>

  <item>
${template.mappings.map(mapping => {
  const value = mockSampleProducts[0][mapping.sourceField] || mapping.defaultValue || '';
  return `    <g:${mapping.targetField}><![CDATA[${value}]]></g:${mapping.targetField}>`;
}).join('\n')}
  </item>
  
  <item>
${template.mappings.map(mapping => {
  const value = mockSampleProducts[1][mapping.sourceField] || mapping.defaultValue || '';
  return `    <g:${mapping.targetField}><![CDATA[${value}]]></g:${mapping.targetField}>`;
}).join('\n')}
  </item>
</channel>
</rss>`}

                {(template.type === 'meta' || template.type === 'trovaprezzi') && 
                  `${template.mappings.map(m => m.targetField).join(',')}\n` +
                  mockSampleProducts.slice(0, 2).map(product => 
                    template.mappings.map(mapping => 
                      `"${product[mapping.sourceField] || mapping.defaultValue || ''}"`
                    ).join(',')
                  ).join('\n')
                }
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateDetail;
