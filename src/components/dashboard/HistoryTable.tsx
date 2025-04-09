
import React from 'react';
import { FeedHistory } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';
import { useFeedHistory } from '@/contexts/FeedHistoryContext';
import { Badge } from '@/components/ui/badge';

interface HistoryTableProps {
  history: FeedHistory[];
  limit?: number;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ history, limit }) => {
  const { downloadFeed, deleteFeedHistory } = useFeedHistory();
  
  const displayedHistory = limit ? history.slice(0, limit) : history;
  
  const handleDownload = (id: string) => {
    downloadFeed(id);
  };
  
  const handleDelete = (id: string) => {
    deleteFeedHistory(id);
  };
  
  const getStatusIcon = (status: FeedHistory['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getFeedTypeBadge = (type: FeedHistory['type']) => {
    switch (type) {
      case 'google':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Google</Badge>;
      case 'meta':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Meta</Badge>;
      case 'trovaprezzi':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Trovaprezzi</Badge>;
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Generated</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Products</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No feed history available
              </TableCell>
            </TableRow>
          ) : (
            displayedHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{format(new Date(item.generatedAt), 'PP HH:mm')}</TableCell>
                <TableCell>{item.templateName}</TableCell>
                <TableCell>{getFeedTypeBadge(item.type)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="capitalize">{item.status}</span>
                  </div>
                  {item.errorMessage && (
                    <div className="text-xs text-red-500 mt-1">{item.errorMessage}</div>
                  )}
                </TableCell>
                <TableCell>
                  {item.productCount}
                  {item.warningCount > 0 && (
                    <span className="ml-2 text-xs text-yellow-500">
                      ({item.warningCount} warnings)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {item.status === 'success' && (
                      <Button size="icon" variant="ghost" onClick={() => handleDownload(item.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default HistoryTable;
