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
    
    // Auth (AdminAuth.tsx)
    'auth.verifying': 'Verifying Authentication...',
    'auth.secure_portal': 'Secure Admin Portal Access',
    'auth.admin_password': 'Admin Password',
    'auth.password_placeholder': 'Enter your secure password',
    'auth.remember_me': 'Remember my login preference',
    'auth.authenticating': 'Authenticating...',
    'auth.access_panel': 'Access Admin Panel',
    'auth.welcome_back': 'Welcome Back!',
    'auth.redirecting': 'Redirecting to admin dashboard...',
    'auth.secure_connection': 'Secure Connection',
    'auth.protected_portal': 'Protected Portal',
    'auth.demo_access': 'Demo Access',
    'auth.password_label': 'Password:',
    'auth.login_attempts': 'Login attempts:',
    'auth.verify_password': 'Please verify your password',
    'auth.access_granted': 'Access Granted Successfully!',
    'auth.invalid_password': 'Invalid password. Please try again.',
    'auth.network_error': 'Network error. Please check your connection and try again.',
    
    // SEO (SEOPreview.tsx)
    'seo.preview': 'SEO Preview',
    'seo.google_preview': 'Google Search Results Preview:',
    'seo.title_length': 'Title length: {count} characters',
    'seo.optimal': 'Optimal',
    'seo.too_short': 'Too Short',
    'seo.too_long': 'Too Long',
    'seo.title_length_desc': 'Optimal title length is between 30 and 60 characters',
    'seo.description_length': 'Description length: {count} characters',
    'seo.description_length_desc': 'Optimal description length is between 120 and 160 characters',
    'seo.social_preview': 'Social Media Preview:',
    'seo.product_image': 'Product Image',
    'seo.tips_title': 'SEO Tips:',
    'seo.tip_keywords': 'Use relevant keywords in the title',
    'seo.tip_description': 'Fill in the short description - it will be shown in search results',
    'seo.tip_images': 'Add high-quality images for social media display',
    'seo.tip_url': 'Keep the slug URL-friendly',
    
    // Products
    'product.add': 'Add New Product',
    'product.edit': 'Edit Product',
    'product.back_to_list': 'Back to Products List',
    'product.add_new': 'Add your new product to the store',
    'product.edit_info': 'Edit product information: {title}',
    'product.loading': 'Loading product...',
    'product.error_loading': 'Error Loading Product',
    'product.not_found': 'Product not found or an error occurred.',
    'product.updated': 'Product updated successfully! You can continue editing or make additional changes.',
    
    // Page Form
    'page.edit': 'Edit Page',
    'page.add': 'Add New Page',
    'page.basic_info': 'Basic Information',
    'page.title': 'Page Title',
    'page.title_placeholder': 'Enter page title',
    'page.slug': 'URL Slug',
    'page.slug_placeholder': 'page-url-slug',
    'page.url_preview': 'URL: /{slug}',
    'page.description': 'Description',
    'page.description_placeholder': 'Brief description of the page',
    'page.content': 'Content',
    'page.content_placeholder': 'Page content...',
    'page.content_note': 'Basic text content. Rich formatting coming soon.',
    'page.status_nav': 'Status & Navigation',
    'page.status': 'Status',
    'page.status_placeholder': 'Select status',
    'page.status_draft': 'Draft',
    'page.status_published': 'Published',
    'page.show_in_nav': 'Show in main navigation',
    'page.nav_order': 'Navigation Order',
    'page.nav_order_note': 'Lower numbers appear first in navigation',
    'page.seo_optional': 'SEO (Optional)',
    'page.seo_title': 'SEO Title',
    'page.seo_title_placeholder': 'Custom title for search engines',
    'page.seo_description': 'SEO Description',
    'page.seo_description_placeholder': 'Meta description for search engines',
    'page.seo_keywords': 'SEO Keywords',
    'page.seo_keywords_placeholder': 'keyword1, keyword2, keyword3',
    'page.seo_keywords_note': 'Separate keywords with commas',
    'page.creating': 'Creating...',
    'page.updating': 'Updating...',
    'page.create': 'Create Page',
    'page.update': 'Update Page',
    
    // Blog specific
    'blog.unknown_author': 'Unknown Author',
    'blog.uncategorized': 'Uncategorized',
    'blog.never': 'Never',
    'blog.invalid_date': 'Invalid date',
    'blog.post_deleted': 'Blog post deleted successfully!',
    'blog.delete_error': 'Failed to delete blog post: {error}',
    'blog.category_deleted': 'Blog category deleted successfully',
    'blog.category_delete_error': 'Error deleting blog category',
    'blog.something_wrong': 'Something went wrong',
    'blog.bulk_delete_completed': 'Bulk delete completed',
    'blog.bulk_categories_deleted': '{count} blog categories deleted successfully',
    'blog.bulk_delete_error': 'Error bulk deleting blog categories',
    'blog.confirm_delete_category': 'Are you sure you want to delete this blog category?',
    'blog.reading_time': '{minutes} minute',
    'blog.reading_time_plural': '{minutes} minutes',
    'blog.featured_badge': 'Featured',
    
    // Common UI
    'ui.required': 'Required',
    'ui.optional': 'Optional',
    'ui.select_all': 'Select All',
    'ui.clear_all': 'Clear All',
    'ui.bulk_actions': 'Bulk Actions',
    'ui.no_items': 'No items found',
    'ui.showing_results': 'Showing {start} to {end} of {total} results',
    'ui.previous': 'Previous',
    'ui.next': 'Next',
    'ui.page': 'Page',
    'ui.of': 'of',
    'ui.rows_per_page': 'Rows per page',
    
    // Dashboard (AdminDashboard.tsx)
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to your TechShop admin panel',
    'dashboard.stats.total_products': 'Total Products',
    'dashboard.stats.total_products_desc': 'Active products in catalog',
    'dashboard.stats.categories': 'Categories',
    'dashboard.stats.categories_desc': 'Product categories',
    'dashboard.stats.in_stock': 'In Stock',
    'dashboard.stats.in_stock_desc': 'Available products',
    'dashboard.stats.featured_items': 'Featured Items',
    'dashboard.stats.featured_items_desc': 'Featured products',
    'dashboard.recent_products': 'Recent Products',
    'dashboard.recent_products_desc': 'Latest products added to your catalog',
    'dashboard.no_products': 'No products yet. ',
    'dashboard.add_first_product': 'Add your first product',
    'dashboard.in_stock': 'In Stock',
    'dashboard.out_of_stock': 'Out of Stock',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.quick_actions_desc': 'Common admin tasks',
    'dashboard.add_new_product': 'Add New Product',
    'dashboard.manage_categories': 'Manage Categories',
    'dashboard.manage_pages': 'Manage Pages',
    'dashboard.view_website': 'View Website',
    
    // Settings (AdminSettings.tsx)
    'settings.title': 'Settings',
    'settings.desc': 'Manage your website configuration and preferences',
    'settings.system_status': 'System Status',
    'settings.system_status_desc': 'Current status of your TechShop application',
    'settings.status.website_online': 'Website Online',
    'settings.status.database_connected': 'Database Connected',
    'settings.status.admin_panel_active': 'Admin Panel Active',
    'settings.status.sanity_cms_active': 'Sanity CMS Active',
    'settings.status.database_mode': 'Database Mode',
    'settings.configure': 'Configure',
    'settings.cms_integration': 'Content Management Integration',
    'settings.cms_integration_desc': 'Current content management setup and options',
    
    // Settings Cards
    'settings.card.content_management.title': 'Content Management',
    'settings.card.content_management.desc': 'Configure your content source and CMS settings',
    'settings.card.content_management.status.sanity': 'Sanity CMS',
    'settings.card.content_management.status.database': 'Database',
    'settings.card.content_management.item.content_source_sanity': 'Content Source: Sanity CMS',
    'settings.card.content_management.item.content_source_db': 'Content Source: PostgreSQL Database',
    'settings.card.content_management.item.auto_sync_enabled': 'Auto-sync: Enabled',
    'settings.card.content_management.item.auto_sync_manual': 'Auto-sync: Manual',
    'settings.card.content_management.item.content_types': 'Content Types: Products, Categories, Pages',
    
    'settings.card.website.title': 'Website Settings',
    'settings.card.website.desc': 'General website configuration and preferences',
    'settings.card.website.status': 'Active',
    'settings.card.website.item.seo': 'SEO Optimization: Enabled',
    'settings.card.website.item.opengraph': 'Open Graph Tags: Configured',
    'settings.card.website.item.structured_data': 'Structured Data: Active',
    'settings.card.website.item.mobile_responsive': 'Mobile Responsive: Yes',
    
    'settings.card.theme.title': 'Theme & Appearance',
    'settings.card.theme.desc': 'Customize the look and feel of your website',
    'settings.card.theme.status': 'Default Theme',
    'settings.card.theme.item.color_scheme': 'Color Scheme: Professional Blue',
    'settings.card.theme.item.dark_mode': 'Dark Mode: Supported',
    'settings.card.theme.item.typography': 'Typography: Inter Font Family',
    'settings.card.theme.item.layout': 'Layout: Modern Grid',
    
    'settings.card.security.title': 'Security',
    'settings.card.security.desc': 'Admin access and security settings',
    'settings.card.security.status': 'Protected',
    'settings.card.security.item.admin_auth': 'Admin Authentication: Password Protected',
    'settings.card.security.item.session_mgmt': 'Session Management: Browser Storage',
    'settings.card.security.item.https': 'HTTPS: Enforced',
    'settings.card.security.item.cors': 'CORS: Configured',
    
    // Settings Toast Messages
    'settings.toast.content_management.title': 'Content Management',
    'settings.toast.content_management.desc_sanity': 'Sanity CMS configuration is handled through your Sanity Studio dashboard.',
    'settings.toast.content_management.desc_database': 'Database content is managed through the Products, Categories, and Pages sections of this admin panel.',
    'settings.toast.website.title': 'Website Settings',
    'settings.toast.website.desc': 'SEO, Open Graph, and structured data settings are automatically optimized. Theme customization is available in the next section.',
    'settings.toast.theme.title': 'Theme & Appearance',
    'settings.toast.theme.desc': 'Your website uses a modern responsive design with dark mode support. Advanced theme customization is coming soon.',
    'settings.toast.security.title': 'Security Settings',
    'settings.toast.security.desc': 'Your admin panel is password-protected with session management. Use HTTPS in production for secure connections.',
    'settings.toast.coming_soon': 'Configuration options for this section are coming soon.',
    
    // Settings CMS Integration
    'settings.cms.sanity_integration': 'Sanity CMS Integration',
    'settings.cms.database_management': 'Database Content Management',
    'settings.cms.sanity_desc': 'Your content is managed through Sanity CMS with real-time updates',
    'settings.cms.database_desc': 'Your content is stored in PostgreSQL database with API access',
    'settings.cms.status.cms_active': 'CMS Active',
    'settings.cms.status.database_mode': 'Database Mode',
    'settings.cms.features_available': 'Features available:',
    'settings.cms.features_sanity': 'Rich content editor, Image optimization, Real-time preview, Version control',
    'settings.cms.features_database': 'Direct database access, API endpoints, Fast queries, Simple management',
    
    // Blog Dashboard (AdminBlogDashboard.tsx)
    'blog.dashboard.total_posts': 'Total Posts',
    'blog.dashboard.total_posts_desc': 'All blog posts',
    'blog.dashboard.published_posts': 'Published Posts',
    'blog.dashboard.published_posts_desc': 'Live on website',
    'blog.dashboard.draft_posts': 'Draft Posts',
    'blog.dashboard.draft_posts_desc': 'Unpublished drafts',
    'blog.dashboard.total_views': 'Total Views',
    'blog.dashboard.total_views_desc': 'All-time page views',
    'blog.dashboard.post_status_updated': 'Post status updated successfully!',
    'blog.dashboard.post_status_failed': 'Failed to update post status:',
    'blog.dashboard.post_updated': 'Post updated successfully!',
    'blog.dashboard.post_update_failed': 'Failed to update post:',
    'blog.dashboard.unknown_author': 'Unknown Author',
    'blog.dashboard.uncategorized': 'Uncategorized',
    'blog.dashboard.never': 'Never',
    'blog.dashboard.recent_posts': 'Recent Posts',
    'blog.dashboard.recent_posts_desc': 'Latest blog posts you\'ve written',
    'blog.dashboard.no_posts': 'No blog posts yet',
    'blog.dashboard.create_first_post': 'Create Your First Post',
    'blog.dashboard.quick_actions': 'Quick Actions',
    'blog.dashboard.quick_actions_desc': 'Common blog management tasks',
    'blog.dashboard.new_post': 'New Post',
    'blog.dashboard.manage_categories': 'Manage Categories',
    'blog.dashboard.manage_authors': 'Manage Authors',
    'blog.dashboard.manage_tags': 'Manage Tags',
    
    // Blog Posts Page (AdminBlogPosts.tsx)
    'blog.posts.all_statuses': 'All statuses',
    'blog.posts.all_categories': 'All categories',
    'blog.posts.all_authors': 'All authors',
    'blog.posts.bulk_actions': 'Bulk actions',
    'blog.posts.no_posts_filter': 'No posts match your filters',
    'blog.posts.no_posts_yet': 'No blog posts yet',
    'blog.posts.posts_updated': 'Posts updated successfully!',
    'blog.posts.posts_update_failed': 'Failed to update posts:',
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
    
    // Auth (AdminAuth.tsx)
    'auth.verifying': 'در حال تأیید هویت...',
    'auth.secure_portal': 'دسترسی امن به پنل مدیریت',
    'auth.admin_password': 'رمز عبور مدیر',
    'auth.password_placeholder': 'رمز عبور امن خود را وارد کنید',
    'auth.remember_me': 'ترجیح ورود من را به خاطر بسپار',
    'auth.authenticating': 'در حال احراز هویت...',
    'auth.access_panel': 'دسترسی به پنل مدیریت',
    'auth.welcome_back': 'خوش آمدید!',
    'auth.redirecting': 'در حال انتقال به داشبورد مدیریت...',
    'auth.secure_connection': 'اتصال امن',
    'auth.protected_portal': 'پورتال محافظت شده',
    'auth.demo_access': 'دسترسی نمایشی',
    'auth.password_label': 'رمز عبور:',
    'auth.login_attempts': 'تعداد تلاش‌های ورود:',
    'auth.verify_password': 'لطفاً رمز عبور خود را تأیید کنید',
    'auth.access_granted': 'دسترسی با موفقیت اعطا شد!',
    'auth.invalid_password': 'رمز عبور نامعتبر. لطفاً دوباره تلاش کنید.',
    'auth.network_error': 'خطای شبکه. لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.',
    
    // SEO (SEOPreview.tsx)
    'seo.preview': 'پیش‌نمایش سئو',
    'seo.google_preview': 'پیش‌نمایش نتایج جستجوی گوگل:',
    'seo.title_length': 'طول عنوان: {count} کاراکتر',
    'seo.optimal': 'بهینه',
    'seo.too_short': 'خیلی کوتاه',
    'seo.too_long': 'خیلی طولانی',
    'seo.title_length_desc': 'طول بهینه عنوان بین ۳۰ تا ۶۰ کاراکتر است',
    'seo.description_length': 'طول توضیحات: {count} کاراکتر',
    'seo.description_length_desc': 'طول بهینه توضیحات بین ۱۲۰ تا ۱۶۰ کاراکتر است',
    'seo.social_preview': 'پیش‌نمایش شبکه‌های اجتماعی:',
    'seo.product_image': 'تصویر محصول',
    'seo.tips_title': 'نکات سئو:',
    'seo.tip_keywords': 'از کلمات کلیدی مناسب در عنوان استفاده کنید',
    'seo.tip_description': 'توضیحات کوتاه را پر کنید - در نتایج جستجو نمایش داده می‌شود',
    'seo.tip_images': 'تصاویر با کیفیت بالا برای نمایش در شبکه‌های اجتماعی اضافه کنید',
    'seo.tip_url': 'نامک را سازگار با URL نگه دارید',
    
    // Products
    'product.add': 'افزودن محصول جدید',
    'product.edit': 'ویرایش محصول',
    'product.back_to_list': 'بازگشت به لیست محصولات',
    'product.add_new': 'محصول جدید خود را به فروشگاه اضافه کنید',
    'product.edit_info': 'ویرایش اطلاعات محصول: {title}',
    'product.loading': 'در حال بارگذاری محصول...',
    'product.error_loading': 'خطا در بارگذاری محصول',
    'product.not_found': 'محصول یافت نشد یا خطایی رخ داده است.',
    'product.updated': 'محصول با موفقیت به‌روزرسانی شد! می‌توانید ادامه ویرایش یا تغییرات اضافی انجام دهید.',
    
    // Page Form
    'page.edit': 'ویرایش صفحه',
    'page.add': 'افزودن صفحه جدید',
    'page.basic_info': 'اطلاعات پایه',
    'page.title': 'عنوان صفحه',
    'page.title_placeholder': 'عنوان صفحه را وارد کنید',
    'page.slug': 'نامک URL',
    'page.slug_placeholder': 'نامک-url-صفحه',
    'page.url_preview': 'URL: /{slug}',
    'page.description': 'توضیحات',
    'page.description_placeholder': 'توضیح مختصر صفحه',
    'page.content': 'محتوا',
    'page.content_placeholder': 'محتوای صفحه...',
    'page.content_note': 'محتوای متنی ساده. قالب‌بندی پیشرفته به زودی.',
    'page.status_nav': 'وضعیت و ناوبری',
    'page.status': 'وضعیت',
    'page.status_placeholder': 'وضعیت را انتخاب کنید',
    'page.status_draft': 'پیش‌نویس',
    'page.status_published': 'منتشر شده',
    'page.show_in_nav': 'نمایش در ناوبری اصلی',
    'page.nav_order': 'ترتیب ناوبری',
    'page.nav_order_note': 'اعداد کمتر ابتدا در ناوبری ظاهر می‌شوند',
    'page.seo_optional': 'سئو (اختیاری)',
    'page.seo_title': 'عنوان سئو',
    'page.seo_title_placeholder': 'عنوان سفارشی برای موتورهای جستجو',
    'page.seo_description': 'توضیحات سئو',
    'page.seo_description_placeholder': 'توضیحات متا برای موتورهای جستجو',
    'page.seo_keywords': 'کلمات کلیدی سئو',
    'page.seo_keywords_placeholder': 'کلمه‌کلیدی۱، کلمه‌کلیدی۲، کلمه‌کلیدی۳',
    'page.seo_keywords_note': 'کلمات کلیدی را با کاما از هم جدا کنید',
    'page.creating': 'در حال ایجاد...',
    'page.updating': 'در حال به‌روزرسانی...',
    'page.create': 'ایجاد صفحه',
    'page.update': 'به‌روزرسانی صفحه',
    
    // Blog specific
    'blog.unknown_author': 'نویسنده نامشخص',
    'blog.uncategorized': 'بدون دسته‌بندی',
    'blog.never': 'هرگز',
    'blog.invalid_date': 'تاریخ نامعتبر',
    'blog.post_deleted': 'نوشته وبلاگ با موفقیت حذف شد!',
    'blog.delete_error': 'خطا در حذف نوشته وبلاگ: {error}',
    'blog.category_deleted': 'دسته‌بندی وبلاگ با موفقیت حذف شد',
    'blog.category_delete_error': 'خطا در حذف دسته‌بندی وبلاگ',
    'blog.something_wrong': 'مشکلی پیش آمده است',
    'blog.bulk_delete_completed': 'حذف گروهی تکمیل شد',
    'blog.bulk_categories_deleted': '{count} دسته‌بندی وبلاگ با موفقیت حذف شدند',
    'blog.bulk_delete_error': 'خطا در حذف گروهی دسته‌بندی‌های وبلاگ',
    'blog.confirm_delete_category': 'آیا مطمئن هستید که می‌خواهید این دسته‌بندی وبلاگ را حذف کنید؟',
    'blog.reading_time': '{minutes} دقیقه',
    'blog.reading_time_plural': '{minutes} دقیقه',
    'blog.featured_badge': 'ویژه',
    
    // Common UI
    'ui.required': 'اجباری',
    'ui.optional': 'اختیاری',
    'ui.select_all': 'انتخاب همه',
    'ui.clear_all': 'پاک کردن همه',
    'ui.bulk_actions': 'عملیات گروهی',
    'ui.no_items': 'آیتمی یافت نشد',
    'ui.showing_results': 'نمایش {start} تا {end} از {total} نتیجه',
    'ui.previous': 'قبلی',
    'ui.next': 'بعدی',
    'ui.page': 'صفحه',
    'ui.of': 'از',
    'ui.rows_per_page': 'ردیف در هر صفحه',
    
    // Dashboard (AdminDashboard.tsx)
    'dashboard.title': 'داشبورد',
    'dashboard.welcome': 'به پنل مدیریت تک‌شاپ خوش آمدید',
    'dashboard.stats.total_products': 'کل محصولات',
    'dashboard.stats.total_products_desc': 'محصولات فعال در کاتالوگ',
    'dashboard.stats.categories': 'دسته‌بندی‌ها',
    'dashboard.stats.categories_desc': 'دسته‌بندی‌های محصول',
    'dashboard.stats.in_stock': 'موجود در انبار',
    'dashboard.stats.in_stock_desc': 'محصولات موجود',
    'dashboard.stats.featured_items': 'آیتم‌های ویژه',
    'dashboard.stats.featured_items_desc': 'محصولات ویژه',
    'dashboard.recent_products': 'محصولات اخیر',
    'dashboard.recent_products_desc': 'آخرین محصولات اضافه شده به کاتالوگ شما',
    'dashboard.no_products': 'هنوز محصولی وجود ندارد. ',
    'dashboard.add_first_product': 'اولین محصول خود را اضافه کنید',
    'dashboard.in_stock': 'موجود در انبار',
    'dashboard.out_of_stock': 'ناموجود',
    'dashboard.quick_actions': 'اقدامات سریع',
    'dashboard.quick_actions_desc': 'وظایف رایج مدیریت',
    'dashboard.add_new_product': 'افزودن محصول جدید',
    'dashboard.manage_categories': 'مدیریت دسته‌بندی‌ها',
    'dashboard.manage_pages': 'مدیریت صفحات',
    'dashboard.view_website': 'مشاهده وب‌سایت',
    
    // Settings (AdminSettings.tsx)
    'settings.title': 'تنظیمات',
    'settings.desc': 'مدیریت پیکربندی و ترجیحات وب‌سایت شما',
    'settings.system_status': 'وضعیت سیستم',
    'settings.system_status_desc': 'وضعیت فعلی اپلیکیشن تک‌شاپ شما',
    'settings.status.website_online': 'وب‌سایت آنلاین',
    'settings.status.database_connected': 'پایگاه داده متصل',
    'settings.status.admin_panel_active': 'پنل مدیریت فعال',
    'settings.status.sanity_cms_active': 'Sanity CMS فعال',
    'settings.status.database_mode': 'حالت پایگاه داده',
    'settings.configure': 'پیکربندی',
    'settings.cms_integration': 'یکپارچگی مدیریت محتوا',
    'settings.cms_integration_desc': 'تنظیم و گزینه‌های فعلی مدیریت محتوا',
    
    // Settings Cards
    'settings.card.content_management.title': 'مدیریت محتوا',
    'settings.card.content_management.desc': 'پیکربندی منبع محتوا و تنظیمات CMS',
    'settings.card.content_management.status.sanity': 'Sanity CMS',
    'settings.card.content_management.status.database': 'پایگاه داده',
    'settings.card.content_management.item.content_source_sanity': 'منبع محتوا: Sanity CMS',
    'settings.card.content_management.item.content_source_db': 'منبع محتوا: پایگاه داده PostgreSQL',
    'settings.card.content_management.item.auto_sync_enabled': 'همگام‌سازی خودکار: فعال',
    'settings.card.content_management.item.auto_sync_manual': 'همگام‌سازی خودکار: دستی',
    'settings.card.content_management.item.content_types': 'انواع محتوا: محصولات، دسته‌بندی‌ها، صفحات',
    
    'settings.card.website.title': 'تنظیمات وب‌سایت',
    'settings.card.website.desc': 'پیکربندی کلی وب‌سایت و ترجیحات',
    'settings.card.website.status': 'فعال',
    'settings.card.website.item.seo': 'بهینه‌سازی سئو: فعال',
    'settings.card.website.item.opengraph': 'تگ‌های Open Graph: پیکربندی شده',
    'settings.card.website.item.structured_data': 'داده‌های ساختاریافته: فعال',
    'settings.card.website.item.mobile_responsive': 'واکنش‌گرا موبایل: بله',
    
    'settings.card.theme.title': 'پوسته و ظاهر',
    'settings.card.theme.desc': 'سفارشی‌سازی ظاهر وب‌سایت شما',
    'settings.card.theme.status': 'پوسته پیش‌فرض',
    'settings.card.theme.item.color_scheme': 'طرح رنگ: آبی حرفه‌ای',
    'settings.card.theme.item.dark_mode': 'حالت تاریک: پشتیبانی می‌شود',
    'settings.card.theme.item.typography': 'تایپوگرافی: خانواده فونت Inter',
    'settings.card.theme.item.layout': 'چیدمان: شبکه مدرن',
    
    'settings.card.security.title': 'امنیت',
    'settings.card.security.desc': 'دسترسی مدیر و تنظیمات امنیتی',
    'settings.card.security.status': 'محافظت شده',
    'settings.card.security.item.admin_auth': 'احراز هویت مدیر: محافظت شده با رمز عبور',
    'settings.card.security.item.session_mgmt': 'مدیریت جلسه: ذخیره‌سازی مرورگر',
    'settings.card.security.item.https': 'HTTPS: اجباری',
    'settings.card.security.item.cors': 'CORS: پیکربندی شده',
    
    // Settings Toast Messages
    'settings.toast.content_management.title': 'مدیریت محتوا',
    'settings.toast.content_management.desc_sanity': 'پیکربندی Sanity CMS از طریق داشبورد Sanity Studio شما انجام می‌شود.',
    'settings.toast.content_management.desc_database': 'محتوای پایگاه داده از طریق بخش‌های محصولات، دسته‌بندی‌ها و صفحات این پنل مدیریت مدیریت می‌شود.',
    'settings.toast.website.title': 'تنظیمات وب‌سایت',
    'settings.toast.website.desc': 'تنظیمات سئو، Open Graph و داده‌های ساختاریافته به طور خودکار بهینه شده‌اند. سفارشی‌سازی پوسته در بخش بعدی موجود است.',
    'settings.toast.theme.title': 'پوسته و ظاهر',
    'settings.toast.theme.desc': 'وب‌سایت شما از طراحی واکنش‌گرای مدرن با پشتیبانی حالت تاریک استفاده می‌کند. سفارشی‌سازی پیشرفته پوسته به زودی.',
    'settings.toast.security.title': 'تنظیمات امنیتی',
    'settings.toast.security.desc': 'پنل مدیریت شما با رمز عبور محافظت شده و مدیریت جلسه دارد. در تولید از HTTPS برای اتصالات امن استفاده کنید.',
    'settings.toast.coming_soon': 'گزینه‌های پیکربندی برای این بخش به زودی.',
    
    // Settings CMS Integration
    'settings.cms.sanity_integration': 'یکپارچگی Sanity CMS',
    'settings.cms.database_management': 'مدیریت محتوای پایگاه داده',
    'settings.cms.sanity_desc': 'محتوای شما از طریق Sanity CMS با به‌روزرسانی‌های زمان واقعی مدیریت می‌شود',
    'settings.cms.database_desc': 'محتوای شما در پایگاه داده PostgreSQL با دسترسی API ذخیره می‌شود',
    'settings.cms.status.cms_active': 'CMS فعال',
    'settings.cms.status.database_mode': 'حالت پایگاه داده',
    'settings.cms.features_available': 'قابلیت‌های موجود:',
    'settings.cms.features_sanity': 'ویرایشگر محتوای غنی، بهینه‌سازی تصویر، پیش‌نمایش زمان واقعی، کنترل نسخه',
    'settings.cms.features_database': 'دسترسی مستقیم پایگاه داده، نقاط پایانی API، کوئری‌های سریع، مدیریت ساده',
    
    // Blog Dashboard (AdminBlogDashboard.tsx)
    'blog.dashboard.total_posts': 'کل نوشته‌ها',
    'blog.dashboard.total_posts_desc': 'همه نوشته‌های وبلاگ',
    'blog.dashboard.published_posts': 'نوشته‌های منتشر شده',
    'blog.dashboard.published_posts_desc': 'زنده در وب‌سایت',
    'blog.dashboard.draft_posts': 'نوشته‌های پیش‌نویس',
    'blog.dashboard.draft_posts_desc': 'پیش‌نویس‌های منتشر نشده',
    'blog.dashboard.total_views': 'کل بازدیدها',
    'blog.dashboard.total_views_desc': 'بازدیدهای تمام دوران صفحه',
    'blog.dashboard.post_status_updated': 'وضعیت نوشته با موفقیت به‌روزرسانی شد!',
    'blog.dashboard.post_status_failed': 'به‌روزرسانی وضعیت نوشته با خطا مواجه شد:',
    'blog.dashboard.post_updated': 'نوشته با موفقیت به‌روزرسانی شد!',
    'blog.dashboard.post_update_failed': 'به‌روزرسانی نوشته با خطا مواجه شد:',
    'blog.dashboard.unknown_author': 'نویسنده نامشخص',
    'blog.dashboard.uncategorized': 'بدون دسته‌بندی',
    'blog.dashboard.never': 'هرگز',
    'blog.dashboard.recent_posts': 'نوشته‌های اخیر',
    'blog.dashboard.recent_posts_desc': 'آخرین نوشته‌های وبلاگی که نوشته‌اید',
    'blog.dashboard.no_posts': 'هنوز نوشته‌ای در وبلاگ نیست',
    'blog.dashboard.create_first_post': 'اولین نوشته خود را ایجاد کنید',
    'blog.dashboard.quick_actions': 'اقدامات سریع',
    'blog.dashboard.quick_actions_desc': 'وظایف رایج مدیریت وبلاگ',
    'blog.dashboard.new_post': 'نوشته جدید',
    'blog.dashboard.manage_categories': 'مدیریت دسته‌بندی‌ها',
    'blog.dashboard.manage_authors': 'مدیریت نویسندگان',
    'blog.dashboard.manage_tags': 'مدیریت برچسب‌ها',
    
    // Blog Posts Page (AdminBlogPosts.tsx)
    'blog.posts.all_statuses': 'همه وضعیت‌ها',
    'blog.posts.all_categories': 'همه دسته‌بندی‌ها',
    'blog.posts.all_authors': 'همه نویسندگان',
    'blog.posts.bulk_actions': 'عملیات گروهی',
    'blog.posts.no_posts_filter': 'هیچ نوشته‌ای با فیلترهای شما مطابقت ندارد',
    'blog.posts.no_posts_yet': 'هنوز نوشته‌ای در وبلاگ نیست',
    'blog.posts.posts_updated': 'نوشته‌ها با موفقیت به‌روزرسانی شدند!',
    'blog.posts.posts_update_failed': 'به‌روزرسانی نوشته‌ها با خطا مواجه شد:',
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