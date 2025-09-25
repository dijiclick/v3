import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";
import { defaultSEO, getHomepageStructuredData, getOrganizationStructuredData } from "@/lib/seo";
import { useFeaturedProducts, useCategories } from "@/lib/content-service";
import { Product, Category } from "@/types";
import ComprehensiveSearch from "@/components/ComprehensiveSearch";

// Hook to detect responsive grid columns
function useResponsiveColumns() {
  const [columns, setColumns] = useState(4); // Default to desktop
  
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) {
        setColumns(1); // Mobile
      } else if (window.innerWidth < 1024) {
        setColumns(2); // Tablet
      } else {
        setColumns(4); // Desktop
      }
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);
  
  return columns;
}

interface ServiceCard {
  id: string;
  name: string;
  type: string;
  price: string;
  originalPrice: string | null;
  period: string;
  logo: string;
  features: string[];
  category: string;
  status: string;
  slug: string;
  categoryId: string | null;
  // New schema fields
  featured: boolean | null;
  buyLink: string | null;
}

// Utility function to format prices in Persian Toman
const formatPersianPrice = (price: string | null): string => {
  if (!price) return "0";
  const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
  return Math.round(numericPrice).toLocaleString('fa-IR');
};

// Transform CMS Product to HomePage ServiceCard format
function transformProductToServiceCard(product: Product, categories: Category[] = []) {
  // Use featuredFeatures if available, otherwise extract from description or use default
  const features = product.featured && product.featuredFeatures && product.featuredFeatures.length > 0
    ? product.featuredFeatures.slice(0, 5)
    : product.description 
      ? product.description.split('\n').filter(line => line.trim().length > 0).slice(0, 5)
      : [`دسترسی کامل به ${product.title}`, 'پشتیبانی فنی', 'کیفیت بالا'];

  // Default logo based on product title
  const titleToCheck = product.title.toLowerCase();
  let logo = '📦';
  if (titleToCheck.includes('chatgpt') || titleToCheck.includes('جی‌پی‌تی')) logo = '🤖';
  else if (titleToCheck.includes('netflix') || titleToCheck.includes('نتفلیکس')) logo = '🎬';
  else if (titleToCheck.includes('spotify') || titleToCheck.includes('اسپاتیفای')) logo = '🎵';
  else if (titleToCheck.includes('youtube') || titleToCheck.includes('یوتیوب')) logo = '📺';
  else if (titleToCheck.includes('adobe') || titleToCheck.includes('ادوبی')) logo = '🎨';

  // Use actual category from database if available, otherwise fallback to title-based detection
  let category = "software";
  let type = "سرویس پریمیوم";
  
  if (product.categoryId) {
    const productCategory = categories.find(cat => cat.id === product.categoryId);
    if (productCategory) {
      category = productCategory.slug;
      type = productCategory.name;
    }
  } else {
    // Fallback to title-based detection for products without categoryId
    if (titleToCheck.includes('جی‌پی‌تی') || titleToCheck.includes('chatgpt')) {
      category = "ai";
      type = "هوش مصنوعی";
    } else if (titleToCheck.includes('نتفلیکس') || titleToCheck.includes('یوتیوب') || titleToCheck.includes('آمازون')) {
      category = "svod"; 
      type = "پلتفرم ویدئو";
    } else if (titleToCheck.includes('اسپاتیفای') || titleToCheck.includes('اپل موزیک')) {
      category = "music";
      type = "پلتفرم موسیقی";
    } else if (titleToCheck.includes('ادوبی')) {
      category = "creative";
      type = "نرم‌افزار طراحی";
    }
  }

  return {
    id: product.id,
    name: product.title,
    type,
    price: formatPersianPrice(product.price),
    originalPrice: product.originalPrice ? formatPersianPrice(product.originalPrice) : null,
    period: "تومان / ماه",
    logo,
    features,
    category,
    status: product.inStock ? "active" : "inactive",
    slug: product.slug,
    categoryId: product.categoryId,
    // New featured fields
    featured: product.featured,
    buyLink: product.buyLink
  };
}

// No additional products for load more functionality
const additionalProducts: ServiceCard[] = [];

// Icon mapping by category slug
const categoryIconMap: Record<string, string> = {
  svod: "🎬",
  music: "🎵",
  ai: "🤖",
  software: "💻",
  seo: "📈",
  creative: "🎨",
  education: "📚",
  cloud: "☁️"
};

