import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, Archive, Clock, Eye, TrendingUp, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { BlogPost, BlogCategory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import BlogBreadcrumb, { BlogBreadcrumbs } from "@/components/blog/BlogBreadcrumb";
import { cn } from "@/lib/utils";

interface ArchiveData {
  years: {
    year: number;
    postCount: number;
    months: {
      month: number;
      monthName: string;
      postCount: number;
      posts: BlogPost[];
    }[];
  }[];
  totalPosts: number;
  categories: BlogCategory[];
}

export default function BlogArchivePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // Fetch archive data
  const { data: archiveData, isLoading } = useQuery<ArchiveData>({
    queryKey: ['/api/blog/archive'],
    queryFn: async () => {
      const response = await fetch('/api/blog/archive');
      if (!response.ok) throw new Error('Failed to fetch archive data');
      return response.json();
    },
  });

  // Filter and search posts
  const filteredData = useMemo(() => {
    if (!archiveData) return null;

    let filtered = archiveData.years;

    // Filter by year
    if (selectedYear !== "all") {
      filtered = filtered.filter(yearData => yearData.year.toString() === selectedYear);
    }

    // Filter by search query and category
    if (searchQuery || selectedCategory !== "all") {
      filtered = filtered.map(yearData => ({
        ...yearData,
        months: yearData.months.map(monthData => ({
          ...monthData,
          posts: monthData.posts.filter(post => {
            const matchesSearch = !searchQuery || 
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesCategory = selectedCategory === "all" || 
              post.categoryId === selectedCategory;

            return matchesSearch && matchesCategory;
          })
        })).filter(monthData => monthData.posts.length > 0)
      })).filter(yearData => yearData.months.length > 0);
    }

    return {
      ...archiveData,
      years: filtered
    };
  }, [archiveData, searchQuery, selectedYear, selectedCategory]);

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    return monthNames[month - 1] || month.toString();
  };

  const PostCard = ({ post }: { post: BlogPost }) => (
    <Link href={`/blog/${post.slug}`} key={post.id}>
      <Card 
        className="hover:shadow-md transition-all duration-300 cursor-pointer group"
        data-testid={`archive-post-${post.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-reverse space-x-3">
            {post.featuredImage && (
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h4>
              
              {post.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center space-x-reverse space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-reverse space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                
                {post.readingTime && (
                  <div className="flex items-center space-x-reverse space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readingTime} دقیقه</span>
                  </div>
                )}
                
                {post.viewCount && post.viewCount > 0 && (
                  <div className="flex items-center space-x-reverse space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{post.viewCount.toLocaleString('fa-IR')}</span>
                  </div>
                )}
              </div>
              
              {post.category && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {post.category.name}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const SkeletonCard = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-reverse space-x-3">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" dir="rtl">
      {/* Breadcrumb */}
      <BlogBreadcrumb customBreadcrumbs={BlogBreadcrumbs.archive()} />

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-reverse space-x-2">
          <Archive className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            آرشیو مطالب
          </h1>
        </div>
        
        {archiveData && (
          <div className="flex items-center justify-center space-x-reverse space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-reverse space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{archiveData.totalPosts.toLocaleString('fa-IR')} مطلب</span>
            </div>
            <div className="flex items-center space-x-reverse space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{archiveData.years.length} سال</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card data-testid="archive-filters">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-reverse space-x-2 text-lg">
            <Filter className="w-5 h-5 text-blue-500" />
            <span>فیلتر مطالب</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="جستجو در عناوین و خلاصه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="archive-search"
              />
            </div>

            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger data-testid="archive-year-filter">
                <SelectValue placeholder="انتخاب سال" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه سال‌ها</SelectItem>
                {archiveData?.years.map(yearData => (
                  <SelectItem key={yearData.year} value={yearData.year.toString()}>
                    {yearData.year.toLocaleString('fa-IR')} ({yearData.postCount} مطلب)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="archive-category-filter">
                <SelectValue placeholder="انتخاب دسته‌بندی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دسته‌ها</SelectItem>
                {archiveData?.categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <SkeletonCard key={j} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredData && filteredData.years.length > 0 ? (
        <div className="space-y-6" data-testid="archive-results">
          {filteredData.years.map(yearData => (
            <Card key={yearData.year}>
              <Collapsible 
                open={expandedYears.has(yearData.year)}
                onOpenChange={() => toggleYear(yearData.year)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-reverse space-x-3">
                        <Calendar className="w-6 h-6 text-blue-500" />
                        <span className="text-xl">
                          {yearData.year.toLocaleString('fa-IR')}
                        </span>
                        <Badge variant="secondary">
                          {yearData.postCount} مطلب
                        </Badge>
                      </CardTitle>
                      
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedYears.has(yearData.year) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {yearData.months.map(monthData => (
                      <div key={monthData.month} className="space-y-4">
                        <div className="flex items-center space-x-reverse space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {getMonthName(monthData.month)}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {monthData.postCount} مطلب
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {monthData.posts.map(post => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12" data-testid="archive-no-results">
          <Archive className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            مطلبی یافت نشد
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            با فیلترهای مختلف جستجو کنید یا فیلترها را پاک کنید.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedYear("all");
              setSelectedCategory("all");
            }}
            data-testid="clear-filters-button"
          >
            پاک کردن فیلترها
          </Button>
        </div>
      )}
    </div>
  );
}