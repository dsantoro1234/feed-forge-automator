
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Database, Search, Download } from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { useConfig } from '@/contexts/ConfigContext';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const Products = () => {
  const { products, isLoading, error, refreshProducts, getProductFields } = useProducts();
  const { apiConfig } = useConfig();
  const [search, setSearch] = useState('');
  const [displayFields, setDisplayFields] = useState<string[]>([]);
  const [maxFields, setMaxFields] = useState(5);

  const allFields = getProductFields();
  
  // If no display fields are selected yet, default to first 5 fields
  React.useEffect(() => {
    if (displayFields.length === 0 && allFields.length > 0) {
      setDisplayFields(allFields.slice(0, maxFields));
    }
  }, [allFields, displayFields.length]);

  const filteredProducts = products.filter(product => {
    if (search === '') return true;
    return Object.values(product).some(
      value => 
        value !== null && 
        value !== undefined && 
        value.toString().toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAddField = (field: string) => {
    if (!displayFields.includes(field)) {
      setDisplayFields([...displayFields, field]);
    }
  };

  const handleRemoveField = (field: string) => {
    setDisplayFields(displayFields.filter(f => f !== field));
  };

  const handleExportCSV = () => {
    // Create CSV header
    const header = displayFields.join(',');
    
    // Create CSV content
    const csvRows = filteredProducts.map(product => {
      return displayFields.map(field => {
        const value = product[field];
        // Handle null, undefined, and wrap strings with commas in quotes
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    // Combine header and rows
    const csvContent = [header, ...csvRows].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Products exported successfully');
  };

  const handleRefresh = async () => {
    await refreshProducts();
    toast.success('Products refreshed successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Data</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={products.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <span>Source Data Preview</span>
            </div>
            <Badge variant="outline">
              {products.length} Products
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error Loading Products</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0">
                <Select 
                  value={maxFields.toString()} 
                  onValueChange={(v) => setMaxFields(parseInt(v))}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Max fields" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 fields</SelectItem>
                    <SelectItem value="10">10 fields</SelectItem>
                    <SelectItem value="15">15 fields</SelectItem>
                    <SelectItem value="20">20 fields</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {allFields.map((field) => (
                <Badge 
                  key={field}
                  variant={displayFields.includes(field) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => 
                    displayFields.includes(field) 
                      ? handleRemoveField(field) 
                      : handleAddField(field)
                  }
                >
                  {field}
                </Badge>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading product data...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-10">
                <Database className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No products found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure your API settings or refresh the data
                </p>
                <Button size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            ) : (
              <div className="border rounded-md">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {displayFields.map((field) => (
                          <TableHead key={field}>{field}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product, index) => (
                        <TableRow key={index}>
                          {displayFields.map((field) => (
                            <TableCell key={field}>
                              {product[field] !== undefined
                                ? String(product[field])
                                : ''}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
