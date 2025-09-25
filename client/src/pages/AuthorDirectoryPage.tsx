import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Users, Eye, FileText, ExternalLink, X, Filter, Grid, List, Star, Twitter, Linkedin, Github, MessageCircle, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useBlogAuthorsWithStats } from "@/lib/content-service";
import { formatDistanceToNow } from "date-fns";
import { Helmet } from "react-helmet-async";
import type { BlogAuthor } from "@shared/schema";

type AuthorWithStats = BlogAuthor & { postCount: number; totalViews: number; lastPostDate: string | null };
type ViewMode = 'grid' | 'list';

export default function AuthorDirectoryPage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [minPosts, setMinPosts] = useState("0");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch authors with stats
  const { data: authorsData, isLoading } = useBlogAuthorsWithStats();

  // Filter and sort authors
  const filteredAuthors = authorsData?.filter((author) => {
    // Active authors only
    if (!author.active) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = author.name.toLowerCase().includes(searchLower);
      const matchesBio = author.bio?.toLowerCase().includes(searchLower);
      const matchesJob = author.jobTitle?.toLowerCase().includes(searchLower);
      const matchesCompany = author.company?.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesBio && !matchesJob && !matchesCompany) {
        return false;
      }
    }
    
    // Featured filter
    if (featuredOnly && !author.featured) return false;
    
    // Minimum posts filter
    const minPostsNum = parseInt(minPosts);
    if (author.postCount < minPostsNum) return false;
    
    return true;
  }) || [];

  // Sort authors
  const sortedAuthors = [...filteredAuthors].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "posts":
        return b.postCount - a.postCount;
      case "views":
        return b.totalViews - a.totalViews;
      case "recent":
        const aDate = a.lastPostDate ? new Date(a.lastPostDate).getTime() : 0;
        const bDate = b.lastPostDate ? new Date(b.lastPostDate).getTime() : 0;
        return bDate - aDate;
      default:
        return 0;
    }
  });

  const formatDate = (date: string | null) => {
    if (!date) return "No posts yet";
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
      case 'twitter': return <Twitter className="h-3 w-3" />;
      case 'linkedin': return <Linkedin className="h-3 w-3" />;
      case 'github': return <Github className="h-3 w-3" />;
      case 'telegram': return <MessageCircle className="h-3 w-3" />;
      case 'website': return <Globe className="h-3 w-3" />;
      default: return <ExternalLink className="h-3 w-3" />;
    }
  };

  const formatSocialLink = (platform: string, value: string) => {
    if (!value) return '';
    
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    
    switch (platform) {
      case 'twitter':
        return value.startsWith('@') ? `https://twitter.com/${value.slice(1)}` : `https://twitter.com/${value}`;
      case 'linkedin':
        return value.includes('linkedin.com') ? `https://${value}` : `https://linkedin.com/in/${value}`;
      case 'github':
        return value.includes('github.com') ? `https://${value}` : `https://github.com/${value}`;
      case 'telegram':
        return value.startsWith('@') ? `https://t.me/${value.slice(1)}` : `https://t.me/${value}`;
      default:
        return value;
    }
  };

  const getSocialLinks = (author: AuthorWithStats) => {
    return [
      { platform: 'website', value: author.website },
      { platform: 'twitter', value: author.twitter },
      { platform: 'linkedin', value: author.linkedin },
      { platform: 'github', value: author.github },
      { platform: 'telegram', value: author.telegram },
    ].filter(link => link.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFeaturedOnly(false);
    setMinPosts("0");
    setSortBy("name");
  };

  const hasActiveFilters = searchTerm || featuredOnly || minPosts !== "0" || sortBy !== "name";

  const AuthorGridCard = ({ author }: { author: AuthorWithStats }) => (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/blog/author/${author.slug}`)}
      data-testid={`card-author-${author.id}`}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <Avatar className="w-16 h-16 mx-auto mb-4">
            <AvatarImage src={author.avatar || ''} alt={author.name} />
            <AvatarFallback className="text-lg">
              {getAuthorInitials(author.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex justify-center mb-2">
            {author.featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400" data-testid={`text-author-name-${author.id}`}>
            {author.name}
          </h3>
          
          {(author.jobTitle || author.company) && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3" data-testid={`text-author-position-${author.id}`}>
              {author.jobTitle}
              {author.jobTitle && author.company && ' at '}
              {author.company}
            </p>
          )}

          {author.bio && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2" dir="rtl" data-testid={`text-author-bio-${author.id}`}>
              {author.bio}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center justify-center gap-1">
              <FileText className="h-3 w-3" />
              {author.postCount} articles
            </div>
            {author.totalViews > 0 && (
              <div className="flex items-center justify-center gap-1">
                <Eye className="h-3 w-3" />
                {author.totalViews.toLocaleString()} views
              </div>
            )}
          </div>

          {/* Social Links */}
          {getSocialLinks(author).length > 0 && (
            <div className="flex justify-center gap-2">
              {getSocialLinks(author).slice(0, 4).map((link) => (
                <a
                  key={link.platform}
                  href={formatSocialLink(link.platform, link.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`link-${link.platform}-${author.id}`}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const AuthorListItem = ({ author }: { author: AuthorWithStats }) => (
    <Card 
      className="group hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/blog/author/${author.slug}`)}
      data-testid={`item-author-${author.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={author.avatar || ''} alt={author.name} />
            <AvatarFallback>
              {getAuthorInitials(author.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400" data-testid={`text-author-name-${author.id}`}>
                {author.name}
              </h3>
              {author.featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            {(author.jobTitle || author.company) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2" data-testid={`text-author-position-${author.id}`}>
                {author.jobTitle}
                {author.jobTitle && author.company && ' at '}
                {author.company}
              </p>
            )}

            {author.bio && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1" dir="rtl" data-testid={`text-author-bio-${author.id}`}>
                {author.bio}
              </p>
            )}
          </div>

          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1 mb-1">
              <FileText className="h-3 w-3" />
              {author.postCount} articles
            </div>
            {author.totalViews > 0 && (
              <div className="flex items-center gap-1 mb-1">
                <Eye className="h-3 w-3" />
                {author.totalViews.toLocaleString()} views
              </div>
            )}
            <div className="text-xs">
              Latest: {formatDate(author.lastPostDate)}
            </div>
          </div>

          {/* Social Links */}
          {getSocialLinks(author).length > 0 && (
            <div className="flex gap-1">
              {getSocialLinks(author).slice(0, 3).map((link) => (
                <a
                  key={link.platform}
                  href={formatSocialLink(link.platform, link.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`link-${link.platform}-${author.id}`}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Authors</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Meet the talented writers behind our content
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Authors - Meet Our Writers</title>
        <meta name="description" content="Discover our talented authors and writers. Browse profiles, read their biographies, and explore their published articles." />
        <meta property="og:title" content="Authors - Meet Our Writers" />
        <meta property="og:description" content="Discover our talented authors and writers. Browse profiles, read their biographies, and explore their published articles." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog/authors`} />
        
        {/* Website schema for the authors directory */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Authors Directory",
            "description": "Discover our talented authors and writers",
            "url": `${window.location.origin}/blog/authors`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": sortedAuthors.length,
              "itemListElement": sortedAuthors.map((author, index) => ({
                "@type": "Person",
                "position": index + 1,
                "name": author.name,
                "description": author.bio,
                "image": author.avatar,
                "jobTitle": author.jobTitle,
                "url": `${window.location.origin}/blog/author/${author.slug}`
              }))
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" data-testid="page-title">
            Our Authors
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Meet the talented writers behind our content
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={featuredOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFeaturedOnly(!featuredOnly)}
                  data-testid="button-featured-filter"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Featured Only
                </Button>

                <Select value={minPosts} onValueChange={setMinPosts}>
                  <SelectTrigger className="w-[140px]" data-testid="select-min-posts">
                    <SelectValue placeholder="Min Posts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Authors</SelectItem>
                    <SelectItem value="1">1+ Posts</SelectItem>
                    <SelectItem value="5">5+ Posts</SelectItem>
                    <SelectItem value="10">10+ Posts</SelectItem>
                    <SelectItem value="20">20+ Posts</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="posts">Most Posts</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    data-testid="button-clear-filters"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>

              {/* View Mode Toggle */}
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
                <ToggleGroupItem value="grid" aria-label="Grid view" data-testid="button-grid-view">
                  <Grid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view" data-testid="button-list-view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {sortedAuthors.length} of {authorsData?.length || 0} authors
          </div>
          {searchTerm && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Search results for "{searchTerm}"
            </div>
          )}
        </div>

        {/* Authors Display */}
        {sortedAuthors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No authors found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || hasActiveFilters 
                  ? "Try adjusting your search terms or filters" 
                  : "No authors are currently available"}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} data-testid="button-clear-all-filters">
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedAuthors.map((author) => (
              <AuthorGridCard key={author.id} author={author} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAuthors.map((author) => (
              <AuthorListItem key={author.id} author={author} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}