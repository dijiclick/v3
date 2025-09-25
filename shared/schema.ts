import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, jsonb, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  buyLink: text("buy_link"),
  mainDescription: jsonb("main_description"),
  featuredTitle: text("featured_title"),
  featuredFeatures: text("featured_features").array(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  categoryId: varchar("category_id").references(() => categories.id),
  image: text("image"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  inStock: boolean("in_stock").default(true),
  featured: boolean("featured").default(false),
  layoutStyle: text("layout_style").default("chatgpt"),
  tags: text("tags").array(),
  // ChatGPT-style layout fields
  heroSection: jsonb("hero_section"),
  pricingPlans: jsonb("pricing_plans"),
  screenshots: jsonb("screenshots"),
  statisticsSection: jsonb("statistics_section"),
  benefitsSection: jsonb("benefits_section"),
  sidebarContent: jsonb("sidebar_content"),
  footerCTA: jsonb("footer_cta"),
  blogContent: jsonb("blog_content"), // Rich text blog content in Gutenberg-style format
  createdAt: timestamp("created_at").defaultNow(),
});

export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: jsonb("content"), // Rich text content as JSON
  status: text("status").default("draft"), // draft, published
  showInNavigation: boolean("show_in_navigation").default(false),
  navigationOrder: integer("navigation_order").default(0),
  featuredImage: text("featured_image"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  productId: varchar("product_id").references(() => products.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const productPlans = pgTable("product_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Plan name like "پلان فوری", "پلان مشترک"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  description: text("description"), // Optional plan description
  isDefault: boolean("is_default").default(false), // Mark default plan
  sortOrder: integer("sort_order").default(0), // For ordering plans
  isActive: boolean("is_active").default(true), // Enable/disable plans
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogAuthors = pgTable("blog_authors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio"),
  email: text("email"),
  avatar: text("avatar"),
  website: text("website"),
  twitter: text("twitter"),
  linkedin: text("linkedin"),
  github: text("github"),
  telegram: text("telegram"),
  jobTitle: text("job_title"),
  company: text("company"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array(),
  featured: boolean("featured").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogCategories = pgTable("blog_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: varchar("parent_id"), // Self-reference for hierarchy - constraint defined separately
  color: text("color"), // hex code for UI
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array(),
  featured: boolean("featured").default(false),
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Define the self-referencing foreign key constraint here to avoid circular reference
  parentReference: foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
  }).onDelete("set null"),
}));

export const blogTags = pgTable("blog_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color"), // hex code for UI
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: jsonb("content"), // JSONB for rich content blocks
  authorId: varchar("author_id").references(() => blogAuthors.id),
  categoryId: varchar("category_id").references(() => blogCategories.id),
  tags: text("tags").array(), // text array for tag slugs
  featuredImage: text("featured_image"),
  featuredImageAlt: text("featured_image_alt"),
  status: text("status").default("draft"), // draft, published, archived
  readingTime: integer("reading_time"), // integer minutes
  viewCount: integer("view_count").default(0),
  shareCount: integer("share_count").default(0),
  featured: boolean("featured").default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array(),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Schema for user responses (without password)
export const userResponseSchema = createInsertSchema(users).omit({
  passwordHash: true,
}).extend({
  id: z.string(),
  createdAt: z.date().optional(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Zod schemas for ChatGPT-style layout fields
export const heroSectionSchema = z.object({
  titleOverride: z.string().optional(),
  subtitle: z.string().optional(),
  heroIcon: z.string().optional(),
  features: z.array(z.string()).optional(),
  rtlDirection: z.boolean().optional(),
}).optional();

export const pricingPlanSchema = z.object({
  duration: z.string(),
  price: z.string(),
  originalPrice: z.string().optional(),
  discount: z.string().optional(),
  priceNumber: z.number().optional(),
  popular: z.boolean().optional(),
  features: z.array(z.string()).optional(),
});

export const screenshotSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  gradient: z.string().optional(),
  icon: z.string().optional(),
});

export const statisticSchema = z.object({
  icon: z.string().optional(),
  value: z.string(),
  label: z.string(),
});

export const statisticsSectionSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  backgroundGradient: z.string().optional(),
  statistics: z.array(statisticSchema).optional(),
}).optional();

export const benefitSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
  gradient: z.string().optional(),
});

export const benefitsSectionSchema = z.object({
  title: z.string().optional(),
  benefits: z.array(benefitSchema).optional(),
}).optional();

export const howItWorksStepSchema = z.object({
  step: z.string(),
  title: z.string(),
  description: z.string(),
});

export const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const recommendationSchema = z.object({
  icon: z.string(),
  name: z.string(),
  price: z.string(),
  backgroundColor: z.string().optional(),
});

export const sidebarContentSchema = z.object({
  howItWorks: z.array(howItWorksStepSchema).optional(),
  faqs: z.array(faqSchema).optional(),
  recommendations: z.array(recommendationSchema).optional(),
}).optional();

