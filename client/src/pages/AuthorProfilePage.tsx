import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { CalendarDays, MapPin, ExternalLink, Eye, FileText, Users, ArrowLeft, Twitter, Linkedin, Github, MessageCircle, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useBlogAuthorBySlug, useBlogAuthorStats } from "@/lib/content-service";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Helmet } from "react-helmet-async";
import type { BlogPost } from "@shared/schema";

export default function AuthorProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Fetch author data
  const { data: author, isLoading: authorLoading, error: authorError } = useBlogAuthorBySlug(slug || "");
  const { data: stats } = useBlogAuthorStats(author?.id || "");

  // Fetch author's posts
  const { data: postsResponse, isLoading: postsLoading } = useQuery<{ posts: BlogPost[]; total: number }>({
    queryKey: ['/api/blog/authors/slug', slug, 'posts', currentPage],
    queryFn: async () => {
      if (!slug) throw new Error('Author slug is required');
      const offset = (currentPage - 1) * postsPerPage;
      const response = await fetch(`/api/blog/authors/slug/${slug}/posts?limit=${postsPerPage}&offset=${offset}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch author posts: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: Boolean(slug),
  });

  const posts = postsResponse?.posts || [];
  const totalPosts = postsResponse?.total || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'github': return <Github className="h-4 w-4" />;
      case 'telegram': return <MessageCircle className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const formatSocialLink = (platform: string, value: string) => {
    if (!value) return '';
    
    // If it's already a full URL, return as is
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    
    // Handle different platforms
    switch (platform) {
      case 'twitter':
        return value.startsWith('@') ? `https://twitter.com/${value.slice(1)}` : `https://twitter.com/${value}`;
      case 'linkedin':
        return value.includes('linkedin.com') ? `https://${value}` : `https://linkedin.com/in/${value}`;
      case 'github':
        return value.includes('github.com') ? `https://${value}` : `https://github.com/${value}`;
      case 'telegram':
        return value.startsWith('@') ? `https://t.me/${value.slice(1)}` : `https://t.me/${value}`;
      case 'email':
        return `mailto:${value}`;
      default:
        return value;
    }
  };

  if (authorLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
              ))}
            </div>
            <div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authorError || !author) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Author Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The author you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/blog')} data-testid="button-back-to-blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const socialLinks = [
    { platform: 'website', value: author.website, label: 'Website' },
    { platform: 'twitter', value: author.twitter, label: 'Twitter' },
    { platform: 'linkedin', value: author.linkedin, label: 'LinkedIn' },
    { platform: 'github', value: author.github, label: 'GitHub' },
    { platform: 'telegram', value: author.telegram, label: 'Telegram' },
    { platform: 'email', value: author.email, label: 'Email' },
  ].filter(link => link.value);

  const seoTitle = author.seoTitle || `${author.name} - Author Profile`;
  const seoDescription = author.seoDescription || `Read articles by ${author.name}${author.bio ? '. ' + author.bio.slice(0, 120) : ''}`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${window.location.origin}/blog/author/${author.slug}`} />
        {author.avatar && <meta property="og:image" content={author.avatar} />}
        
        {/* Person schema for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": author.name,
            "description": author.bio,
            "image": author.avatar,
            "jobTitle": author.jobTitle,
            "worksFor": author.company ? {
              "@type": "Organization",
              "name": author.company
            } : undefined,
            "url": author.website,
            "sameAs": socialLinks.map(link => formatSocialLink(link.platform, link.value)).filter(Boolean),
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${window.location.origin}/blog/author/${author.slug}`
            }
          })}
        </script>
        
        {author.seoKeywords?.length && (
          <meta name="keywords" content={author.seoKeywords.join(', ')} />
        )}
      </Helmet>

      <div className="max-w-6xl mx-auto p-6">
        {/* Back Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/blog/authors')}
          className="mb-6"
          data-testid="button-back-to-authors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          All Authors
        </Button>

        {/* Author Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={author.avatar || ''} alt={author.name} />
              <AvatarFallback className="text-2xl">
                {getAuthorInitials(author.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2" data-testid="text-author-name">
                {author.name}
              </h1>
              
              {(author.jobTitle || author.company) && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-3" data-testid="text-author-position">
                  {author.jobTitle}
                  {author.jobTitle && author.company && ' at '}
                  {author.company}
                </p>
              )}

              {author.bio && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4" dir="rtl" data-testid="text-author-bio">
                  {author.bio}
                </p>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <Button
                      key={link.platform}
                      variant="outline"
                      size="sm"
                      asChild
                      data-testid={`link-${link.platform}`}
                    >
                      <a 
                        href={formatSocialLink(link.platform, link.value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        {getSocialIcon(link.platform)}
                        {link.label}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {author.featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                Featured Author
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Author's Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" data-testid="section-posts">
                Articles by {author.name}
              </h2>
              {totalPosts > 0 && (
                <span className="text-gray-600 dark:text-gray-400">
                  {totalPosts} article{totalPosts !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {postsLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Articles Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {author.name} hasn't published any articles yet. Check back later!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {post.featuredImage && (
                            <img 
                              src={post.featuredImage} 
                              alt={post.title}
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                              <a 
                                href={`/blog/${post.slug}`}
                                data-testid={`link-post-${post.id}`}
                              >
                                {post.title}
                              </a>
                            </h3>
                            {post.excerpt && (
                              <p className="text-gray-600 dark:text-gray-400 mb-3" dir="rtl">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                {formatDate(post.publishedAt)}
                              </div>
                              {post.viewCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.viewCount} views
                                </div>
                              )}
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {post.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-1 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Author Stats */}
          <div className="space-y-6">
            {/* Author Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Author Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Articles</span>
                  <span className="font-semibold" data-testid="stat-total-posts">
                    {stats?.postCount || 0}
                  </span>
                </div>
                
                {stats && stats.totalViews > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Views</span>
                    <span className="font-semibold" data-testid="stat-total-views">
                      {stats.totalViews.toLocaleString()}
                    </span>
                  </div>
                )}

                {stats && stats.draftsCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Drafts</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400" data-testid="stat-drafts">
                      {stats.draftsCount}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Latest Article</span>
                  <span className="font-semibold text-sm" data-testid="stat-latest-post">
                    {formatDate(stats?.lastPostDate || null)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Author Since</span>
                  <span className="font-semibold text-sm" data-testid="stat-member-since">
                    {formatDate(author.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* All Authors Link */}
            <Card>
              <CardContent className="p-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/blog/authors')}
                  className="w-full"
                  data-testid="button-view-all-authors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Authors
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}