
import React from 'react';
import { useFeedHistory } from '@/contexts/FeedHistoryContext';
import HistoryTable from '@/components/dashboard/HistoryTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useState } from 'react';
import { FeedHistory } from '@/types';

const History = () => {
  const { history, isLoading } = useFeedHistory();
  
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredHistory = history.filter(item => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesType && matchesStatus;
  });
  
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feed History</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Feed Types</SelectItem>
            <SelectItem value="google">Google Shopping</SelectItem>
            <SelectItem value="meta">Meta / Facebook</SelectItem>
            <SelectItem value="trovaprezzi">Trovaprezzi</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Feed Generation History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : (
            <HistoryTable history={sortedHistory} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
