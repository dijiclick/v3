import { useEffect } from 'react';
import { SEOMetadata, updatePageSEO } from '@/lib/seo';

export const useSEO = (metadata: SEOMetadata) => {
  useEffect(() => {
    updatePageSEO(metadata);
    
    // Cleanup function to restore default title when component unmounts
    return () => {
      // Optional: You could restore a default title here if needed
    };
  }, [
    metadata.title, 
    metadata.description, 
    metadata.keywords, 
    metadata.ogTitle, 
    metadata.ogDescription, 
    metadata.ogImage, 
    metadata.ogUrl, 
    metadata.ogType, 
    metadata.canonical, 
    metadata.robots, 
    metadata.structuredData
  ]);
};