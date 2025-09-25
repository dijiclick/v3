import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AdminLanguage = 'en' | 'fa';

interface AdminLanguageContextType {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.pages': 'Pages',
    'nav.blog': 'Blog',
    'nav.blog.dashboard': 'Blog Dashboard',
    'nav.blog.posts': 'Blog Posts',
    'nav.blog.authors': 'Authors',
    'nav.blog.categories': 'Categories',
    'nav.blog.tags': 'Tags',
    'nav.settings': 'Settings',
    
    // Common Actions
    'action.add': 'Add',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.create': 'Create',
    'action.update': 'Update',
    'action.view': 'View',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.clear': 'Clear',
    'action.publish': 'Publish',
    'action.draft': 'Draft',
    'action.archive': 'Archive',
    
    // Blog Posts
    'blog.posts.title': 'Blog Posts',
    'blog.posts.add': 'Add New Post',
    'blog.posts.edit': 'Edit Post',
    'blog.posts.delete': 'Delete Post',
    'blog.posts.publish': 'Publish Post',
    'blog.posts.draft': 'Save as Draft',
    'blog.posts.search': 'Search posts...',
    'blog.posts.filter.status': 'Filter by Status',
    'blog.posts.filter.category': 'Filter by Category',
    'blog.posts.filter.author': 'Filter by Author',
    'blog.posts.status.all': 'All Posts',
    'blog.posts.status.published': 'Published',
    'blog.posts.status.draft': 'Draft',
    'blog.posts.status.archived': 'Archived',
    'blog.posts.no_posts': 'No blog posts yet',
    'blog.posts.create_first': 'Create Your First Post',
    
    // Blog Categories
    'blog.categories.title': 'Blog Categories',
    'blog.categories.add': 'Add New Category',
    'blog.categories.edit': 'Edit Category',
    'blog.categories.delete': 'Delete Category',
    'blog.categories.name': 'Category Name',
    'blog.categories.slug': 'Slug (URL-friendly name)',
    'blog.categories.description': 'Description',
    'blog.categories.parent': 'Parent Category',
    'blog.categories.color': 'Category Color',
    'blog.categories.no_parent': 'No parent (top level)',
    'blog.categories.seo.title': 'SEO Title',
    'blog.categories.seo.description': 'SEO Description',
    'blog.categories.seo.keywords': 'SEO Keywords',
    
    // Blog Tags
    'blog.tags.title': 'Blog Tags',
    'blog.tags.add': 'Add New Tag',
    'blog.tags.edit': 'Edit Tag',
    'blog.tags.delete': 'Delete Tag',
    'blog.tags.name': 'Tag Name',
    'blog.tags.slug': 'Slug (URL-friendly name)',
    'blog.tags.description': 'Description',
    'blog.tags.color': 'Tag Color',
    'blog.tags.featured': 'Featured Tag',
    
    // Blog Authors
    'blog.authors.title': 'Blog Authors',
    'blog.authors.add': 'Add New Author',
    'blog.authors.edit': 'Edit Author',
    'blog.authors.delete': 'Delete Author',
    'blog.authors.name': 'Author Name',
    'blog.authors.slug': 'Slug (URL-friendly name)',
    'blog.authors.bio': 'Bio',
    'blog.authors.email': 'Email',
    'blog.authors.website': 'Website',
    'blog.authors.social': 'Social Media',
    'blog.authors.job_title': 'Job Title',
    'blog.authors.company': 'Company',
    
    // Forms
    'form.required': 'Required',
    'form.optional': 'Optional',
    'form.placeholder.search': 'Search...',
    'form.placeholder.enter': 'Enter {field}',
    'form.validation.required': 'This field is required',
    'form.validation.email': 'Please enter a valid email address',
    'form.validation.url': 'Please enter a valid URL',
    
    // Messages
    'message.success.created': '{item} created successfully!',
    'message.success.updated': '{item} updated successfully!',
    'message.success.deleted': '{item} deleted successfully!',
    'message.error.create': 'Failed to create {item}',
    'message.error.update': 'Failed to update {item}',
    'message.error.delete': 'Failed to delete {item}',
    'message.confirm.delete': 'Are you sure you want to delete this {item}?',
    