export const footerCTASchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  supportingLinks: z.any().optional(),
}).optional();

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  buyLink: z.string().url().optional().or(z.literal("")),
  mainDescription: z.any().optional(), // Rich text JSON format
  featuredTitle: z.string().optional(),
  featuredFeatures: z.array(z.string().min(1)).optional(),
  layoutStyle: z.string().optional().default("chatgpt"),
  heroSection: heroSectionSchema,
  pricingPlans: z.array(pricingPlanSchema).optional(),
  screenshots: z.array(screenshotSchema).optional(),
  statisticsSection: statisticsSectionSchema,
  benefitsSection: benefitsSectionSchema,
  sidebarContent: sidebarContentSchema,
  footerCTA: footerCTASchema,
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  uploadedAt: true,
}).extend({
  filename: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().regex(/^(image|video|audio|application)\//),
  size: z.number().positive(),
  url: z.string().url(),
  productId: z.string().optional(),
});

export const insertProductPlanSchema = createInsertSchema(productPlans).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Plan name is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  originalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format").optional().or(z.literal("")),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const insertBlogAuthorSchema = createInsertSchema(blogAuthors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Author name is required"),
  slug: z.string().min(1, "Author slug is required"),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  telegram: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format").optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const insertBlogTagSchema = createInsertSchema(blogTags).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Tag name is required"),
  slug: z.string().min(1, "Tag slug is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format").optional(),
  featured: z.boolean().optional(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
}).extend({
  title: z.string().min(1, "Post title is required"),
  slug: z.string().min(1, "Post slug is required"),
  excerpt: z.string().optional(),
  content: z.any().optional(), // Rich text JSON format
  authorId: z.string().min(1, "Author is required"),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  readingTime: z.number().int().min(0).optional(),
  viewCount: z.number().int().min(0).optional(),
  shareCount: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type InsertProductPlan = z.infer<typeof insertProductPlanSchema>;
export type ProductPlan = typeof productPlans.$inferSelect;
export type InsertBlogAuthor = z.infer<typeof insertBlogAuthorSchema>;
export type BlogAuthor = typeof blogAuthors.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogTag = z.infer<typeof insertBlogTagSchema>;
export type BlogTag = typeof blogTags.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Blog Search Analytics Tables
export const blogSearchAnalytics = pgTable("blog_search_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  searchQuery: text("search_query").notNull(),
  searchScope: text("search_scope").default("all"), // all, title, content, authors, tags
  filters: jsonb("filters"), // Applied filters as JSON
  resultsCount: integer("results_count").notNull(),
  clickedResultId: varchar("clicked_result_id"), // If user clicked on a result
  sessionId: text("session_id"), // For tracking user sessions
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  responseTime: integer("response_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogSearchSuggestions = pgTable("blog_search_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull().unique(),
  frequency: integer("frequency").default(1),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogSavedSearches = pgTable("blog_saved_searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // User-defined name for the search
  searchQuery: text("search_query").notNull(),
  filters: jsonb("filters"), // Search filters as JSON
  sessionId: text("session_id"), // For guest users
  isPublic: boolean("is_public").default(false),
  useCount: integer("use_count").default(1),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Search Analytics Schemas
export const insertBlogSearchAnalyticsSchema = createInsertSchema(blogSearchAnalytics).omit({
  id: true,
  createdAt: true,
}).extend({
  searchQuery: z.string().min(1, "Search query is required"),
  searchScope: z.enum(["all", "title", "content", "authors", "tags"]).optional(),
  filters: z.any().optional(),
  resultsCount: z.number().int().min(0),
  clickedResultId: z.string().optional(),
  sessionId: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  responseTime: z.number().int().min(0).optional(),
});

export const insertBlogSearchSuggestionSchema = createInsertSchema(blogSearchSuggestions).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
}).extend({
  query: z.string().min(1, "Search query is required"),
  frequency: z.number().int().min(1).optional(),
});

export const insertBlogSavedSearchSchema = createInsertSchema(blogSavedSearches).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
}).extend({
  name: z.string().min(1, "Search name is required"),
  searchQuery: z.string().min(1, "Search query is required"),
  filters: z.any().optional(),
  sessionId: z.string().optional(),
  isPublic: z.boolean().optional(),
  useCount: z.number().int().min(1).optional(),
});

export type InsertBlogSearchAnalytics = z.infer<typeof insertBlogSearchAnalyticsSchema>;
export type BlogSearchAnalytics = typeof blogSearchAnalytics.$inferSelect;
export type InsertBlogSearchSuggestion = z.infer<typeof insertBlogSearchSuggestionSchema>;
export type BlogSearchSuggestion = typeof blogSearchSuggestions.$inferSelect;
export type InsertBlogSavedSearch = z.infer<typeof insertBlogSavedSearchSchema>;
export type BlogSavedSearch = typeof blogSavedSearches.$inferSelect;

// Cart types for frontend
export const cartItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  image: z.string().optional(),
  quantity: z.number().min(1),
  color: z.string().optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
