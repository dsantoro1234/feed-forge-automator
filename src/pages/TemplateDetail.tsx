
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTemplates } from '@/contexts/TemplateContext';
import { useFeedHistory } from '@/contexts/FeedHistoryContext';
import { useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateForm from '@/components/templates/TemplateForm';
import FieldMappingCard from '@/components/templates/FieldMappingCard';
import AddFieldMappingForm from '@/components/templates/AddFieldMappingForm';
import { ArrowLeft, Play, Plus, Trash2, FileText, Download, List } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateFeedByType } from '@/utils/feedGenerators';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates, getTemplateById, deleteTemplate, addPredefinedGoogleFields } = useTemplates();
  const { generateFeed } = useFeedHistory();
  const { products } = useProducts();
  
  const [isAddingMapping, setIsAddingMapping] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  
  const template = id ? getTemplateById(id) : undefined;
  
  if (!template) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Template non trovato</p>
          <Button variant="outline" onClick={() => navigate('/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Torna ai Templates</span>
          </Button>
        </div>
      </div>
    );
  }
  
  const handleGenerateFeed = async () => {
    setIsGenerating(true);
    try {
      await generateFeed(template, products);
      toast.success('Feed generato con successo');
    } catch (error) {
      console.error('Impossibile generare il feed:', error);
      toast.error('Impossibile generare il feed');
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
  
  const handlePreviewFeed = () => {
    if (template.mappings.length === 0) {
      setPreviewContent('');
      setPreviewOpen(true);
      return;
    }
    
    try {
      // Genera l'anteprima del feed con i prodotti disponibili
      const sampleProducts = products.slice(0, 5); // Limita a 5 prodotti per l'anteprima
      const feedContent = generateFeedByType(sampleProducts, template);
      setPreviewContent(feedContent);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Errore nella generazione dell\'anteprima:', error);
      toast.error('Impossibile generare l\'anteprima del feed');
    }
  };
  
  const handleDownloadPreview = () => {
    if (!previewContent) {
      toast.error('Nessun contenuto da scaricare');
      return;
    }
    
    const blob = new Blob(
      [previewContent], 
      { type: template.type === 'google' ? 'application/xml' : 'text/csv' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const extension = template.type === 'google' ? '.xml' : '.csv';
    
    link.href = url;
    link.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-preview${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleAddPredefinedFields = () => {
    if (template.type === 'google') {
      addPredefinedGoogleFields(template.id);
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
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Attivo</Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inattivo</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviewFeed}>
            <FileText className="h-4 w-4 mr-2" />
            Anteprima
          </Button>
          <Button onClick={handleGenerateFeed} disabled={isGenerating || !template.isActive}>
            <Play className="h-4 w-4 mr-2" />
            Genera Feed
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="mappings">
        <TabsList>
          <TabsTrigger value="mappings">Mappatura Campi</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni Template</TabsTrigger>
        </TabsList>
        <TabsContent value="mappings" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mappatura Campi</h2>
            <div className="flex gap-2">
              {template.type === 'google' && (
                <Button variant="outline" onClick={handleAddPredefinedFields}>
                  <List className="h-4 w-4 mr-2" />
                  Aggiungi Tutti i Campi Google
                </Button>
              )}
              <Button onClick={() => setIsAddingMapping(true)} disabled={isAddingMapping}>
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Mappatura
              </Button>
            </div>
          </div>
          
          {template.mappings.length === 0 && !isAddingMapping ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nessuna mappatura di campo definita</p>
                  <div className="flex gap-2 justify-center">
                    {template.type === 'google' && (
                      <Button onClick={handleAddPredefinedFields}>
                        Aggiungi Tutti i Campi Google
                      </Button>
                    )}
                    <Button onClick={() => setIsAddingMapping(true)}>
                      Aggiungi Campo Manualmente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {isAddingMapping && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Aggiungi Nuova Mappatura</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddFieldMappingForm 
                      templateId={template.id} 
                      onComplete={() => setIsAddingMapping(false)} 
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Required fields first */}
              {template.mappings.some(m => m.isRequired) && (
                <div className="mb-2">
                  <h3 className="text-md font-semibold mb-2 text-red-600">
                    Campi Obbligatori
                    <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                      Required
                    </Badge>
                  </h3>
                  {template.mappings
                    .filter(mapping => mapping.isRequired)
                    .map(mapping => (
                      <FieldMappingCard 
                        key={mapping.id} 
                        templateId={template.id} 
                        mapping={mapping} 
                      />
                    ))
                  }
                </div>
              )}
              
              {/* Optional fields */}
              {template.mappings.some(m => !m.isRequired) && (
                <div>
                  <h3 className="text-md font-semibold mb-2">
                    Campi Opzionali
                  </h3>
                  {template.mappings
                    .filter(mapping => !mapping.isRequired)
                    .map(mapping => (
                      <FieldMappingCard 
                        key={mapping.id} 
                        templateId={template.id} 
                        mapping={mapping} 
                      />
                    ))
                  }
                </div>
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Template</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateForm existingTemplate={template} />
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-destructive mb-4">Zona Pericolosa</h3>
                <p className="text-muted-foreground mb-4">
                  Elimina permanentemente questo template e tutte le sue mappature. Questa azione non può essere annullata.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina Template</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare il template "{template.name}"? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Elimina Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Anteprima Feed</DialogTitle>
            <DialogDescription>
              Anteprima di come i tuoi dati saranno formattati nel feed
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPreview}
              disabled={!previewContent}
            >
              <Download className="h-4 w-4 mr-2" />
              Scarica Anteprima
            </Button>
          </div>
          
          {template.mappings.length === 0 ? (
            <Alert>
              <AlertTitle>Nessuna mappatura definita</AlertTitle>
              <AlertDescription>
                Aggiungi mappature di campo per vedere un'anteprima del tuo feed
              </AlertDescription>
            </Alert>
          ) : !previewContent ? (
            <Alert>
              <AlertTitle>Impossibile generare l'anteprima</AlertTitle>
              <AlertDescription>
                Si è verificato un errore durante la generazione dell'anteprima del feed
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-auto max-h-[50vh] border rounded-md">
              <pre className="p-4 text-xs overflow-auto whitespace-pre-wrap bg-muted font-mono">
                {previewContent}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateDetail;
