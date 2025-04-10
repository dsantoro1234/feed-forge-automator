
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedTemplate } from '@/types';
import { Link } from 'react-router-dom';
import { Calendar, Database, Facebook, Play, ShoppingCart, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { useFeedHistory } from '@/contexts/FeedHistoryContext';
import { toast } from 'sonner';

interface TemplateCardProps {
  template: FeedTemplate;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const { generateFeed } = useFeedHistory();
  
  const handleGenerateFeed = async () => {
    try {
      await generateFeed(template);
    } catch (error) {
      console.error('Failed to generate feed:', error);
    }
  };
  
  const getFeedIcon = () => {
    switch (template.type) {
      case 'google':
        return <ShoppingCart className="h-6 w-6 text-blue-500" />;
      case 'meta':
        return <Facebook className="h-6 w-6 text-indigo-500" />;
      case 'trovaprezzi':
        return <Tag className="h-6 w-6 text-green-500" />;
      default:
        return null;
    }
  };
  
  const getFeedTypeLabel = () => {
    switch (template.type) {
      case 'google':
        return 'Google Shopping';
      case 'meta':
        return 'Meta / Facebook';
      case 'trovaprezzi':
        return 'Trovaprezzi';
      default:
        return template.type;
    }
  };
  
  const getFeedTypeBadgeColor = () => {
    switch (template.type) {
      case 'google':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meta':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'trovaprezzi':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <Card className={template.isActive ? 'border-l-4 border-l-primary' : ''}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${template.type === 'google' ? 'bg-blue-50' : template.type === 'meta' ? 'bg-indigo-50' : 'bg-green-50'}`}>
            {getFeedIcon()}
          </div>
          <div>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getFeedTypeBadgeColor()}`}>
                {getFeedTypeLabel()}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            <span>{template.mappings.length} field mappings</span>
          </div>
          {template.lastGenerated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last generated: {format(new Date(template.lastGenerated), 'PPP')}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to={`/templates/${template.id}`}>Edit Template</Link>
        </Button>
        <Button onClick={handleGenerateFeed} disabled={!template.isActive}>
          <Play className="h-4 w-4 mr-2" />
          Generate Feed
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
