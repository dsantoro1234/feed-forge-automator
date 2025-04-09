
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFeedContent } from '@/contexts/FeedHistoryContext';

/**
 * This component acts as a pseudo-API endpoint for feed downloads.
 * In a real application, this would be a server-side endpoint.
 */
const FeedRouteHandler = () => {
  const { templateId, format } = useParams<{ templateId: string; format: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!templateId || !format) {
      navigate('/not-found');
      return;
    }

    // Strip the extension to get the template ID
    const actualTemplateId = templateId.replace(/\.(xml|csv)$/, '');
    const feedType = format === 'xml' ? 'google' : 'meta';

    // Get the feed content from storage
    const content = getFeedContent(actualTemplateId, feedType);
    
    if (!content) {
      navigate('/not-found');
      return;
    }

    // Set the correct content type
    const contentType = format === 'xml' ? 'application/xml' : 'text/csv';
    
    // Create a blob from the content
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    // Create a filename
    const filename = `feed-${actualTemplateId}.${format}`;
    
    // Create an anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    // Navigate back to where the user came from
    navigate(-1);
  }, [templateId, format, navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Downloading your feed...</h1>
        <p className="text-muted-foreground">
          If the download doesn't start automatically, please go back and try again.
        </p>
      </div>
    </div>
  );
};

export default FeedRouteHandler;
