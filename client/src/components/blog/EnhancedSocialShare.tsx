import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Github,
  Mail,
  Send,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { BlogPost, BlogAuthor } from '@/types';

export interface SharePlatform {
  id: string;
  name: string;
  persianName: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  getShareUrl: (url: string, title: string, description?: string, image?: string) => string;
  requiresPopup: boolean;
  analytics?: string;
}

export interface EnhancedSocialShareProps {
  post: BlogPost;
  author?: BlogAuthor;
  currentUrl: string;
  variant?: 'default' | 'compact' | 'floating' | 'inline';
  showLabels?: boolean;
  showShareCount?: boolean;
  onShare?: (platform: string, url: string) => void;
  className?: string;
}

// Define sharing platforms with Persian names
const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    persianName: 'تلگرام',
    icon: <Send className="h-4 w-4" />,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    getShareUrl: (url, title, description) => {
      const text = encodeURIComponent(`${title}\n\n${description || ''}\n\n${url}`);
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`;
    },
    requiresPopup: true,
    analytics: 'telegram_share'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    persianName: 'واتساپ',
    icon: <MessageCircle className="h-4 w-4" />,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    getShareUrl: (url, title, description) => {
      const text = encodeURIComponent(`${title}\n\n${description || ''}\n\n${url}`);
      return `https://wa.me/?text=${text}`;
    },
    requiresPopup: true,
    analytics: 'whatsapp_share'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    persianName: 'توییتر',
    icon: <Twitter className="h-4 w-4" />,
    color: 'bg-black',
    hoverColor: 'hover:bg-gray-800',
    getShareUrl: (url, title, description) => {
      const text = encodeURIComponent(`${title}${description ? `\n\n${description}` : ''}`);
      const hashtags = encodeURIComponent('وبلاگ,لیمیت_پس');
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}&hashtags=${hashtags}`;
    },
    requiresPopup: true,
    analytics: 'twitter_share'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    persianName: 'فیسبوک',
    icon: <Facebook className="h-4 w-4" />,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    getShareUrl: (url, title, description) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
    },
    requiresPopup: true,
    analytics: 'facebook_share'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    persianName: 'لینکدین',
    icon: <Linkedin className="h-4 w-4" />,
    color: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800',
    getShareUrl: (url, title, description) => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`;
    },
    requiresPopup: true,
    analytics: 'linkedin_share'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    persianName: 'پینترست',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.690 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.001 24c6.624 0 11.99-5.373 11.99-12C24 5.373 18.627.001 12.001.001z"/>
    </svg>,
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
    getShareUrl: (url, title, description, image) => {
      return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title + (description ? ` - ${description}` : ''))}&media=${encodeURIComponent(image || '')}`;
    },
    requiresPopup: true,
    analytics: 'pinterest_share'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    persianName: 'ردیت',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>,
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
    getShareUrl: (url, title, description) => {
      return `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    },
    requiresPopup: true,
    analytics: 'reddit_share'
  },
  {
    id: 'email',
    name: 'Email',
    persianName: 'ایمیل',
    icon: <Mail className="h-4 w-4" />,
    color: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
    getShareUrl: (url, title, description) => {
      const subject = encodeURIComponent(`مقاله جالب: ${title}`);
      const body = encodeURIComponent(`سلام،\n\nمقاله جالبی پیدا کردم که فکر کردم ممکنه براتون مفید باشه:\n\n${title}\n\n${description || ''}\n\n${url}\n\nبا تشکر`);
      return `mailto:?subject=${subject}&body=${body}`;
    },
    requiresPopup: false,
    analytics: 'email_share'
  }
];

