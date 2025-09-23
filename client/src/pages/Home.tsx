import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { defaultSEO, getHomepageStructuredData, getOrganizationStructuredData } from "@/lib/seo";
import { useProducts, useCategories } from "@/lib/content-service";
import { Product, Category } from "@/types";
import ProductCard from "@/components/ProductCard";


// No additional products for load more functionality
const additionalProducts: Product[] = [];

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

  // Fetch all products and categories from the database
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const [, setLocation] = useLocation();


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

  // Memoize the filtered products to prevent unnecessary re-computations
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (activeCategory !== "all") {
      filtered = filtered.filter(product => {
        if (product.categoryId) {
          const category = categories.find(cat => cat.id === product.categoryId);
          return category?.slug === activeCategory;
        }
        return false;
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchTerm, activeCategory, products, categories]);

  // Display limited products - only 4 initially unless showAllProducts is true
  const displayedProducts = useMemo(() => {
    if (showAllProducts || searchTerm || activeCategory !== "all") {
      return filteredProducts;
    }
    return filteredProducts.slice(0, 4);
  }, [filteredProducts, showAllProducts, searchTerm, activeCategory]);

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
        <h1 className="text-3xl font-light mb-8 opacity-95" data-testid="text-hero-title">
          دسترسی به تمام اشتراک های پریمیوم در یک جا
        </h1>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 px-5">
          <div className="flex items-center bg-white rounded-full p-2 shadow-lg border-2 border-transparent focus-within:border-red-500 focus-within:shadow-red-500/20 hover:-translate-y-1 transition-all">
            <input
              type="text"
              placeholder="جستجو در تمام اشتراک‌ها..."
              className={`flex-1 border-none outline-none px-4 py-4 text-base text-gray-700 placeholder-gray-500 transition-all ${
                searchTerm ? (detectTextDirection(searchTerm) === 'ltr' ? 'text-left' : 'text-right') : 'text-right'
              }`}
              style={{
                direction: searchTerm ? detectTextDirection(searchTerm) : 'rtl'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
            <button 
              className="bg-gradient-to-r from-red-400 to-red-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:from-red-500 hover:to-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 transition-all"
              data-testid="button-search"
            >
              جستجو
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap px-5">
          {filterCategories.map((category) => (
            <div
              key={category.id}
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all p-3 rounded-2xl min-w-20 ${
                activeCategory === category.id
                  ? 'bg-white text-red-500 border-2 border-white -translate-y-2 shadow-lg shadow-red-500/30'
                  : 'bg-white/10 hover:bg-white/20 hover:-translate-y-1'
              }`}
              onClick={() => setActiveCategory(category.id)}
              data-testid={`tab-category-${category.id}`}
            >
              <span className="text-3xl mb-1">{category.icon}</span>
              <span className={`text-sm font-bold ${
                activeCategory === category.id ? 'text-red-500' : 'text-white'
              }`}>
                {category.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-white -mt-5 pt-10 pb-10 rounded-t-3xl min-h-screen">
        <div className="max-w-7xl mx-auto px-5">
          {/* Loading States */}
          {(categoriesLoading || productsLoading) && (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 text-gray-600">
                <span className="text-3xl animate-spin">⏳</span>
                <p className="text-lg font-medium">در حال بارگذاری محصولات...</p>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5 mb-10">
            {!categoriesLoading && !productsLoading && displayedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                showShortDescription={false} 
              />
            ))}
          </div>
          
          {/* Show All Products Button */}
          {!showAllProducts && filteredProducts.length > 4 && searchTerm === "" && activeCategory === "all" && (
            <div className="text-center mb-10">
              <button
                onClick={() => setShowAllProducts(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-2xl font-bold text-lg hover:from-red-500 hover:to-red-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/30 transition-all"
                data-testid="button-show-all-products"
              >
                نمایش همه محصولات
                <span className="text-xl">📦</span>
              </button>
            </div>
          )}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg" data-testid="text-no-results">محصولی یافت نشد. لطفاً جستجوی دیگری امتحان کنید.</p>
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
