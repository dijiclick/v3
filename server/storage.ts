import { type User, type InsertUser, type Product, type InsertProduct, type Category, type InsertCategory, type Page, type InsertPage, type Image, type InsertImage, type ProductPlan, type InsertProductPlan, type BlogPost, type InsertBlogPost, type BlogAuthor, type InsertBlogAuthor, type BlogCategory, type InsertBlogCategory, type BlogTag, type InsertBlogTag, users, products, categories, pages, images, productPlans, blogPosts, blogAuthors, blogCategories, blogTags } from "@shared/schema";
import { db } from "./db";
import { eq, sql, asc, desc, and, or, like, ilike, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductByCategoryAndSlug(categorySlug: string, productSlug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  duplicateProduct(id: string): Promise<Product>;
  
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Product search methods
  searchProducts(options: { query: string; limit?: number; categoryIds?: string[]; featured?: boolean; inStock?: boolean }): Promise<{ products: Product[]; total: number }>;
  
  getPages(): Promise<Page[]>;
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: string, page: Partial<InsertPage>): Promise<Page>;
  deletePage(id: string): Promise<boolean>;
  
  getImages(): Promise<Image[]>;
  getImage(id: string): Promise<Image | undefined>;
  getImagesByProductId(productId: string): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
  deleteImage(id: string): Promise<boolean>;
  
  getProductPlans(productId: string): Promise<ProductPlan[]>;
  getProductPlan(id: string): Promise<ProductPlan | undefined>;
  createProductPlan(plan: InsertProductPlan): Promise<ProductPlan>;
  updateProductPlan(id: string, plan: Partial<InsertProductPlan>): Promise<ProductPlan>;
  deleteProductPlan(id: string): Promise<boolean>;
  getDefaultProductPlan(productId: string): Promise<ProductPlan | undefined>;
  
  // Blog methods
  getBlogPosts(options?: { limit?: number; offset?: number; status?: string; featured?: boolean; categoryId?: string; categoryIds?: string[]; authorId?: string; authorIds?: string[]; tags?: string[]; searchQuery?: string; startDate?: Date; endDate?: Date; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<{ posts: BlogPost[]; total: number }>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<boolean>;
  getFeaturedBlogPosts(limit?: number): Promise<BlogPost[]>;
  getBlogPostsByCategory(categoryId: string, options?: { limit?: number; offset?: number }): Promise<{ posts: BlogPost[]; total: number }>;
  getBlogPostsByTag(tagSlug: string, options?: { limit?: number; offset?: number }): Promise<{ posts: BlogPost[]; total: number }>;
  getBlogPostsByAuthor(authorId: string, options?: { limit?: number; offset?: number }): Promise<{ posts: BlogPost[]; total: number }>;
  
  getBlogAuthors(options?: { limit?: number; offset?: number; search?: string; active?: boolean; featured?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<{ authors: BlogAuthor[]; total: number }>;
  getBlogAuthor(id: string): Promise<BlogAuthor | undefined>;
  getBlogAuthorBySlug(slug: string): Promise<BlogAuthor | undefined>;
  createBlogAuthor(author: InsertBlogAuthor): Promise<BlogAuthor>;
  updateBlogAuthor(id: string, author: Partial<InsertBlogAuthor>): Promise<BlogAuthor>;
  deleteBlogAuthor(id: string): Promise<boolean>;
  deleteBlogAuthorsBulk(ids: string[]): Promise<number>;
  getBlogAuthorsWithStats(): Promise<(BlogAuthor & { postCount: number; totalViews: number; lastPostDate: string | null })[]>;
  getBlogAuthorStats(authorId: string): Promise<{ postCount: number; totalViews: number; lastPostDate: string | null; draftsCount: number }>;
  
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: string): Promise<BlogCategory | undefined>;
  getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: string, category: Partial<InsertBlogCategory>): Promise<BlogCategory>;
  deleteBlogCategory(id: string): Promise<boolean>;
  deleteBlogCategoriesBulk(ids: string[]): Promise<number>;
  getBlogCategoriesWithStats(): Promise<(BlogCategory & { postCount: number })[]>;
  
  getBlogTags(): Promise<BlogTag[]>;
  getBlogTag(id: string): Promise<BlogTag | undefined>;
  getBlogTagBySlug(slug: string): Promise<BlogTag | undefined>;
  createBlogTag(tag: InsertBlogTag): Promise<BlogTag>;
  updateBlogTag(id: string, tag: Partial<InsertBlogTag>): Promise<BlogTag>;
  deleteBlogTag(id: string): Promise<boolean>;
  deleteBlogTagsBulk(ids: string[]): Promise<number>;
  getBlogTagsWithStats(): Promise<(BlogTag & { usageCount: number })[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const bcrypt = await import('bcrypt');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(insertUser.password, saltRounds);
    
    // Create user with hashed password, excluding the plain password
    const { password, ...userDataWithoutPassword } = insertUser;
    const userToInsert = {
      ...userDataWithoutPassword,
      passwordHash,
    };
    
    const [user] = await db.insert(users).values(userToInsert).returning();
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      description: products.description,
      buyLink: products.buyLink,
      mainDescription: products.mainDescription,
      featuredTitle: products.featuredTitle,
      featuredFeatures: products.featuredFeatures,
      price: products.price,
      originalPrice: products.originalPrice,
      categoryId: products.categoryId,
      image: products.image,
      rating: products.rating,
      reviewCount: products.reviewCount,
      inStock: products.inStock,
      featured: products.featured,
      layoutStyle: products.layoutStyle,
      tags: products.tags,
      heroSection: products.heroSection,
      pricingPlans: products.pricingPlans,
      screenshots: products.screenshots,
      statisticsSection: products.statisticsSection,
      benefitsSection: products.benefitsSection,
      sidebarContent: products.sidebarContent,
      footerCTA: products.footerCTA,
      blogContent: products.blogContent,
      createdAt: products.createdAt
    }).from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      description: products.description,
      buyLink: products.buyLink,
      mainDescription: products.mainDescription,
      featuredTitle: products.featuredTitle,
      featuredFeatures: products.featuredFeatures,
      price: products.price,
      originalPrice: products.originalPrice,
      categoryId: products.categoryId,
      image: products.image,
      rating: products.rating,
      reviewCount: products.reviewCount,
      inStock: products.inStock,
      featured: products.featured,
      layoutStyle: products.layoutStyle,
      tags: products.tags,
      heroSection: products.heroSection,
      pricingPlans: products.pricingPlans,
      screenshots: products.screenshots,
      statisticsSection: products.statisticsSection,
      benefitsSection: products.benefitsSection,
      sidebarContent: products.sidebarContent,
      footerCTA: products.footerCTA,
      blogContent: products.blogContent,
      createdAt: products.createdAt
    }).from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      description: products.description,
      buyLink: products.buyLink,
      mainDescription: products.mainDescription,
      featuredTitle: products.featuredTitle,
      featuredFeatures: products.featuredFeatures,
      price: products.price,
      originalPrice: products.originalPrice,
      categoryId: products.categoryId,
      image: products.image,
      rating: products.rating,
      reviewCount: products.reviewCount,
      inStock: products.inStock,
      featured: products.featured,
      layoutStyle: products.layoutStyle,
      tags: products.tags,
      heroSection: products.heroSection,
      pricingPlans: products.pricingPlans,
      screenshots: products.screenshots,
      statisticsSection: products.statisticsSection,
      benefitsSection: products.benefitsSection,
      sidebarContent: products.sidebarContent,
      footerCTA: products.footerCTA,
      blogContent: products.blogContent,
      createdAt: products.createdAt
    }).from(products).where(eq(products.slug, slug));
    return product || undefined;
  }

  async getProductByCategoryAndSlug(categorySlug: string, productSlug: string): Promise<Product | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        description: products.description,
        buyLink: products.buyLink,
        mainDescription: products.mainDescription,
        featuredTitle: products.featuredTitle,
        featuredFeatures: products.featuredFeatures,
        price: products.price,
        originalPrice: products.originalPrice,
        categoryId: products.categoryId,
        image: products.image,
        rating: products.rating,
        reviewCount: products.reviewCount,
        inStock: products.inStock,
        featured: products.featured,
        layoutStyle: products.layoutStyle,
        tags: products.tags,
        heroSection: products.heroSection,
        pricingPlans: products.pricingPlans,
        screenshots: products.screenshots,
        statisticsSection: products.statisticsSection,
        benefitsSection: products.benefitsSection,
        sidebarContent: products.sidebarContent,
        footerCTA: products.footerCTA,
        blogContent: products.blogContent,
        createdAt: products.createdAt
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        sql`${categories.slug} = ${categorySlug} AND ${products.slug} = ${productSlug}`
      );
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, updateProduct: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products).set(updateProduct).where(eq(products.id, id)).returning();
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    // First, delete all associated images from the database
    const associatedImages = await this.getImagesByProductId(id);
    if (associatedImages.length > 0) {
      await db.delete(images).where(eq(images.productId, id));
    }
    
    // Then delete the product
    const result = await db.delete(products).where(eq(products.id, id));
    if (result.rowCount === 0) {
      throw new Error(`Product with id ${id} not found`);
    }
  }

  async duplicateProduct(id: string): Promise<Product> {
    // Get the original product
    const originalProduct = await this.getProduct(id);
    if (!originalProduct) {
      throw new Error(`Product with id ${id} not found`);
    }

    // Generate a unique slug
    let newSlug = `${originalProduct.slug}-copy`;
    let counter = 1;
    
    while (await this.getProductBySlug(newSlug)) {
      newSlug = `${originalProduct.slug}-copy-${counter}`;
      counter++;
    }

    // Create the duplicate product with new slug and without id/createdAt
    const duplicateData = {
      title: `کپی از ${originalProduct.title}`,
      slug: newSlug,
      description: originalProduct.description,
      price: originalProduct.price,
      originalPrice: originalProduct.originalPrice,
      categoryId: originalProduct.categoryId,
      image: originalProduct.image,
      rating: originalProduct.rating,
      reviewCount: originalProduct.reviewCount,
      inStock: originalProduct.inStock,
      featured: false, // New duplicates are not featured by default
      layoutStyle: originalProduct.layoutStyle,
      tags: originalProduct.tags,
      heroSection: originalProduct.heroSection,
      pricingPlans: originalProduct.pricingPlans,
      screenshots: originalProduct.screenshots,
      statisticsSection: originalProduct.statisticsSection,
      benefitsSection: originalProduct.benefitsSection,
      sidebarContent: originalProduct.sidebarContent,
      footerCTA: originalProduct.footerCTA,
      blogContent: originalProduct.blogContent,
    };

    const [newProduct] = await db.insert(products).values(duplicateData).returning();
    return newProduct;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      description: products.description,
      buyLink: products.buyLink,
      mainDescription: products.mainDescription,
      featuredTitle: products.featuredTitle,
      featuredFeatures: products.featuredFeatures,
      price: products.price,
      originalPrice: products.originalPrice,
      categoryId: products.categoryId,
      image: products.image,
      rating: products.rating,
      reviewCount: products.reviewCount,
      inStock: products.inStock,
      featured: products.featured,
      layoutStyle: products.layoutStyle,
      tags: products.tags,
      heroSection: products.heroSection,
      pricingPlans: products.pricingPlans,
      screenshots: products.screenshots,
      statisticsSection: products.statisticsSection,
      benefitsSection: products.benefitsSection,
      sidebarContent: products.sidebarContent,
      footerCTA: products.footerCTA,
      blogContent: products.blogContent,
      createdAt: products.createdAt
    }).from(products).where(eq(products.featured, true));
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      description: products.description,
      buyLink: products.buyLink,
      mainDescription: products.mainDescription,
      featuredTitle: products.featuredTitle,
      featuredFeatures: products.featuredFeatures,
      price: products.price,
      originalPrice: products.originalPrice,
      categoryId: products.categoryId,
      image: products.image,
      rating: products.rating,
      reviewCount: products.reviewCount,
      inStock: products.inStock,
      featured: products.featured,
      layoutStyle: products.layoutStyle,
      tags: products.tags,
      heroSection: products.heroSection,
      pricingPlans: products.pricingPlans,
      screenshots: products.screenshots,
      statisticsSection: products.statisticsSection,
      benefitsSection: products.benefitsSection,
      sidebarContent: products.sidebarContent,
      footerCTA: products.footerCTA,
      blogContent: products.blogContent,
      createdAt: products.createdAt
    }).from(products).where(eq(products.categoryId, categoryId));
  }

  async searchProducts(options: { query: string; limit?: number; categoryIds?: string[]; featured?: boolean; inStock?: boolean }): Promise<{ products: Product[]; total: number }> {
    const { query, limit = 10, categoryIds = [], featured, inStock } = options;
    
    // Build WHERE conditions
    const conditions = [];
    
    // Add search condition
    if (query.trim()) {
      const searchCondition = or(
        ilike(products.title, `%${query}%`),
        ilike(products.description, `%${query}%`),
        ilike(products.featuredTitle, `%${query}%`),
        sql`EXISTS (
          SELECT 1 
          FROM unnest(${products.featuredFeatures}) AS feature 
          WHERE feature ILIKE ${`%${query}%`}
        )`,
        sql`EXISTS (
          SELECT 1 
          FROM unnest(${products.tags}) AS tag 
          WHERE tag ILIKE ${`%${query}%`}
        )`
      );
      conditions.push(searchCondition);
    }
    
    // Add filters
    if (categoryIds.length > 0) {
      conditions.push(sql`${products.categoryId} = ANY(${categoryIds})`);
    }
    
    if (featured !== undefined) {
      conditions.push(eq(products.featured, featured));
    }
    
    if (inStock !== undefined) {
      conditions.push(eq(products.inStock, inStock));
    }
    
    // Build the main query
    const baseQuery = db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        description: products.description,
        buyLink: products.buyLink,
        mainDescription: products.mainDescription,
        featuredTitle: products.featuredTitle,
        featuredFeatures: products.featuredFeatures,
        price: products.price,
        originalPrice: products.originalPrice,
        categoryId: products.categoryId,
        image: products.image,
        rating: products.rating,
        reviewCount: products.reviewCount,
        inStock: products.inStock,
        featured: products.featured,
        layoutStyle: products.layoutStyle,
        tags: products.tags,
        heroSection: products.heroSection,
        pricingPlans: products.pricingPlans,
        screenshots: products.screenshots,
        statisticsSection: products.statisticsSection,
        benefitsSection: products.benefitsSection,
        sidebarContent: products.sidebarContent,
        footerCTA: products.footerCTA,
        blogContent: products.blogContent,
        createdAt: products.createdAt
      })
      .from(products);
    
    // Apply WHERE conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get results with limit
    const searchResults = await baseQuery
      .where(whereClause)
      .orderBy(desc(products.featured), desc(products.createdAt))
      .limit(limit);
    
    // Get total count
    const countQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);
    
    const total = countQuery[0]?.count || 0;
    
    return {
      products: searchResults,
      total
    };
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Pages methods
  async getPages(): Promise<Page[]> {
    return await db.select().from(pages);
  }

  async getPage(id: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page || undefined;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page || undefined;
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const [page] = await db.insert(pages).values({
      ...insertPage,
      updatedAt: new Date()
    }).returning();
    return page;
  }

  async updatePage(id: string, updateData: Partial<InsertPage>): Promise<Page> {
    const [page] = await db.update(pages)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(pages.id, id))
      .returning();
    
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }
    
    return page;
  }

  async deletePage(id: string): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Images methods
  async getImages(): Promise<Image[]> {
    return await db.select().from(images);
  }

  async getImage(id: string): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image || undefined;
  }

  async getImagesByProductId(productId: string): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.productId, productId));
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db.insert(images).values(insertImage).returning();
    return image;
  }

  async deleteImage(id: string): Promise<boolean> {
    const result = await db.delete(images).where(eq(images.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Product Plans methods
  async getProductPlans(productId: string): Promise<ProductPlan[]> {
    return await db.select().from(productPlans)
      .where(eq(productPlans.productId, productId))
      .orderBy(asc(productPlans.sortOrder), asc(productPlans.createdAt));
  }

  async getProductPlan(id: string): Promise<ProductPlan | undefined> {
    const [plan] = await db.select().from(productPlans).where(eq(productPlans.id, id));
    return plan || undefined;
  }

  async createProductPlan(insertPlan: InsertProductPlan): Promise<ProductPlan> {
    const [plan] = await db.insert(productPlans).values(insertPlan).returning();
    return plan;
  }

  async updateProductPlan(id: string, updateData: Partial<InsertProductPlan>): Promise<ProductPlan> {
    return await db.transaction(async (tx) => {
      // If setting this plan as default, first unset other defaults for the same product
      if (updateData.isDefault === true) {
        // Get the current plan to find its productId
        const [currentPlan] = await tx.select().from(productPlans).where(eq(productPlans.id, id));
        
        if (!currentPlan) {
          throw new Error(`Product plan with id ${id} not found`);
        }
        
        // Unset all other plans for this product as default
        await tx.update(productPlans)
          .set({ isDefault: false })
          .where(sql`${productPlans.productId} = ${currentPlan.productId} AND ${productPlans.id} != ${id}`);
      }
      
      // Now update the target plan
      const [plan] = await tx.update(productPlans)
        .set(updateData)
        .where(eq(productPlans.id, id))
        .returning();
      
      if (!plan) {
        throw new Error(`Product plan with id ${id} not found`);
      }
      
      return plan;
    });
  }

  async deleteProductPlan(id: string): Promise<boolean> {
    const result = await db.delete(productPlans).where(eq(productPlans.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getDefaultProductPlan(productId: string): Promise<ProductPlan | undefined> {
    const [plan] = await db.select().from(productPlans)
      .where(sql`${productPlans.productId} = ${productId} AND ${productPlans.isDefault} = true`);
    return plan || undefined;
  }

  // Initialize database with sample data if empty
  async initializeData(): Promise<void> {
    try {
      const existingCategories = await this.getCategories();
      const existingProducts = await this.getProducts();
      
      if (existingCategories.length > 0 && existingProducts.length > 0) {
        return; // Already initialized
      }
      
      // Use transaction to ensure atomic seeding
      await db.transaction(async (tx) => {
        // Create categories only if none exist
        let electronicsCategory, homeGardenCategory, fashionCategory, sportsCategory;
        
        if (existingCategories.length === 0) {
          [electronicsCategory] = await tx.insert(categories).values({
            name: "Electronics",
            slug: "electronics",
            description: "Latest tech gadgets and devices",
          }).returning();
          
          [homeGardenCategory] = await tx.insert(categories).values({
            name: "Home & Garden",
            slug: "home-garden",
            description: "Beautiful items for your home",
          }).returning();
          
          [fashionCategory] = await tx.insert(categories).values({
            name: "Fashion",
            slug: "fashion",
            description: "Trendy clothing and accessories",
          }).returning();
          
          [sportsCategory] = await tx.insert(categories).values({
            name: "Sports",
            slug: "sports",
            description: "Sports and fitness equipment",
          }).returning();
        } else {
          // Use existing categories
          electronicsCategory = existingCategories.find(c => c.slug === "electronics");
          homeGardenCategory = existingCategories.find(c => c.slug === "home-garden");
          fashionCategory = existingCategories.find(c => c.slug === "fashion");
          sportsCategory = existingCategories.find(c => c.slug === "sports");
        }

        // Create sample products only if none exist
        if (existingProducts.length === 0) {
          const sampleProducts = [
            {
              title: "Premium Wireless Headphones",
              slug: "premium-wireless-headphones",
              description: "High-quality wireless headphones with noise cancellation and superior sound quality.",
              price: "299.00",
              originalPrice: "399.00",
              categoryId: electronicsCategory?.id,
              image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
              rating: "4.9",
              reviewCount: 156,
              inStock: true,
              featured: true,
              tags: ["wireless", "headphones", "audio"],
            },
            {
              title: "Modern Desk Lamp",
              slug: "modern-desk-lamp",
              description: "Sleek and adjustable desk lamp perfect for your workspace.",
              price: "149.00",
              originalPrice: null,
              categoryId: homeGardenCategory?.id,
              image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
              rating: "4.2",
              reviewCount: 89,
              inStock: true,
              featured: false,
              tags: ["lamp", "desk", "lighting"],
            },
            {
              title: "Smart Fitness Watch",
              slug: "smart-fitness-watch",
              description: "Advanced fitness tracking with heart rate monitoring and GPS.",
              price: "499.00",
              originalPrice: null,
              categoryId: sportsCategory?.id,
              image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
              rating: "4.8",
              reviewCount: 203,
              inStock: true,
              featured: true,
              tags: ["smartwatch", "fitness", "health"],
            },
            {
              title: "Premium Coffee Maker",
              slug: "premium-coffee-maker",
              description: "Professional-grade coffee maker for the perfect brew every time.",
              price: "199.00",
              originalPrice: "249.00",
              categoryId: homeGardenCategory?.id,
              image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
              rating: "4.6",
              reviewCount: 127,
              inStock: true,
              featured: false,
              tags: ["coffee", "maker", "kitchen"],
            },
            {
              title: "Designer Backpack",
              slug: "designer-backpack",
              description: "Stylish and functional backpack for everyday use.",
              price: "129.00",
              originalPrice: null,
              categoryId: fashionCategory?.id,
              image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1pwYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
              rating: "4.7",
              reviewCount: 94,
              inStock: true,
              featured: false,
              tags: ["backpack", "fashion", "travel"],
            },
            {
              title: "Wireless Phone Charger",
              slug: "wireless-phone-charger",
              description: "Fast wireless charging pad compatible with all modern smartphones.",
              price: "49.00",
              originalPrice: null,
              categoryId: electronicsCategory?.id,
              image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
              rating: "4.3",
              reviewCount: 67,
              inStock: true,
              featured: false,
              tags: ["charger", "wireless", "phone"],
            },
          ];

          for (const productData of sampleProducts) {
            await tx.insert(products).values(productData);
          }
        }
      });
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Don't throw - allow server to continue without seeded data
    }
  }

  // Blog Posts methods
  async getBlogPosts(options: { 
    limit?: number; 
    offset?: number; 
    status?: string; 
    featured?: boolean; 
    categoryId?: string; // kept for backward compatibility
    categoryIds?: string[]; 
    authorId?: string; // kept for backward compatibility
    authorIds?: string[]; 
    tags?: string[]; 
    searchQuery?: string; 
    startDate?: Date; 
    endDate?: Date; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc' 
  } = {}): Promise<{ posts: BlogPost[]; total: number }> {
    const { 
      limit = 10, 
      offset = 0, 
      status = 'published',
      featured,
      categoryId,
      categoryIds,
      authorId,
      authorIds,
      tags,
      searchQuery,
      startDate,
      endDate,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = options;

    // Build conditions
    const conditions = [];
    
    if (status) {
      conditions.push(eq(blogPosts.status, status));
    }
    
    if (featured !== undefined) {
      conditions.push(eq(blogPosts.featured, featured));
    }
    
    // Handle multiple categories (new) or single category (backward compatibility)
    const allCategoryIds = categoryIds || (categoryId ? [categoryId] : []);
    if (allCategoryIds.length > 0) {
      if (allCategoryIds.length === 1) {
        conditions.push(eq(blogPosts.categoryId, allCategoryIds[0]));
      } else {
        // Multiple categories: posts that match any of the categories
        conditions.push(
          or(...allCategoryIds.map(catId => eq(blogPosts.categoryId, catId)))
        );
      }
    }
    
    // Handle multiple authors (new) or single author (backward compatibility)
    const allAuthorIds = authorIds || (authorId ? [authorId] : []);
    if (allAuthorIds.length > 0) {
      if (allAuthorIds.length === 1) {
        conditions.push(eq(blogPosts.authorId, allAuthorIds[0]));
      } else {
        // Multiple authors: posts that match any of the authors
        conditions.push(
          or(...allAuthorIds.map(authId => eq(blogPosts.authorId, authId)))
        );
      }
    }
    
    if (tags && tags.length > 0) {
      // Simple text search - convert array to text and search for tag
      const tagConditions = tags.map(tag => 
        like(sql`array_to_string(${blogPosts.tags}, ',')`, `%${tag}%`)
      );
      conditions.push(or(...tagConditions));
    }
    
    // Date range filtering
    if (startDate) {
      conditions.push(sql`${blogPosts.publishedAt} >= ${startDate}`);
    }
    
    if (endDate) {
      conditions.push(sql`${blogPosts.publishedAt} <= ${endDate}`);
    }
    
    if (searchQuery) {
      conditions.push(
        or(
          ilike(blogPosts.title, `%${searchQuery}%`),
          ilike(blogPosts.excerpt, `%${searchQuery}%`),
          sql`${blogPosts.tags}::text ILIKE ${'%' + searchQuery + '%'}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(whereClause);

    // Get posts with ordering
    let orderBy;
    switch (sortBy) {
      case 'title':
        orderBy = sortOrder === 'asc' ? asc(blogPosts.title) : desc(blogPosts.title);
        break;
      case 'readingTime':
        orderBy = sortOrder === 'asc' ? asc(blogPosts.readingTime) : desc(blogPosts.readingTime);
        break;
      case 'viewCount':
        orderBy = sortOrder === 'asc' ? asc(blogPosts.viewCount) : desc(blogPosts.viewCount);
        break;
      default:
        orderBy = sortOrder === 'asc' ? asc(blogPosts.publishedAt) : desc(blogPosts.publishedAt);
    }

    const posts = await db
      .select()
      .from(blogPosts)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { posts, total: Number(total) };
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const postData = {
      ...insertPost,
      publishedAt: insertPost.status === 'published' ? new Date() : null,
      updatedAt: new Date()
    };
    const [post] = await db.insert(blogPosts).values(postData).returning();
    return post;
  }

  async updateBlogPost(id: string, updateData: Partial<InsertBlogPost>): Promise<BlogPost> {
    const updatePayload = {
      ...updateData,
      updatedAt: new Date()
    };
    
    // Set publishedAt if changing status to published
    if (updateData.status === 'published') {
      const currentPost = await this.getBlogPost(id);
      if (currentPost && !currentPost.publishedAt) {
        updatePayload.publishedAt = new Date();
      }
    }
    
    const [post] = await db.update(blogPosts)
      .set(updatePayload)
      .where(eq(blogPosts.id, id))
      .returning();
    
    if (!post) {
      throw new Error(`Blog post with id ${id} not found`);
    }
    
    return post;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getFeaturedBlogPosts(limit = 3): Promise<BlogPost[]> {
    return await db.select()
      .from(blogPosts)
      .where(and(eq(blogPosts.featured, true), eq(blogPosts.status, 'published')))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
  }

  async getBlogPostsByCategory(categoryId: string, options: { limit?: number; offset?: number } = {}): Promise<{ posts: BlogPost[]; total: number }> {
    return this.getBlogPosts({
      ...options,
      categoryId,
      status: 'published'
    });
  }

  async getBlogPostsByTag(tagSlug: string, options: { limit?: number; offset?: number } = {}): Promise<{ posts: BlogPost[]; total: number }> {
    return this.getBlogPosts({
      ...options,
      tags: [tagSlug],
      status: 'published'
    });
  }

  async getBlogPostsByAuthor(authorId: string, options: { limit?: number; offset?: number } = {}): Promise<{ posts: BlogPost[]; total: number }> {
    return this.getBlogPosts({
      ...options,
      authorId,
      status: 'published'
    });
  }

  // Blog Authors methods
  async getBlogAuthors(options: { 
    limit?: number; 
    offset?: number; 
    search?: string; 
    active?: boolean; 
    featured?: boolean; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc' 
  } = {}): Promise<{ authors: BlogAuthor[]; total: number }> {
    const { limit = 50, offset = 0, search, active, featured, sortBy = 'name', sortOrder = 'asc' } = options;
    
    // Build where conditions
    const whereConditions = [];
    if (active !== undefined) {
      whereConditions.push(eq(blogAuthors.active, active));
    }
    if (featured !== undefined) {
      whereConditions.push(eq(blogAuthors.featured, featured));
    }
    if (search) {
      whereConditions.push(
        or(
          ilike(blogAuthors.name, `%${search}%`),
          ilike(blogAuthors.bio, `%${search}%`),
          ilike(blogAuthors.jobTitle, `%${search}%`),
          ilike(blogAuthors.company, `%${search}%`)
        )
      );
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Build sort order
    const sortColumn = sortBy === 'name' ? blogAuthors.name :
                      sortBy === 'createdAt' ? blogAuthors.createdAt :
                      sortBy === 'updatedAt' ? blogAuthors.updatedAt :
                      blogAuthors.name;
    const orderBy = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);
    
    // Get total count
    const totalQuery = db.select({ count: count() }).from(blogAuthors);
    if (whereClause) {
      totalQuery.where(whereClause);
    }
    const [{ count: total }] = await totalQuery;
    
    // Get authors
    const authorsQuery = db.select().from(blogAuthors).limit(limit).offset(offset).orderBy(orderBy);
    if (whereClause) {
      authorsQuery.where(whereClause);
    }
    const authors = await authorsQuery;
    
    return { authors, total };
  }

  async getBlogAuthor(id: string): Promise<BlogAuthor | undefined> {
    const [author] = await db.select().from(blogAuthors).where(eq(blogAuthors.id, id));
    return author || undefined;
  }

  async getBlogAuthorBySlug(slug: string): Promise<BlogAuthor | undefined> {
    const [author] = await db.select().from(blogAuthors).where(eq(blogAuthors.slug, slug));
    return author || undefined;
  }

  async createBlogAuthor(insertAuthor: InsertBlogAuthor): Promise<BlogAuthor> {
    const [author] = await db.insert(blogAuthors).values({
      ...insertAuthor,
      updatedAt: new Date()
    }).returning();
    return author;
  }

  async updateBlogAuthor(id: string, updateData: Partial<InsertBlogAuthor>): Promise<BlogAuthor> {
    const [author] = await db.update(blogAuthors)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(blogAuthors.id, id))
      .returning();
    
    if (!author) {
      throw new Error(`Blog author with id ${id} not found`);
    }
    
    return author;
  }

  async deleteBlogAuthor(id: string): Promise<boolean> {
    const result = await db.delete(blogAuthors).where(eq(blogAuthors.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async deleteBlogAuthorsBulk(ids: string[]): Promise<number> {
    const result = await db.delete(blogAuthors).where(
      sql`${blogAuthors.id} = ANY(${ids})`
    );
    return result.rowCount || 0;
  }

  async getBlogAuthorsWithStats(): Promise<(BlogAuthor & { postCount: number; totalViews: number; lastPostDate: string | null })[]> {
    const authorsWithStats = await db
      .select({
        id: blogAuthors.id,
        name: blogAuthors.name,
        slug: blogAuthors.slug,
        bio: blogAuthors.bio,
        email: blogAuthors.email,
        avatar: blogAuthors.avatar,
        website: blogAuthors.website,
        twitter: blogAuthors.twitter,
        linkedin: blogAuthors.linkedin,
        github: blogAuthors.github,
        telegram: blogAuthors.telegram,
        jobTitle: blogAuthors.jobTitle,
        company: blogAuthors.company,
        seoTitle: blogAuthors.seoTitle,
        seoDescription: blogAuthors.seoDescription,
        seoKeywords: blogAuthors.seoKeywords,
        featured: blogAuthors.featured,
        active: blogAuthors.active,
        createdAt: blogAuthors.createdAt,
        updatedAt: blogAuthors.updatedAt,
        postCount: count(blogPosts.id),
        totalViews: sql<number>`COALESCE(SUM(${blogPosts.viewCount}), 0)`,
        lastPostDate: sql<string>`MAX(${blogPosts.publishedAt})`,
      })
      .from(blogAuthors)
      .leftJoin(blogPosts, and(
        eq(blogAuthors.id, blogPosts.authorId),
        eq(blogPosts.status, 'published')
      ))
      .where(eq(blogAuthors.active, true))
      .groupBy(blogAuthors.id)
      .orderBy(asc(blogAuthors.name));
    
    return authorsWithStats.map(author => ({
      ...author,
      totalViews: Number(author.totalViews),
      lastPostDate: author.lastPostDate || null
    }));
  }

  async getBlogAuthorStats(authorId: string): Promise<{ postCount: number; totalViews: number; lastPostDate: string | null; draftsCount: number }> {
    // Get published posts stats
    const [publishedStats] = await db
      .select({
        postCount: count(blogPosts.id),
        totalViews: sql<number>`COALESCE(SUM(${blogPosts.viewCount}), 0)`,
        lastPostDate: sql<string>`MAX(${blogPosts.publishedAt})`,
      })
      .from(blogPosts)
      .where(and(
        eq(blogPosts.authorId, authorId),
        eq(blogPosts.status, 'published')
      ));

    // Get drafts count
    const [draftsStats] = await db
      .select({
        draftsCount: count(blogPosts.id)
      })
      .from(blogPosts)
      .where(and(
        eq(blogPosts.authorId, authorId),
        eq(blogPosts.status, 'draft')
      ));

    return {
      postCount: publishedStats?.postCount || 0,
      totalViews: Number(publishedStats?.totalViews || 0),
      lastPostDate: publishedStats?.lastPostDate || null,
      draftsCount: draftsStats?.draftsCount || 0
    };
  }

  // Blog Categories methods
  async getBlogCategories(): Promise<BlogCategory[]> {
    return await db.select().from(blogCategories)
      .where(eq(blogCategories.active, true))
      .orderBy(asc(blogCategories.sortOrder), asc(blogCategories.name));
  }

  async getBlogCategory(id: string): Promise<BlogCategory | undefined> {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, id));
    return category || undefined;
  }

  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.slug, slug));
    return category || undefined;
  }

  async createBlogCategory(insertCategory: InsertBlogCategory): Promise<BlogCategory> {
    const [category] = await db.insert(blogCategories).values(insertCategory).returning();
    return category;
  }

  async updateBlogCategory(id: string, updateData: Partial<InsertBlogCategory>): Promise<BlogCategory> {
    const [category] = await db.update(blogCategories)
      .set(updateData)
      .where(eq(blogCategories.id, id))
      .returning();
    
    if (!category) {
      throw new Error(`Blog category with id ${id} not found`);
    }
    
    return category;
  }

  async deleteBlogCategory(id: string): Promise<boolean> {
    const result = await db.delete(blogCategories).where(eq(blogCategories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async deleteBlogCategoriesBulk(ids: string[]): Promise<number> {
    const result = await db.delete(blogCategories).where(
      sql`${blogCategories.id} = ANY(${ids})`
    );
    return result.rowCount || 0;
  }

  async getBlogCategoriesWithStats(): Promise<(BlogCategory & { postCount: number })[]> {
    const categoriesWithCounts = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        description: blogCategories.description,
        parentId: blogCategories.parentId,
        color: blogCategories.color,
        seoTitle: blogCategories.seoTitle,
        seoDescription: blogCategories.seoDescription,
        seoKeywords: blogCategories.seoKeywords,
        featured: blogCategories.featured,
        active: blogCategories.active,
        sortOrder: blogCategories.sortOrder,
        createdAt: blogCategories.createdAt,
        postCount: count(blogPosts.id),
      })
      .from(blogCategories)
      .leftJoin(blogPosts, eq(blogCategories.id, blogPosts.categoryId))
      .where(eq(blogCategories.active, true))
      .groupBy(blogCategories.id)
      .orderBy(asc(blogCategories.sortOrder), asc(blogCategories.name));
    
    return categoriesWithCounts;
  }

  // Blog Tags methods
  async getBlogTags(): Promise<BlogTag[]> {
    return await db.select().from(blogTags).orderBy(asc(blogTags.name));
  }

  async getBlogTag(id: string): Promise<BlogTag | undefined> {
    const [tag] = await db.select().from(blogTags).where(eq(blogTags.id, id));
    return tag || undefined;
  }

  async getBlogTagBySlug(slug: string): Promise<BlogTag | undefined> {
    const [tag] = await db.select().from(blogTags).where(eq(blogTags.slug, slug));
    return tag || undefined;
  }

  async createBlogTag(insertTag: InsertBlogTag): Promise<BlogTag> {
    const [tag] = await db.insert(blogTags).values(insertTag).returning();
    return tag;
  }

  async updateBlogTag(id: string, updateData: Partial<InsertBlogTag>): Promise<BlogTag> {
    const [tag] = await db.update(blogTags)
      .set(updateData)
      .where(eq(blogTags.id, id))
      .returning();
    
    if (!tag) {
      throw new Error(`Blog tag with id ${id} not found`);
    }
    
    return tag;
  }

  async deleteBlogTag(id: string): Promise<boolean> {
    const result = await db.delete(blogTags).where(eq(blogTags.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async deleteBlogTagsBulk(ids: string[]): Promise<number> {
    const result = await db.delete(blogTags).where(
      sql`${blogTags.id} = ANY(${ids})`
    );
    return result.rowCount || 0;
  }

  async getBlogTagsWithStats(): Promise<(BlogTag & { usageCount: number })[]> {
    // Get all tags first
    const allTags = await db.select().from(blogTags).orderBy(asc(blogTags.name));
    
    // Get blog posts with their tags
    const postsWithTags = await db.select({
      tags: blogPosts.tags
    }).from(blogPosts).where(sql`${blogPosts.tags} IS NOT NULL`);
    
    // Count tag usage
    const tagUsageCounts: Record<string, number> = {};
    postsWithTags.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tagSlug => {
          tagUsageCounts[tagSlug] = (tagUsageCounts[tagSlug] || 0) + 1;
        });
      }
    });
    
    // Combine tags with their usage counts
    return allTags.map(tag => ({
      ...tag,
      usageCount: tagUsageCounts[tag.slug] || 0
    }));
  }
}

export const storage = new DatabaseStorage();