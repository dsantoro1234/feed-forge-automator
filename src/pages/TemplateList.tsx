
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTemplates } from '@/contexts/TemplateContext';
import TemplateCard from '@/components/dashboard/TemplateCard';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TemplateList = () => {
  const { templates, isLoading } = useTemplates();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const filteredTemplates = templates.filter(template => {
    // Apply search filter
    const matchesSearch = search === '' || 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase());
    
    // Apply type filter
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feed Templates</h1>
        <Button asChild>
          <Link to="/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="google">Google Shopping</SelectItem>
            <SelectItem value="meta">Meta / Facebook</SelectItem>
            <SelectItem value="trovaprezzi">Trovaprezzi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="h-64 flex items-center justify-center border rounded-md bg-muted/20">
          <div className="text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No templates found</p>
            <Button asChild>
              <Link to="/templates/new">Create Your First Template</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateList;
