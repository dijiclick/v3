import { useState, useMemo } from "react";
import { BlogPost } from "./components/BlogPost";
import { SearchBar } from "./components/SearchBar";
import { Sidebar } from "./components/Sidebar";
import { Pagination } from "./components/Pagination";
import { CategoryFilter } from "./components/CategoryFilter";
import { EmptyState } from "./components/EmptyState";
import { Toaster } from "./components/ui/sonner";

// Enhanced mock data with more variety
const blogPosts = [
  {
    id: "1",
    title: "Gamma AI App Review 2025: Best Free AI Slide Generator?",
    image: "https://images.unsplash.com/photo-1619105277499-af55be513778?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHRlY2hub2xvZ3klMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NTg4MjY2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "AI",
    categoryColor: "bg-purple-500",
    author: "GamsGo Team",
    date: "2025-09-24",
    readTime: "5 min",
    views: "12.5k"
  },
  {
    id: "2",
    title: "ChatGPT Pricing 2025: Find the Right Plan for You",
    image: "https://images.unsplash.com/photo-1678347123725-2d0d31bc06bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGF0R1BUJTIwYXJ0aWZpY2lhbCUyMGludGVsbGlnZW5jZXxlbnwxfHx8fDE3NTg4MjY2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "AI",
    categoryColor: "bg-green-500",
    author: "GamsGo Team",
    date: "2025-09-23",
    readTime: "8 min",
    views: "18.2k"
  },
  {
    id: "3",
    title: "Is MidJourney Free in 2025? Plans, Price & How to Save Money",
    image: "https://images.unsplash.com/photo-1559779085-2090b6ce411b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWRqb3VybmV5JTIwc3Vuc2V0JTIwZGVzZXJ0fGVufDF8fHx8MTc1ODgyNjYxMnww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "AI",
    categoryColor: "bg-orange-500",
    author: "GamsGo Team",
    date: "2025-09-24",
    readTime: "6 min",
    views: "9.8k"
  },
  {
    id: "4",
    title: "How to Get Free ChatGPT Plus in 2025 (10 Proven Ways)",
    image: "https://images.unsplash.com/photo-1678347123725-2d0d31bc06bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGF0R1BUJTIwYXJ0aWZpY2lhbCUyMGludGVsbGlnZW5jZXxlbnwxfHx8fDE3NTg4MjY2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "AI",
    categoryColor: "bg-green-500",
    author: "GamsGo Team",
    date: "2025-09-22",
    readTime: "12 min",
    views: "25.1k"
  },
  {
    id: "5",
    title: "Tidal vs Spotify: Full Review of Top Music Streaming 2025",
    image: "https://images.unsplash.com/photo-1496957961599-e35b69ef5d7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0cmVhbWluZyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzU4ODI2NjE1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Music",
    categoryColor: "bg-red-500",
    author: "GamsGo Team",
    date: "2025-09-24",
    readTime: "7 min",
    views: "14.7k"
  },
  {
    id: "6",
    title: "How to Get Peacock TV for Free in 2025",
    image: "https://images.unsplash.com/photo-1623477366900-c17509c5bf21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjb2NrJTIwdHYlMjBzdHJlYW1pbmd8ZW58MXx8fHwxNzU4ODI2NjE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "SVOD",
    categoryColor: "bg-yellow-500",
    author: "GamsGo Team",
    date: "2025-09-17",
    readTime: "4 min",
    views: "8.3k"
  },
  {
    id: "7",
    title: "Peacock TV Reviews: The Best Affordable Streaming Service Worth Trying",
    image: "https://images.unsplash.com/photo-1623477366900-c17509c5bf21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjb2NrJTIwdHYlMjBzdHJlYW1pbmd8ZW58MXx8fHwxNzU4ODI2NjE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "SVOD",
    categoryColor: "bg-yellow-500",
    author: "GamsGo Team",
    date: "2025-09-15",
    readTime: "6 min",
    views: "11.2k"
  },
  {
    id: "8",
    title: "Spotify vs Amazon Music: Which One is Better in 2025?",
    image: "https://images.unsplash.com/photo-1730818027473-176ab8a3bb4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWF6b24lMjBzcG90aWZ5JTIwbXVzaWN8ZW58MXx8fHwxNzU4ODI2NjIyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Music",
    categoryColor: "bg-blue-500",
    author: "GamsGo Team",
    date: "2025-09-22",
    readTime: "10 min",
    views: "16.9k"
  },
  {
    id: "9",
    title: "Best VPN Services 2025: Complete Security Review",
    image: "https://images.unsplash.com/photo-1655036387197-566206c80980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxWUE4lMjBjeWJlcnNlY3VyaXR5JTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTg4MjY4NDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Software",
    categoryColor: "bg-indigo-500",
    author: "GamsGo Team",
    date: "2025-09-21",
    readTime: "15 min",
    views: "22.4k"
  },
  {
    id: "10",
    title: "Gaming in 2025: Best Streaming Platforms and Services",
    image: "https://images.unsplash.com/photo-1758179762049-615d9aac58ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzdHJlYW1pbmclMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1ODgyNjg0OXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Gaming",
    categoryColor: "bg-pink-500",
    author: "GamsGo Team",
    date: "2025-09-20",
    readTime: "8 min",
    views: "19.1k"
  },
  {
    id: "11",
    title: "Software Development Trends 2025: What's Next?",
    image: "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc1ODc4ODU2NXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Software",
    categoryColor: "bg-teal-500",
    author: "GamsGo Team",
    date: "2025-09-19",
    readTime: "11 min",
    views: "13.8k"
  },
  {
    id: "12",
    title: "Ultimate Tutorial: Setting Up Your First Development Environment",
    image: "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc1ODc4ODU2NXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Tutorial",
    categoryColor: "bg-cyan-500",
    author: "GamsGo Team",
    date: "2025-09-18",
    readTime: "20 min",
    views: "31.5k"
  }
];

