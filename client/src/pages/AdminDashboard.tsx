import { Package, FolderTree, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useProducts, useCategories } from "@/lib/content-service";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

// Utility function to format prices in Persian Toman
const formatPersianPrice = (price: string | null): string => {
  if (!price) return "0";
  const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
  return Math.round(numericPrice).toLocaleString('fa-IR');
};

export default function AdminDashboard() {
  const { t, isRTL } = useAdminLanguage();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  const stats = [
    {
      title: t('dashboard.stats.total_products'),
      value: products.length,
      description: t('dashboard.stats.total_products_desc'),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/products"
    },
    {
      title: t('dashboard.stats.categories'),
      value: categories.length,
      description: t('dashboard.stats.categories_desc'),
      icon: FolderTree,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/admin/categories"
    },
    {
      title: t('dashboard.stats.in_stock'),
      value: products.filter(p => p.inStock).length,
      description: t('dashboard.stats.in_stock_desc'),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/admin/products"
    },
    {
      title: t('dashboard.stats.featured_items'),
      value: products.filter(p => p.featured).length,
      description: t('dashboard.stats.featured_items_desc'),
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/admin/products"
    }
  ];

  const recentProducts = products
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  // Helper function to construct product URL
  const getProductUrl = (product: any) => {
    if (categories && product.categoryId) {
      const category = categories.find(cat => cat.id === product.categoryId);
      if (category) {
        return `/${category.slug}/${product.slug}`;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-dashboard-title">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`stats-card-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <Package className="mr-2 h-5 w-5" />
              {t('dashboard.recent_products')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.recent_products_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('dashboard.no_products')}<Link href="/admin/products"><Button variant="link" className="p-0 h-auto">{t('dashboard.add_first_product')}</Button></Link>
              </p>
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product, index) => {
                  const productUrl = getProductUrl(product);
                  const content = (
                    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatPersianPrice(product.price)} تومان • {product.inStock ? t('dashboard.in_stock') : t('dashboard.out_of_stock')}
                        </p>
                      </div>
                    </div>
                  );
                  
                  return productUrl ? (
                    <Link key={product.id} href={productUrl} data-testid={`recent-product-link-${product.id}`}>
                      {content}
                    </Link>
                  ) : (
                    <div key={product.id} data-testid={`recent-product-${product.id}`}>
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">{t('dashboard.quick_actions')}</CardTitle>
            <CardDescription>
              {t('dashboard.quick_actions_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/products">
              <Button className="w-full justify-start" variant="outline" data-testid="quick-add-product">
                <Package className="mr-2 h-4 w-4" />
                {t('dashboard.add_new_product')}
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button className="w-full justify-start" variant="outline" data-testid="quick-manage-categories">
                <FolderTree className="mr-2 h-4 w-4" />
                {t('dashboard.manage_categories')}
              </Button>
            </Link>
            <Link href="/admin/pages">
              <Button className="w-full justify-start" variant="outline" data-testid="quick-manage-pages">
                <FileText className="mr-2 h-4 w-4" />
                {t('dashboard.manage_pages')}
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full justify-start" variant="outline" data-testid="quick-view-website">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('dashboard.view_website')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}