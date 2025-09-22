import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  categoryId: varchar("category_id").references(() => categories.id),
  image: text("image"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  inStock: boolean("in_stock").default(true),
  featured: boolean("featured").default(false),
  featuredAreaText: text("featured_area_text"),
  layoutStyle: text("layout_style").default("traditional"),
  tags: text("tags").array(),
  // ChatGPT-style layout fields
  heroSection: jsonb("hero_section"),
  pricingPlans: jsonb("pricing_plans"),
  screenshots: jsonb("screenshots"),
  statisticsSection: jsonb("statistics_section"),
  benefitsSection: jsonb("benefits_section"),
  sidebarContent: jsonb("sidebar_content"),
  footerCTA: jsonb("footer_cta"),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  featuredAreaText: z.string().optional(),
  layoutStyle: z.enum(["traditional", "chatgpt"]).optional().default("traditional"),
  heroSection: heroSectionSchema,
  pricingPlans: z.array(pricingPlanSchema).optional(),
  screenshots: z.array(screenshotSchema).optional(),
  statisticsSection: statisticsSectionSchema,
  benefitsSection: benefitsSectionSchema,
  sidebarContent: sidebarContentSchema,
  footerCTA: footerCTASchema,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;

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
