
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, ShoppingCart, History, Settings, DollarSign } from 'lucide-react';

const Index = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feed Manager</h1>
        <p className="text-muted-foreground mt-2">
          Manage and generate product feeds for multiple platforms
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Templates
            </CardTitle>
            <CardDescription>Create and manage feed templates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Define how your product data should be formatted for different channels
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/templates">
                Manage Templates <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Products
            </CardTitle>
            <CardDescription>View and update your product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse your product database and prepare data for feed generation
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/products">
                View Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Feed History
            </CardTitle>
            <CardDescription>Track previously generated feeds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View your feed generation history and download previous files
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/history">
                View History <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Exchange Rates
            </CardTitle>
            <CardDescription>Manage currency conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up and maintain exchange rates for price conversions across currencies
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/exchange-rates">
                Manage Rates <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Settings
            </CardTitle>
            <CardDescription>Configure your feed manager</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up API connections, scheduling, and other global settings
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/settings">
                Open Settings <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
