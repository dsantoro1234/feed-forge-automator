
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedTemplate } from '@/types';
import { Link } from 'react-router-dom';
import { Calendar, Database, FileCode, Play } from 'lucide-react';
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
        return <FileCode className="h-5 w-5 text-blue-500" />;
      case 'meta':
        return <FileCode className="h-5 w-5 text-indigo-500" />;
      case 'trovaprezzi':
        return <FileCode className="h-5 w-5 text-green-500" />;
      default:
        return <FileCode className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Card className={template.isActive ? 'border-l-4 border-l-primary' : ''}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {getFeedIcon()}
          <CardTitle>{template.name}</CardTitle>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
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