// Fallback icon for categories not in the mapping
const fallbackIcon = "📦";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentLang, setCurrentLang] = useState("fa");
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const { toast } = useToast();
  
  // Get current responsive columns and calculate initial visible count
  const columns = useResponsiveColumns();
  const initialVisibleCount = columns * 2; // Two rows
  
  // Reset showAllProducts when category changes (category-scoped expansion)
  useEffect(() => {
    setShowAllProducts(false);
  }, [activeCategory]);

  // Handle category change with instant filtering
  const handleCategoryChange = useCallback((categoryId: string) => {
    if (categoryId === activeCategory) return;
    setActiveCategory(categoryId);
  }, [activeCategory]);

  // Fetch all products and categories from the database
  const { data: products = [], isLoading: productsLoading, error: productsError } = useFeaturedProducts();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const [, setLocation] = useLocation();

  // Helper function to get product URL
  const getProductUrl = useCallback((service: ServiceCard) => {
    if (service.slug && service.categoryId) {
      const category = categories.find(cat => cat.id === service.categoryId);
      if (category) {
        return `/${category.slug}/${service.slug}`;
      }
    } else if (service.slug && service.category) {
      return `/${service.category}/${service.slug}`;
    }
    return "#";
  }, [categories]);

  // Handle card click navigation
  const handleCardClick = useCallback((service: ServiceCard) => {
    const url = getProductUrl(service);
    if (url !== "#") {
      setLocation(url);
    }
  }, [getProductUrl, setLocation]);

  // Build dynamic filter categories from database categories
  const filterCategories = useMemo(() => {
    const dynamicCategories = [
      { id: "all", label: "همه", icon: "⚡" }
    ];
    
    // Add database categories
    categories.forEach(category => {
      dynamicCategories.push({
        id: category.slug,
        label: category.name,
        icon: categoryIconMap[category.slug] || fallbackIcon
      });
    });
    
    return dynamicCategories;
  }, [categories]);

  // Memoize the transformation of products to service cards
  const services = useMemo(() => {
    if (products.length > 0 && categories.length > 0) {
      // Show all products (removed featured-only filter)
      return products.map(product => transformProductToServiceCard(product, categories));
    }
    return [];
  }, [products, categories]);

  // Get featured product text for hero section
  const featuredHeroText = useMemo(() => {
    const featuredProducts = products.filter(product => product.featured);
    if (featuredProducts.length > 0) {
      // Use the first featured product's text, or combine multiple if needed
      return "دسترسی به تمام اشتراک های پریمیوم در یک جا";
    }
    return "دسترسی به تمام اشتراک های پریمیوم در یک جا"; // Fallback to original text
  }, [products]);

  useSEO({
    title: "لیمیت پس - اشتراک پریمیوم مشترک با قیمت پایین‌تر",
    description: "خرید اشتراک مشترک Netflix, Spotify, YouTube Premium, Adobe و سرویس‌های دیگر با قیمت پایین‌تر از لیمیت پس. دسترسی آسان و کیفیت پریمیوم",
    keywords: "اشتراک مشترک، Netflix، Spotify، YouTube Premium، Adobe، قیمت ارزان، لیمیت پس، اشتراک ایرانی",
    ogTitle: "لیمیت پس - اشتراک پریمیوم مشترک با قیمت پایین‌تر",
    ogDescription: "خرید اشتراک مشترک Netflix, Spotify, YouTube Premium, Adobe و سرویس‌های دیگر با قیمت پایین‌تر از لیمیت پس",
    ogUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    ogType: 'website',
    ogLocale: 'fa_IR',
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
    robots: 'index, follow',
    hreflang: 'fa',
    structuredData: [
      getHomepageStructuredData(),
      getOrganizationStructuredData()
    ]
  });

  // Enhanced search function that normalizes Persian and English text
  const normalizeSearchText = useCallback((text: string) => {
    return text
      .toLowerCase()
      .trim()
      // Normalize Persian characters
      .replace(/ک/g, 'ك')
      .replace(/ی/g, 'ي')
      // Remove diacritics and special characters for better matching
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
      // Handle common English-Persian character mappings
      .replace(/youtube/gi, 'یوتیوب')
      .replace(/netflix/gi, 'نتفلیکس')
      .replace(/spotify/gi, 'اسپاتیفای')
      .replace(/chatgpt/gi, 'جی‌پی‌تی')
      .replace(/adobe/gi, 'ادوبی');
  }, []);

  // Enhanced search across multiple fields
  const searchInAllFields = useCallback((service: ServiceCard, searchTerm: string) => {
    const normalizedSearchTerm = normalizeSearchText(searchTerm);
    
    // Search in service name
    if (normalizeSearchText(service.name).includes(normalizedSearchTerm)) {
      return true;
    }
    
    // Search in service type
    if (normalizeSearchText(service.type).includes(normalizedSearchTerm)) {
      return true;
    }
    
    // Search in features
    if (service.features.some(feature => 
      normalizeSearchText(feature).includes(normalizedSearchTerm)
    )) {
      return true;
    }
    
    // Search in category name (find category by service.category)
    const serviceCategory = categories.find(cat => cat.slug === service.category);
    if (serviceCategory && normalizeSearchText(serviceCategory.name).includes(normalizedSearchTerm)) {
      return true;
    }
    
    // Search by original product data if available
    const originalProduct = products.find(p => p.id === service.id);
    if (originalProduct) {
      // Search in description
      if (originalProduct.description && 
          normalizeSearchText(originalProduct.description).includes(normalizedSearchTerm)) {
        return true;
      }
      
      // Search in featured features
      if (originalProduct.featuredFeatures && 
          originalProduct.featuredFeatures.some(feature => 
            normalizeSearchText(feature).includes(normalizedSearchTerm)
          )) {
        return true;
      }
    }
    
    return false;
  }, [normalizeSearchText, categories, products]);

  // Memoize the filtered services to prevent unnecessary re-computations
  const filteredServices = useMemo(() => {
    let filtered = services;
    
    // Apply category filter first
    if (activeCategory !== "all") {
      filtered = filtered.filter(service => service.category === activeCategory);
    }
    
    // Apply search filter if search term exists
    if (searchTerm && searchTerm.trim().length > 0) {
      filtered = filtered.filter(service => searchInAllFields(service, searchTerm));
    }
    
    return filtered;
  }, [searchTerm, activeCategory, services, searchInAllFields]);

  // Display limited services - show initialVisibleCount initially unless showAllProducts is true
  const displayedServices = useMemo(() => {
    if (showAllProducts || searchTerm) {
      return filteredServices;
    }
    return filteredServices.slice(0, initialVisibleCount);
  }, [filteredServices, showAllProducts, searchTerm, initialVisibleCount]);

  // Text direction detection for search input
  const detectTextDirection = (value: string) => {
    const englishRegex = /^[a-zA-Z0-9\s@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~!]+$/;
    return englishRegex.test(value.trim()) ? 'ltr' : 'rtl';
  };

  // Load more products functionality (disabled since additionalProducts is empty)
  const loadMoreProducts = useCallback(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      // Note: services is now memoized, so we would need a different approach
      // For now, this functionality is disabled as additionalProducts is empty
      setShowLoadMore(false);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-500 font-vazir" dir="rtl">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-400 to-red-500 py-10 text-center text-white">
        <div 
          className="text-3xl font-light mb-8 opacity-95 max-w-4xl mx-auto px-5" 
          data-testid="text-hero-title"
        >
          دسترسی به همه اشتراک ها در یک جا
        </div>
        
        {/* Comprehensive Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 px-5">
          <ComprehensiveSearch 
            placeholder="جستجو در محصولات و مقالات..."
            className="max-w-full"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap px-5">
          {filterCategories.map((category) => {
            return (
              <div
                key={category.id}
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all p-3 rounded-2xl min-w-20 ${
                  activeCategory === category.id
                    ? 'bg-white text-red-500 border-2 border-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => handleCategoryChange(category.id)}
                data-testid={`tab-category-${category.id}`}
              >
                <span className="text-3xl mb-1">
                  {category.icon}
                </span>
                <span className={`text-sm font-bold transition-colors ${
                  activeCategory === category.id ? 'text-red-500' : 'text-white'
                }`}>
                  {category.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-white -mt-5 pt-10 pb-10 rounded-t-3xl min-h-screen">
        <div className="max-w-7xl mx-auto px-5">

          {/* Loading States */}
          {(categoriesLoading || productsLoading) && (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 text-gray-600">
                <span className="text-3xl">⏳</span>
                <p className="text-lg font-medium">در حال بارگذاری محصولات...</p>
              </div>
            </div>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5 mb-10">
            {!categoriesLoading && !productsLoading && displayedServices.map((service, index) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all h-[480px] flex flex-col relative cursor-pointer"
                data-testid={`card-service-${service.id}`}
                onClick={() => handleCardClick(service)}
              >
                
                
                {/* Card Top */}
                <div className={`p-5 min-h-[180px] flex flex-col justify-between ${
                  service.status === 'inactive' 
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' 
                    : 'bg-gradient-to-br from-red-400 to-red-500 text-white'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                      service.status === 'inactive' 
                        ? 'bg-gray-500/20 text-gray-800' 
                        : 'bg-white/20 text-white'
                    }`}>
                      {service.logo}
                    </div>
                    <div className="text-center flex-1">
                      <h3 className={`text-lg font-bold ${
                        service.status === 'inactive' ? 'text-gray-800' : 'text-white'
                      }`} data-testid={`text-service-name-${service.id}`}>{service.name}</h3>
                      
                      
                      <p className={`text-sm mt-1 ${
                        service.status === 'inactive' ? 'text-gray-700' : 'text-white/80'
                      }`}>{service.type}</p>
                    </div>
                  </div>
                  
                  <div className="text-center mt-auto">
                    {/* Show original price crossed out if available */}
                    {service.originalPrice && parseFloat(service.originalPrice.replace(/[^\d]/g, '')) > parseFloat(service.price.replace(/[^\d]/g, '')) && (
                      <div className={`text-sm line-through mb-1 ${
                        service.status === 'inactive' ? 'text-gray-600' : 'text-white/60'
                      }`}>
                        {service.originalPrice} تومان
                      </div>
                    )}
                    
                    <div className={`text-4xl font-black leading-none ${
                      service.status === 'inactive' ? 'text-gray-800' : 'text-white'
                    }`} data-testid={`text-service-price-${service.id}`}>{service.price}</div>
                    <div className={`text-base mt-1 ${
                      service.status === 'inactive' ? 'text-gray-700' : 'text-white/80'
                    }`}>{service.period}</div>
                    
                    {/* Discount badge if applicable */}
                    {service.originalPrice && parseFloat(service.originalPrice.replace(/[^\d]/g, '')) > parseFloat(service.price.replace(/[^\d]/g, '')) && (
                      <div className="mt-2">
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                          {Math.round(((parseFloat(service.originalPrice.replace(/[^\d]/g, '')) - parseFloat(service.price.replace(/[^\d]/g, ''))) / parseFloat(service.originalPrice.replace(/[^\d]/g, ''))) * 100)}% تخفیف
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <ul className="list-none space-y-3 flex-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 pr-5 relative leading-relaxed text-right">
                        <span className="absolute right-0 text-green-500 font-bold text-base">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {service.status === 'inactive' ? (
                    <button 
                      disabled
                      className="block w-full py-4 px-4 rounded-xl text-base font-bold transition-all text-gray-500 uppercase tracking-wide bg-gray-300 cursor-not-allowed opacity-60 text-center"
                      data-testid={`button-purchase-${service.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      ناموجود
                    </button>
                  ) : (
                    <>
                      {/* Primary Buy Now Button (using buyLink if available) */}
                      {service.buyLink ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(service.buyLink || '', '_blank', 'noopener,noreferrer');
                          }}
                          className="block w-full py-4 px-4 rounded-xl text-base font-bold transition-all text-white uppercase tracking-wide bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/40 text-center mb-2"
                          data-testid={`button-buy-now-${service.id}`}
                        >
                          <span className="mr-2">🔗</span>
                          خرید فوری
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show toast message for missing buy link
                            toast({
                              title: "توجه",
                              description: "لینک خرید مستقیم موجود نیست. لطفاً با پشتیبانی تماس بگیرید.",
                              variant: "destructive"
                            });
                          }}
                          className="block w-full py-4 px-4 rounded-xl text-base font-bold transition-all text-white uppercase tracking-wide bg-gray-500 hover:bg-gray-600 text-center"
                          data-testid={`button-purchase-${service.id}`}
                        >
                          تماس با پشتیبانی
                        </button>
                      )}
                    </>
                  )}
                  
                  <div className="text-center mt-3">
                    <a 
                      href={getProductUrl(service)} 
                      className="text-red-500 text-sm font-medium hover:underline" 
                      data-testid={`link-details-${service.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      نمایش جزئیات
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Show All Products Button */}
          {!showAllProducts && filteredServices.length > initialVisibleCount && searchTerm === "" && (
            <div className="text-center mb-10">
              <button
                onClick={() => setShowAllProducts(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-2xl font-bold text-lg hover:from-red-500 hover:to-red-600 transition-all"
                data-testid="button-show-all-products"
              >
                <span>📦</span>
                نمایش همه محصولات
                <span className="text-xl">←</span>
              </button>
            </div>
          )}
          
          {filteredServices.length === 0 && !categoriesLoading && !productsLoading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">نتیجه‌ای یافت نشد</h3>
              <p className="text-gray-500 text-lg mb-4" data-testid="text-no-results">
                {searchTerm ? 
                  `هیچ محصولی برای "${searchTerm}" یافت نشد.` : 
                  'سرویسی در این دسته‌بندی موجود نیست.'
                }
              </p>
              {searchTerm && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    پیشنهادات:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• املای کلمات را بررسی کنید</li>
                    <li>• از کلمات کلیدی مختلف استفاده کنید</li>
                    <li>• در دسته‌بندی "همه" جستجو کنید</li>
                  </ul>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setActiveCategory('all');
                    }}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    data-testid="button-clear-search"
                  >
                    نمایش همه محصولات
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Load More Section */}
          {additionalProducts.length > 0 && showLoadMore && (
            <section className="text-center my-10">
              <button 
                onClick={loadMoreProducts}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full font-bold text-lg hover:from-red-500 hover:to-red-600 hover:-translate-y-1 hover:shadow-lg transition-all ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                data-testid="button-load-more"
              >
                {isLoading ? (
                  <>
                    <span className="text-2xl animate-spin">⏳</span>
                    در حال بارگذاری...
                  </>
                ) : (
                  <>
                    نمایش محصولات اصلی
                    <span className="text-2xl">⭐</span>
                  </>
                )}
              </button>
            </section>
          )}

          {/* Can't Find Section */}
          <section className="bg-gradient-to-br from-orange-100 to-orange-200 p-10 rounded-3xl my-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-radial from-orange-300/20 to-transparent rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-radial from-orange-400/10 to-transparent rounded-full translate-x-10 translate-y-10"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-5">سرویس مورد نظرتان را پیدا نکردید؟</h2>
              <p className="text-base text-gray-600 mb-6">
                با ویژگی "درخواست محصول" می‌توانید سرویس دلخواه خود را درخواست دهید و ما آن را برای شما تهیه می‌کنیم.
              </p>
              <a 
                href="#" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                data-testid="button-request-product"
              >
                درخواست محصول
                <span>✨</span>
              </a>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="text-center py-16">
            <div className="mb-12">
              <p className="text-gray-600 text-base mb-2 font-medium">۴ مرحله ساده</p>
              <h2 className="text-4xl font-bold text-gray-800 relative inline-block">
                چگونه کار می‌کند؟
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-400 to-red-500 rounded"></div>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { icon: "🔍", title: "انتخاب کنید", description: "از بین بیش از ۳۰۰+ سرویس موجود" },
                { icon: "💳", title: "پرداخت کنید", description: "به صورت آنلاین و امن" },
                { icon: "🔑", title: "دسترسی به اشتراک", description: "اطلاعات ورود را دریافت کنید" },
                { icon: "🎉", title: "از سرویس لذت ببرید", description: "تا پایان مدت اشتراک" }
              ].map((step, index) => (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl hover:border-red-200 transition-all"
                  data-testid={`step-${index + 1}`}
                >
                  <div className="text-5xl mb-5 flex items-center justify-center h-20">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Advantages Section */}
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 rounded-3xl my-10">
            <div className="text-center mb-12">
              <p className="text-3xl font-bold text-gray-800">⭐ ۹۸٪ کاربران از خدمات لیمیت‌پس راضی بوده‌اند و ما را به دیگران معرفی کرده‌اند ⭐</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { icon: "🔒", title: "امن و مطمئن", description: "تمام اشتراک‌ها از طریق روش‌های امن تهیه می‌شوند" },
                { icon: "💰", title: "صرفه‌جویی", description: "با لیمیت‌پس تا ۷۰٪ کمتر پرداخت کنید و همان سرویس را دریافت کنید" },
                { icon: "⚡", title: "فوری", description: "در کمتر از ۱۰ دقیقه اشتراک خود را فعال کنید و استفاده را شروع کنید" },
                { icon: "🎯", title: "با کیفیت", description: "همه اشتراک‌ها کیفیت پریمیوم دارند" }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="text-center"
                  data-testid={`feature-${index + 1}`}
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