    // General
    'general.loading': 'Loading...',
    'general.saving': 'Saving...',
    'general.deleting': 'Deleting...',
    'general.total': 'Total',
    'general.showing': 'Showing',
    'general.of': 'of',
    'general.results': 'results',
    'general.no_results': 'No results found',
    'general.language': 'Language',
    'general.switch_to_persian': 'Switch to Persian',
    'general.switch_to_english': 'Switch to English',
    
    // Navigation Additional
    'nav.back_to_website': 'Back to Website',
    'nav.logout': 'Logout',
    'nav.admin_panel': 'Admin Panel',
    
    // Messages Additional
    'message.success.logout': 'Logged Out',
    'message.success.logout_desc': 'You have been successfully logged out.',
  },
  fa: {
    // Navigation
    'nav.dashboard': 'داشبورد',
    'nav.products': 'محصولات',
    'nav.categories': 'دسته‌بندی‌ها',
    'nav.pages': 'صفحات',
    'nav.blog': 'وبلاگ',
    'nav.blog.dashboard': 'داشبورد وبلاگ',
    'nav.blog.posts': 'نوشته‌های وبلاگ',
    'nav.blog.authors': 'نویسندگان',
    'nav.blog.categories': 'دسته‌بندی‌ها',
    'nav.blog.tags': 'برچسب‌ها',
    'nav.settings': 'تنظیمات',
    
    // Common Actions
    'action.add': 'افزودن',
    'action.edit': 'ویرایش',
    'action.delete': 'حذف',
    'action.save': 'ذخیره',
    'action.cancel': 'لغو',
    'action.create': 'ایجاد',
    'action.update': 'به‌روزرسانی',
    'action.view': 'مشاهده',
    'action.search': 'جستجو',
    'action.filter': 'فیلتر',
    'action.clear': 'پاک کردن',
    'action.publish': 'انتشار',
    'action.draft': 'پیش‌نویس',
    'action.archive': 'آرشیو',
    
    // Blog Posts
    'blog.posts.title': 'نوشته‌های وبلاگ',
    'blog.posts.add': 'افزودن نوشته جدید',
    'blog.posts.edit': 'ویرایش نوشته',
    'blog.posts.delete': 'حذف نوشته',
    'blog.posts.publish': 'انتشار نوشته',
    'blog.posts.draft': 'ذخیره به عنوان پیش‌نویس',
    'blog.posts.search': 'جستجوی نوشته‌ها...',
    'blog.posts.filter.status': 'فیلتر بر اساس وضعیت',
    'blog.posts.filter.category': 'فیلتر بر اساس دسته‌بندی',
    'blog.posts.filter.author': 'فیلتر بر اساس نویسنده',
    'blog.posts.status.all': 'همه نوشته‌ها',
    'blog.posts.status.published': 'منتشر شده',
    'blog.posts.status.draft': 'پیش‌نویس',
    'blog.posts.status.archived': 'آرشیو شده',
    'blog.posts.no_posts': 'هنوز نوشته‌ای وجود ندارد',
    'blog.posts.create_first': 'اولین نوشته خود را ایجاد کنید',
    
    // Blog Categories
    'blog.categories.title': 'دسته‌بندی‌های وبلاگ',
    'blog.categories.add': 'افزودن دسته‌بندی جدید',
    'blog.categories.edit': 'ویرایش دسته‌بندی',
    'blog.categories.delete': 'حذف دسته‌بندی',
    'blog.categories.name': 'نام دسته‌بندی',
    'blog.categories.slug': 'نامک (نام سازگار با URL)',
    'blog.categories.description': 'توضیحات',
    'blog.categories.parent': 'دسته‌بندی والد',
    'blog.categories.color': 'رنگ دسته‌بندی',
    'blog.categories.no_parent': 'بدون والد (سطح بالا)',
    'blog.categories.seo.title': 'عنوان سئو',
    'blog.categories.seo.description': 'توضیحات سئو',
    'blog.categories.seo.keywords': 'کلمات کلیدی سئو',
    
    // Blog Tags
    'blog.tags.title': 'برچسب‌های وبلاگ',
    'blog.tags.add': 'افزودن برچسب جدید',
    'blog.tags.edit': 'ویرایش برچسب',
    'blog.tags.delete': 'حذف برچسب',
    'blog.tags.name': 'نام برچسب',
    'blog.tags.slug': 'نامک (نام سازگار با URL)',
    'blog.tags.description': 'توضیحات',
    'blog.tags.color': 'رنگ برچسب',
    'blog.tags.featured': 'برچسب ویژه',
    
    // Blog Authors
    'blog.authors.title': 'نویسندگان وبلاگ',
    'blog.authors.add': 'افزودن نویسنده جدید',
    'blog.authors.edit': 'ویرایش نویسنده',
    'blog.authors.delete': 'حذف نویسنده',
    'blog.authors.name': 'نام نویسنده',
    'blog.authors.slug': 'نامک (نام سازگار با URL)',
    'blog.authors.bio': 'بیوگرافی',
    'blog.authors.email': 'ایمیل',
    'blog.authors.website': 'وب‌سایت',
    'blog.authors.social': 'شبکه‌های اجتماعی',
    'blog.authors.job_title': 'عنوان شغلی',
    'blog.authors.company': 'شرکت',
    
    // Forms
    'form.required': 'اجباری',
    'form.optional': 'اختیاری',
    'form.placeholder.search': 'جستجو...',
    'form.placeholder.enter': '{field} را وارد کنید',
    'form.validation.required': 'این فیلد اجباری است',
    'form.validation.email': 'لطفاً یک آدرس ایمیل معتبر وارد کنید',
    'form.validation.url': 'لطفاً یک URL معتبر وارد کنید',
    
    // Messages
    'message.success.created': '{item} با موفقیت ایجاد شد!',
    'message.success.updated': '{item} با موفقیت به‌روزرسانی شد!',
    'message.success.deleted': '{item} با موفقیت حذف شد!',
    'message.error.create': 'ایجاد {item} با خطا مواجه شد',
    'message.error.update': 'به‌روزرسانی {item} با خطا مواجه شد',
    'message.error.delete': 'حذف {item} با خطا مواجه شد',
    'message.confirm.delete': 'آیا مطمئن هستید که می‌خواهید این {item} را حذف کنید؟',
    
    // General
    'general.loading': 'در حال بارگذاری...',
    'general.saving': 'در حال ذخیره...',
    'general.deleting': 'در حال حذف...',
    'general.total': 'مجموع',
    'general.showing': 'نمایش',
    'general.of': 'از',
    'general.results': 'نتیجه',
    'general.no_results': 'نتیجه‌ای یافت نشد',
    'general.language': 'زبان',
    'general.switch_to_persian': 'تغییر به فارسی',
    'general.switch_to_english': 'Switch to English',
    
    // Navigation Additional
    'nav.back_to_website': 'بازگشت به وب‌سایت',
    'nav.logout': 'خروج',
    'nav.admin_panel': 'پنل مدیریت',
    
    // Messages Additional
    'message.success.logout': 'خروج موفق',
    'message.success.logout_desc': 'شما با موفقیت از سیستم خارج شدید.',
  }
};

interface AdminLanguageProviderProps {
  children: ReactNode;
}

export function AdminLanguageProvider({ children }: AdminLanguageProviderProps) {
  const [language, setLanguageState] = useState<AdminLanguage>(() => {
    // Get saved language from localStorage or default to Persian
    const saved = localStorage.getItem('admin-language');
    return (saved as AdminLanguage) || 'fa';
  });

  const isRTL = language === 'fa';

  const setLanguage = (lang: AdminLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('admin-language', lang);
    
    // Update document direction
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // Initialize document direction on mount
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string, replacements?: Record<string, string>) => {
    let translation = translations[language][key] || key;
    
    // Handle replacements like {item} -> actual item name
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(`{${placeholder}}`, value);
      });
    }
    
    return translation;
  };

  return (
    <AdminLanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext);
  if (context === undefined) {
    throw new Error('useAdminLanguage must be used within an AdminLanguageProvider');
  }
  return context;
}