const popularBlogs = [
  { id: "1", title: "How to Watch Members-Only Videos on YouTube for Free (2025)" },
  { id: "2", title: "ChatGPT Pricing 2025: Find the Right Plan for You" },
  { id: "3", title: "How to Get Free ChatGPT Plus in 2025 (10 Proven Ways)" },
  { id: "4", title: "MidJourney Pricing 2025: Which Plan is the Best for You?" },
  { id: "5", title: "Gamma AI App Review 2025: Best Free AI Slide Generator?" },
  { id: "6", title: "Is MidJourney Free in 2025? Plans, Price & How to Save Money" },
  { id: "7", title: "ChatGPT Plus Review 2025: Worth Paying $20?" },
  { id: "8", title: "GPT-5 Is Coming August 2025: Everything You Need to Know" },
  { id: "9", title: "How to Get Disney Plus for Free in 2025" },
  { id: "10", title: "Netflix Standard vs Premium: Which to Pick in 2025?" }
];

const subscriptionServices = [
  { name: "Spotify", color: "bg-green-500", textColor: "text-white" },
  { name: "YouTube", color: "bg-red-500", textColor: "text-white" },
  { name: "ChatGPT", color: "bg-gray-600", textColor: "text-white" },
  { name: "Netflix", color: "bg-red-600", textColor: "text-white" }
];

const hotTags = ["SVOD", "AI", "YouTube", "Tutorial", "ChatGPT", "Software", "Netflix", "Gamma", "Music", "Gaming"];

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const postsPerPage = 8;
  
  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(blogPosts.map(post => post.category))).sort();
  }, []);
  
  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === null || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);
  
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const displayedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag.toLowerCase());
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Enhanced Header */}
      <header className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-block p-3 bg-white/10 rounded-full mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">G</span>
            </div>
          </div>
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
            GamsGo Blog
          </h1>
          <p className="text-red-100 text-lg max-w-2xl mx-auto">
            Discover the latest subscription offers, cutting-edge software tutorials, and trending tech news
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar onSearch={handleSearch} value={searchQuery} />
            </div>

            {/* Category Filter */}
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />

            {/* Results Count */}
            {(searchQuery || selectedCategory) && (
              <div className="mb-6 text-sm text-gray-600">
                {filteredPosts.length} results 
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory && ` in ${selectedCategory}`}
              </div>
            )}

            {/* Blog Posts Grid or Empty State */}
            {displayedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {displayedPosts.map((post) => (
                    <BlogPost key={post.id} {...post} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalPosts={filteredPosts.length}
                  postsPerPage={postsPerPage}
                />
              </>
            ) : (
              <EmptyState
                type={searchQuery ? "search" : "category"}
                query={searchQuery}
                onReset={handleReset}
              />
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Sidebar
              popularBlogs={popularBlogs}
              subscriptionServices={subscriptionServices}
              hotTags={hotTags}
              onTagClick={handleTagClick}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}