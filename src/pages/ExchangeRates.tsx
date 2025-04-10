
import React, { useState } from 'react';
import { useExchangeRates } from '@/contexts/ExchangeRateContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Plus, Edit, Trash2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ExchangeRates = () => {
  const { 
    exchangeRates, 
    isLoading, 
    addExchangeRate, 
    updateExchangeRate, 
    deleteExchangeRate, 
    refreshRates,
    isSubscriptionActive,
    setSubscriptionActive
  } = useExchangeRates();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [baseCurrency, setBaseCurrency] = useState('EUR');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [rate, setRate] = useState('');
  
  // Per il demo, elenco fisso di valute
  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'HKD', 'NZD'];
  
  const resetForm = () => {
    setBaseCurrency('EUR');
    setTargetCurrency('USD');
    setRate('');
  };
  
  const handleAddRate = () => {
    if (!rate || isNaN(parseFloat(rate)) || parseFloat(rate) <= 0) {
      toast.error('Inserire un tasso di cambio valido');
      return;
    }
    
    addExchangeRate({
      baseCurrency,
      targetCurrency,
      rate: parseFloat(rate),
      source: 'manual'
    });
    
    setIsAddDialogOpen(false);
    resetForm();
  };
  
  const handleEditClick = (id: string) => {
    const exchangeRate = exchangeRates.find(r => r.id === id);
    if (exchangeRate) {
      setBaseCurrency(exchangeRate.baseCurrency);
      setTargetCurrency(exchangeRate.targetCurrency);
      setRate(exchangeRate.rate.toString());
      setEditId(id);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleEditRate = () => {
    if (!editId) return;
    
    if (!rate || isNaN(parseFloat(rate)) || parseFloat(rate) <= 0) {
      toast.error('Inserire un tasso di cambio valido');
      return;
    }
    
    updateExchangeRate(editId, {
      baseCurrency,
      targetCurrency,
      rate: parseFloat(rate)
    });
    
    setIsEditDialogOpen(false);
    setEditId(null);
    resetForm();
  };
  
  const handleDeleteRate = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo tasso di cambio?')) {
      deleteExchangeRate(id);
    }
  };
  
  const handleRefreshRates = async () => {
    if (!isSubscriptionActive) {
      toast.error('Questa funzionalità richiede un abbonamento premium', {
        action: {
          label: 'Attiva ora',
          onClick: () => toast.info('Funzionalità di abbonamento non disponibile in questa demo')
        }
      });
      return;
    }
    
    await refreshRates();
  };
  
  // Demo toggle per attivare/disattivare l'abbonamento
  const toggleSubscription = () => {
    setSubscriptionActive(!isSubscriptionActive);
    toast.success(isSubscriptionActive 
      ? 'Abbonamento premium disattivato' 
      : 'Abbonamento premium attivato'
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestione Tassi di Cambio</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 border rounded-md p-2 bg-muted/20">
            <Label htmlFor="subscription" className="flex items-center gap-1">
              Premium
              <Lock className="h-3 w-3 text-amber-500" />
            </Label>
            <Switch
              id="subscription"
              checked={isSubscriptionActive}
              onCheckedChange={toggleSubscription}
            />
          </div>
          <Button 
            onClick={handleRefreshRates} 
            disabled={isLoading}
            variant={isSubscriptionActive ? "default" : "outline"}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Aggiorna Tassi
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Tasso
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tassi di Cambio</CardTitle>
          <CardDescription>
            Gestisci i tassi di cambio per la conversione delle valute nei feed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tutti</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="manual">Manuali</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ExchangeRateTable 
                rates={exchangeRates} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteRate} 
              />
            </TabsContent>
            
            <TabsContent value="api">
              <ExchangeRateTable 
                rates={exchangeRates.filter(r => r.source === 'api')} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteRate} 
              />
            </TabsContent>
            
            <TabsContent value="manual">
              <ExchangeRateTable 
                rates={exchangeRates.filter(r => r.source === 'manual')} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteRate} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="text-sm text-muted-foreground">
            {isSubscriptionActive ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Premium Attivo
                </Badge>
                <span>I tassi vengono aggiornati automaticamente ogni giorno</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Base</Badge>
                <span>Attiva l'abbonamento premium per ricevere aggiornamenti automatici giornalieri</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Dialog per aggiungere un nuovo tasso */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Tasso di Cambio</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli per il nuovo tasso di cambio
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseCurrency">Valuta di Base</Label>
                <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona valuta" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="targetCurrency">Valuta Target</Label>
                <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona valuta" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="rate">Tasso di Cambio</Label>
              <Input
                id="rate"
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="1.0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleAddRate}>
              Aggiungi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog per modificare un tasso */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Tasso di Cambio</DialogTitle>
            <DialogDescription>
              Aggiorna i dettagli del tasso di cambio
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseCurrency">Valuta di Base</Label>
                <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona valuta" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="targetCurrency">Valuta Target</Label>
                <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona valuta" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="rate">Tasso di Cambio</Label>
              <Input
                id="rate"
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="1.0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleEditRate}>
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ExchangeRateTableProps {
  rates: Array<{
    id: string;
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    lastUpdated: string;
    source: 'api' | 'manual';
  }>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ExchangeRateTable: React.FC<ExchangeRateTableProps> = ({ rates, onEdit, onDelete }) => {
  return (
    <Table>
      <TableCaption>Elenco dei tassi di cambio disponibili.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Da</TableHead>
          <TableHead>A</TableHead>
          <TableHead>Tasso</TableHead>
          <TableHead>Fonte</TableHead>
          <TableHead>Ultimo Aggiornamento</TableHead>
          <TableHead className="text-right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
              Nessun tasso di cambio trovato
            </TableCell>
          </TableRow>
        ) : (
          rates.map((rate) => (
            <TableRow key={rate.id}>
              <TableCell className="font-medium">{rate.baseCurrency}</TableCell>
              <TableCell>{rate.targetCurrency}</TableCell>
              <TableCell>{rate.rate.toFixed(4)}</TableCell>
              <TableCell>
                <Badge variant={rate.source === 'api' ? 'secondary' : 'outline'}>
                  {rate.source === 'api' ? 'API' : 'Manuale'}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(rate.lastUpdated), 'dd/MM/yyyy HH:mm')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(rate.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(rate.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ExchangeRates;
