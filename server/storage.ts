import { type User, type InsertUser, type Product, type InsertProduct, type Category, type InsertCategory, type Page, type InsertPage, type Image, type InsertImage, type ProductPlan, type InsertProductPlan, users, products, categories, pages, images, productPlans } from "@shared/schema";
import { db } from "./db";
import { eq, sql, asc } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();