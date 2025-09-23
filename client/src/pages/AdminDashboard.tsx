import { Package, FolderTree, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useProducts, useCategories } from "@/lib/content-service";

export default function AdminDashboard() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      description: "Active products in catalog",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/products"
    },
    {
      title: "Categories",
      value: categories.length,
      description: "Product categories",
      icon: FolderTree,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/admin/categories"
    },
    {
      title: "In Stock",
      value: products.filter(p => p.inStock).length,
      description: "Available products",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/admin/products"
    },
    {
      title: "Featured Items",
      value: products.filter(p => p.featured).length,
      description: "Featured products",
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-dashboard-title">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Welcome to your TechShop admin panel
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
              Recent Products
            </CardTitle>
            <CardDescription>
              Latest products added to your catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No products yet. <Link href="/admin/products"><Button variant="link" className="p-0 h-auto">Add your first product</Button></Link>
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
                          ${product.price} • {product.inStock ? 'In Stock' : 'Out of Stock'}
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
            <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
            <CardDescription>
              Common admin tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/products">
              <Button className="w-full justify-start" variant="outline" data-testid="quick-add-product">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button className="w-full justify-start" variant="outline" data-testid="quick-manage-categories">
                <FolderTree className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/pages">
              <Button className="w-full justify-start" variant="outline" data-testid="quick-manage-pages">
                <FileText className="mr-2 h-4 w-4" />
                Manage Pages
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full justify-start" variant="outline" data-testid="quick-view-website">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Website
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}