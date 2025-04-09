
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedTemplate } from '@/types';
import { Link } from 'react-router-dom';
import { Calendar, Database, FileCode, Play, Copy, ExternalLink, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { useFeedHistory } from '@/contexts/FeedHistoryContext';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TemplateCardProps {
  template: FeedTemplate;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const { generateFeed, getPublicFeedUrl } = useFeedHistory();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const publicFeedUrl = getPublicFeedUrl(template.id);
  
  const handleGenerateFeed = async () => {
    try {
      setIsGenerating(true);
      await generateFeed(template);
    } catch (error) {
      console.error('Failed to generate feed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(window.location.origin + text)
      .then(() => {
        toast.success('URL feed pubblico copiato negli appunti');
      })
      .catch(() => {
        toast.error('Impossibile copiare negli appunti');
      });
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
  
  const handlePublicUrlClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent navigation, we'll handle this with our route
    e.preventDefault();
    
    // Navigate to the URL which will trigger the download
    window.open(window.location.origin + publicFeedUrl!, '_blank');
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
          {publicFeedUrl && (
            <>
              <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm truncate">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  <a 
                    href={publicFeedUrl} 
                    className="truncate hover:underline text-primary"
                    onClick={handlePublicUrlClick}
                    title={window.location.origin + publicFeedUrl}
                  >
                    {window.location.origin + publicFeedUrl}
                  </a>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(publicFeedUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy public feed URL</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="p-2 bg-muted/50 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm truncate">
                  <FolderOpen className="h-4 w-4 text-amber-600" />
                  <span className="truncate">
                    Storage ID: {template.id}.{template.type === 'google' ? 'xml' : 'csv'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to={`/templates/${template.id}`}>Edit Template</Link>
        </Button>
        <Button 
          onClick={handleGenerateFeed} 
          disabled={!template.isActive || isGenerating}
        >
          <Play className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Feed'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
