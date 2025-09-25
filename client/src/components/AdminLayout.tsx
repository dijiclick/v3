import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  BookOpen,
  Hash,
  Bookmark,
  PenTool,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { AdminLanguageProvider, useAdminLanguage } from "@/contexts/AdminLanguageContext";
import AdminLanguageSwitcher from "@/components/AdminLanguageSwitcher";

// Create navigation items function that uses translations
const getAdminNavItems = (t: (key: string) => string) => [
  { path: "/admin", icon: LayoutDashboard, label: t('nav.dashboard') },
  { path: "/admin/products", icon: Package, label: t('nav.products') },
  { path: "/admin/categories", icon: FolderTree, label: t('nav.categories') },
  { path: "/admin/pages", icon: FileText, label: t('nav.pages') },
  { 
    path: "/admin/blog", 
    icon: BookOpen, 
    label: t('nav.blog'),
    subItems: [
      { path: "/admin/blog", icon: PenTool, label: t('nav.blog.dashboard') },
      { path: "/admin/blog/posts", icon: FileText, label: t('nav.blog.posts') },
      { path: "/admin/blog/authors", icon: Users, label: t('nav.blog.authors') },
      { path: "/admin/blog/categories", icon: FolderTree, label: t('nav.blog.categories') },
      { path: "/admin/blog/tags", icon: Hash, label: t('nav.blog.tags') },
    ]
  },
  { path: "/admin/settings", icon: Settings, label: t('nav.settings') },
];

// Internal bilingual layout component
function BilingualAdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { logout } = useAdminAuth();
  const { toast } = useToast();
  const { language, isRTL, t } = useAdminLanguage();
  
  const adminNavItems = getAdminNavItems(t);

  const handleLogout = () => {
    logout();
    toast({
      title: t('message.success.logout'),
      description: t('message.success.logout_desc'),
    });
    window.location.href = "/admin";
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 z-50 w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out ${
        isRTL 
          ? `right-0 border-l lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
          : `left-0 border-r lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
      }`}>
        <div className={`flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Limitpass
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            data-testid="close-sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = location === item.path;
              const isBlogSection = location.startsWith('/admin/blog');
              const showSubItems = item.subItems && (isBlogSection || isActive);
              
              return (
                <div key={item.path}>
                  <Link href={item.path}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full ${isRTL ? 'justify-end' : 'justify-start'} ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${
                        isActive || (item.subItems && isBlogSection)
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      data-testid={`admin-nav-${item.label.toLowerCase()}`}
                    >
                      <item.icon className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                      {item.label}
                    </Button>
                  </Link>
                  
                  {/* Sub-navigation items */}
                  {showSubItems && (
                    <div className={`${isRTL ? 'mr-4' : 'ml-4'} mt-1 space-y-1`}>
                      {item.subItems.map((subItem) => {
                        const isSubActive = location === subItem.path;
                        return (
                          <Link key={subItem.path} href={subItem.path}>
                            <Button
                              variant={isSubActive ? "secondary" : "ghost"}
                              size="sm"
                              className={`w-full ${isRTL ? 'justify-end' : 'justify-start'} ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${
                                isSubActive
                                  ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white" 
                                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                              }`}
                              data-testid={`admin-nav-blog-${subItem.label.toLowerCase()}`}
                            >
                              <subItem.icon className={`h-3 w-3 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                              {subItem.label}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link href="/">
              <Button
                variant="ghost"
                className={`w-full ${isRTL ? 'justify-end' : 'justify-start'} ${isRTL ? 'flex-row-reverse' : 'flex-row'} text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`}
                data-testid="back-to-website"
              >
                <Home className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                {t('nav.back_to_website')}
              </Button>
            </Link>
            <Button
              variant="ghost"
              className={`w-full ${isRTL ? 'justify-end' : 'justify-start'} ${isRTL ? 'flex-row-reverse' : 'flex-row'} text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mt-1`}
              onClick={handleLogout}
              data-testid="admin-logout"
            >
              <LogOut className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {t('nav.logout')}
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className={isRTL ? 'lg:pr-64' : 'lg:pl-64'}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center justify-between h-16 px-4 sm:px-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="open-sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('nav.admin_panel')}
              </span>
              <AdminLanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Main AdminLayout component with language provider
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminLanguageProvider>
      <BilingualAdminLayout>{children}</BilingualAdminLayout>
    </AdminLanguageProvider>
  );
}