const EnhancedSocialShare: React.FC<EnhancedSocialShareProps> = ({
  post,
  author,
  currentUrl,
  variant = 'default',
  showLabels = true,
  showShareCount = false,
  onShare,
  className = ''
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [shareCount, setShareCount] = useState<Record<string, number>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  // Generate sharing content
  const shareTitle = post.seoTitle || post.title;
  const shareDescription = post.seoDescription || post.excerpt || 
    `مقاله جدید از ${author?.name || 'وبلاگ لیمیت پس'}`;
  const shareImage = post.ogImage || post.featuredImage;

  // Track sharing analytics
  const trackShare = (platform: string, url: string) => {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        item_id: post.slug,
        content_title: post.title
      });
    }

    // Custom callback
    onShare?.(platform, url);

    // Show toast notification
    const platformData = SHARE_PLATFORMS.find(p => p.id === platform);
    toast({
      title: 'اشتراک‌گذاری انجام شد',
      description: `مقاله در ${platformData?.persianName || platform} به اشتراک گذاشته شد.`,
      duration: 3000,
    });
  };

  // Handle share button click
  const handleShare = (platform: SharePlatform) => {
    const shareUrl = platform.getShareUrl(currentUrl, shareTitle, shareDescription, shareImage);
    
    if (platform.requiresPopup) {
      const width = 600;
      const height = 400;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      
      window.open(
        shareUrl,
        'share-popup',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
    } else {
      window.location.href = shareUrl;
    }

    trackShare(platform.id, shareUrl);
  };

  // Copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      
      trackShare('copy_link', currentUrl);
      
      toast({
        title: 'لینک کپی شد',
        description: 'آدرس مقاله در کلیپ‌بورد کپی شد.',
        duration: 3000,
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      
      toast({
        title: 'لینک کپی شد',
        description: 'آدرس مقاله کپی شد.',
        duration: 3000,
      });
    }
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: currentUrl,
        });
        trackShare('native_share', currentUrl);
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  // Get visible platforms based on variant
  const getVisiblePlatforms = () => {
    switch (variant) {
      case 'compact':
        return SHARE_PLATFORMS.slice(0, 4); // Show only first 4 platforms
      case 'floating':
        return SHARE_PLATFORMS.slice(0, 3); // Show only first 3 platforms
      case 'inline':
        return SHARE_PLATFORMS.slice(0, 6); // Show first 6 platforms
      default:
        return SHARE_PLATFORMS;
    }
  };

  const visiblePlatforms = getVisiblePlatforms();
  const hiddenPlatforms = SHARE_PLATFORMS.slice(visiblePlatforms.length);

  // Render share button
  const renderShareButton = (platform: SharePlatform, showLabel: boolean = true) => (
    <TooltipProvider key={platform.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={variant === 'compact' || variant === 'floating' ? 'sm' : 'default'}
            onClick={() => handleShare(platform)}
            className={`${platform.color} ${platform.hoverColor} text-white border-0 transition-all duration-200 hover:scale-105`}
            data-testid={`share-${platform.id}`}
          >
            {platform.icon}
            {showLabel && showLabels && (
              <span className="mr-2 hidden sm:inline">
                {platform.persianName}
              </span>
            )}
            {showShareCount && shareCount[platform.id] && (
              <Badge variant="secondary" className="mr-1 text-xs">
                {shareCount[platform.id]}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>اشتراک در {platform.persianName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'floating':
        return (
          <div className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
            <div className="flex flex-col gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg border">
              {visiblePlatforms.map(platform => renderShareButton(platform, false))}
              
              <Separator className="my-1" />
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      data-testid="copy-link"
                    >
                      {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copiedUrl ? 'کپی شد!' : 'کپی لینک'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {navigator.share && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNativeShare}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                        data-testid="native-share"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>اشتراک‌گذاری</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        );

      case 'compact':
        return (
          <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              اشتراک:
            </span>
            <div className="flex gap-1">
              {visiblePlatforms.slice(0, 3).map(platform => renderShareButton(platform, false))}
              
              {(hiddenPlatforms.length > 0 || visiblePlatforms.length > 3) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      data-testid="more-share-options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {visiblePlatforms.slice(3).concat(hiddenPlatforms).map(platform => (
                      <DropdownMenuItem
                        key={platform.id}
                        onClick={() => handleShare(platform)}
                        className="flex items-center gap-2"
                      >
                        {platform.icon}
                        {platform.persianName}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={copyToClipboard} className="flex items-center gap-2">
                      {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedUrl ? 'کپی شد!' : 'کپی لینک'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );

      case 'inline':
        return (
          <div className={`inline-flex items-center gap-2 ${className}`}>
            {visiblePlatforms.map(platform => renderShareButton(platform, false))}
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              data-testid="copy-link"
            >
              {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {showLabels && (
                <span className="mr-2 hidden sm:inline">
                  {copiedUrl ? 'کپی شد!' : 'کپی لینک'}
                </span>
              )}
            </Button>
          </div>
        );

      default:
        return (
          <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                اشتراک‌گذاری این مقاله
              </h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visiblePlatforms.map(platform => renderShareButton(platform))}
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex-1 justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                data-testid="copy-link"
              >
                {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="mr-2">
                  {copiedUrl ? 'لینک کپی شد!' : 'کپی کردن لینک'}
                </span>
              </Button>

              {navigator.share && (
                <Button
                  variant="outline"
                  onClick={handleNativeShare}
                  className="flex-1 justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                  data-testid="native-share"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="mr-2">اشتراک‌گذاری</span>
                </Button>
              )}
            </div>

            {showShareCount && Object.keys(shareCount).length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  آمار اشتراک‌گذاری:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(shareCount).map(([platform, count]) => {
                    const platformData = SHARE_PLATFORMS.find(p => p.id === platform);
                    return (
                      <Badge key={platform} variant="secondary">
                        {platformData?.persianName || platform}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return renderContent();
};

export default EnhancedSocialShare;