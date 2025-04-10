
import React, { useState } from 'react';
import { useExchangeRates } from '@/contexts/ExchangeRateContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Trash2, Lock, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

const ExchangeRates = () => {
  const {
    exchangeRates,
    isLoading,
    addExchangeRate,
    updateExchangeRate,
    deleteExchangeRate,
    refreshRates,
    isPremium,
  } = useExchangeRates();

  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rate, setRate] = useState('1.0');

  const handleAddRate = () => {
    addExchangeRate({
      fromCurrency: fromCurrency,
      toCurrency: toCurrency,
      rate: parseFloat(rate),
      lastUpdated: new Date().toISOString(),
      source: 'manual'
    });
    setRate('1.0');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Exchange Rates</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshRates}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Rates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Current Exchange Rates</CardTitle>
            <CardDescription>
              View and manage your conversion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Exchange rates for currency conversion</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No exchange rates found. Add your first rate below.
                    </TableCell>
                  </TableRow>
                ) : (
                  exchangeRates.map((er) => (
                    <TableRow key={er.id}>
                      <TableCell>{er.fromCurrency}</TableCell>
                      <TableCell>{er.toCurrency}</TableCell>
                      <TableCell>{er.rate.toFixed(4)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(er.updatedAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {er.source === 'api' ? (
                          <Badge variant="secondary">API</Badge>
                        ) : (
                          <Badge variant="outline">Manual</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteExchangeRate(er.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Rate</CardTitle>
            <CardDescription>
              Manually add a new exchange rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fromCurrency">From Currency</Label>
                <Select
                  value={fromCurrency}
                  onValueChange={setFromCurrency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="AUD">AUD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="toCurrency">To Currency</Label>
                <Select
                  value={toCurrency}
                  onValueChange={setToCurrency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="AUD">AUD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rate">Exchange Rate</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="1.0"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleAddRate}
              disabled={fromCurrency === toCurrency}
            >
              Add Exchange Rate
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Automatic Rate Updates</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={isPremium ? 'bg-primary/10' : ''}>
                    {isPremium ? (
                      <CreditCard className="h-3 w-3 mr-1" />
                    ) : (
                      <Lock className="h-3 w-3 mr-1" />
                    )}
                    {isPremium ? 'Premium' : 'Premium Feature'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isPremium
                      ? 'You have access to automatic rate updates'
                      : 'Upgrade to premium for automatic rate updates'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            Enable automatic updates from external API providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">
                Enable Daily Rate Updates
              </h4>
              <p className="text-sm text-muted-foreground">
                Rates will be updated automatically every 24 hours
              </p>
            </div>
            <Switch disabled={!isPremium} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRates;
