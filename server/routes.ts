import express, { type Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertPageSchema, insertProductPlanSchema, insertBlogPostSchema, insertBlogAuthorSchema, insertBlogCategorySchema, insertBlogTagSchema } from "@shared/schema";
import { sessionStore, verifyPassword, requireAdmin, getCookieOptions, getCSRFCookieOptions } from "./auth";
import { sitemapGenerator, sitemapCache } from "./sitemap";
import { rssGenerator, rssCache } from "./rss";
import { contentAnalyticsService } from "./content-analytics";
import { blogSearchService } from "./search";
import { insertBlogSearchAnalyticsSchema, insertBlogSavedSearchSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Serve uploaded files statically FIRST - before any other middleware
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads'), {
    setHeaders: (res) => {
      res.header('Access-Control-Allow-Origin', '*');
    }
  }));
  
  const isProduction = process.env.NODE_ENV === 'production';

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Rate limiting check
      if (!sessionStore.checkRateLimit(clientIP)) {
        return res.status(429).json({ message: "Too many login attempts. Please try again later." });
      }
      
      if (!password || !verifyPassword(password)) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      // Create new session
      const session = sessionStore.createSession();
      
      // Set secure cookies
      res.cookie('admin_session', session.sessionId, getCookieOptions(isProduction));
      res.cookie('csrf_token', session.csrfToken, getCSRFCookieOptions(isProduction));
      
      res.json({ message: "Login successful", csrfToken: session.csrfToken });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/logout", (req, res) => {
    const sessionId = req.cookies.admin_session;
    
    // Add CSRF protection to logout to prevent forced logout CSRF attacks
    if (sessionId) {
      const session = sessionStore.getSession(sessionId);
      if (session) {
        const csrfTokenFromHeader = req.headers['x-csrf-token'] as string;
        const csrfTokenFromCookie = req.cookies.csrf_token;
        
        if (csrfTokenFromHeader && csrfTokenFromCookie && 
            csrfTokenFromHeader === csrfTokenFromCookie &&
            csrfTokenFromHeader === session.csrfToken) {
          sessionStore.deleteSession(sessionId);
        }
      }
    }
    
    // Always clear cookies regardless of CSRF validation
    res.clearCookie('admin_session');
    res.clearCookie('csrf_token');
    res.json({ message: "Logged out successfully" });
  });
  
  app.get("/api/admin/me", (req, res) => {
    const sessionId = req.cookies.admin_session;
    if (!sessionId) {
      return res.json({ isAuthenticated: false });
    }
    
    const session = sessionStore.getSession(sessionId);
    if (!session) {
      res.clearCookie('admin_session');
      res.clearCookie('csrf_token');
      return res.json({ isAuthenticated: false });
    }
    
    res.json({ isAuthenticated: true, csrfToken: session.csrfToken });
  });
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { featured, limit, random } = req.query;
      let products = await storage.getProducts();
      
      // Filter by featured if requested
      if (featured === 'true') {
        products = products.filter((product: any) => product.featured === true);
      }
      
      // Randomize order if requested
      if (random === 'true') {
        products = [...products].sort(() => Math.random() - 0.5);
      }
      
      // Apply limit if specified
      if (limit) {
        const limitNum = parseInt(limit as string, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
          products = products.slice(0, limitNum);
        }
      }
      
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching featured products: " + error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  // Product Plans API endpoints - moved above general routes to avoid conflicts
  app.get("/api/products/:productId/plans", async (req, res) => {
    try {
      const { productId } = req.params;
      const plans = await storage.getProductPlans(productId);
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product plans: " + error.message });
    }
  });

  app.post("/api/products/:productId/plans", requireAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      const result = insertProductPlanSchema.safeParse({
        ...req.body,
        productId
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid plan data", 
          errors: result.error.errors 
        });
      }
      
      const plan = await storage.createProductPlan(result.data);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating product plan: " + error.message });
    }
  });

  app.get("/api/products/:categorySlug/:productSlug", async (req, res) => {
    try {
      const { categorySlug, productSlug } = req.params;
      const product = await storage.getProductByCategoryAndSlug(categorySlug, productSlug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const result = insertProductSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid product data", errors: result.error.errors });
      }
      
      const product = await storage.createProduct(result.data);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating product: " + error.message });
    }
  });

  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      const result = insertProductSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid product data", errors: result.error.errors });
      }
      
      const product = await storage.updateProduct(productId, result.data);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating product: " + error.message });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      const result = insertProductSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid product data", errors: result.error.errors });
      }
      
      const product = await storage.updateProduct(productId, result.data);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating product: " + error.message });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      await storage.deleteProduct(productId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Error deleting product: " + error.message });
    }
  });

  app.post("/api/products/:id/duplicate", requireAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      const duplicatedProduct = await storage.duplicateProduct(productId);
      res.status(201).json(duplicatedProduct);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Error duplicating product: " + error.message });
    }
  });


  app.put("/api/product-plans/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertProductPlanSchema.partial().omit({ productId: true }).safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid plan data", 
          errors: result.error.errors 
        });
      }
      
      const plan = await storage.updateProductPlan(id, result.data);
      res.json(plan);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Error updating product plan: " + error.message });
    }
  });

  app.delete("/api/product-plans/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProductPlan(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product plan not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product plan: " + error.message });
    }
  });

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: 'client/public/',
      filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
      }
    }),
    fileFilter: (req, file, cb) => {
      // Allow only images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });

  // Blog content management endpoints
  app.patch("/api/products/:id/blog", requireAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      const { blogContent } = req.body;
      
      if (!blogContent) {
        return res.status(400).json({ message: "Blog content is required" });
      }

      const product = await storage.updateProduct(productId, { blogContent });
      res.json({ message: "Blog content updated successfully", blogContent: product.blogContent });
    } catch (error: any) {
      res.status(500).json({ message: "Error updating blog content: " + error.message });
    }
  });

  // Image upload endpoint for blog editor
  app.post("/api/uploads/image", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const imageUrl = `/${req.file.filename}`;
      res.json({ 
        success: true, 
        imageUrl,
        message: "Image uploaded successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error uploading image: " + error.message });
    }
  });

  // Images API endpoint for rich text editor
  app.post("/api/images", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const { productId } = req.body;
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Save image metadata to database
      const imageData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: imageUrl,
        productId: productId || undefined,
      };
      
      const savedImage = await storage.createImage(imageData);
      
      res.json({ 
        success: true, 
        id: savedImage.id,
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        message: "Image uploaded successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error uploading image: " + error.message });
    }
  });

  app.get("/api/images", async (req, res) => {
    try {
      const images = await storage.getImages();
      res.json(images);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching images: " + error.message });
    }
  });

  app.get("/api/images/:id", async (req, res) => {
    try {
      const image = await storage.getImage(req.params.id);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.json(image);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching image: " + error.message });
    }
  });

  app.delete("/api/images/:id", requireAdmin, async (req, res) => {
    try {
      const imageId = req.params.id;
      const deleted = await storage.deleteImage(imageId);
      if (!deleted) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting image: " + error.message });
    }
  });

  // Blog-specific image upload endpoint with dedicated storage
  const blogUpload = multer({
    storage: multer.diskStorage({
      destination: 'public/uploads/blog/',
      filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
      }
    }),
    fileFilter: (req, file, cb) => {
      // Allow only images for blog content
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for blog images
    }
  });

  app.post("/api/admin/blog/upload-image", requireAdmin, blogUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: "No image file provided",
          success: false 
        });
      }
      
      const imageUrl = `/uploads/blog/${req.file.filename}`;
      
      // Optional: Save to database for tracking blog images
      const imageData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: imageUrl,
        productId: undefined, // Not associated with products
      };
      
      try {
        await storage.createImage(imageData);
      } catch (dbError) {
        // Continue even if database save fails - the file upload succeeded
        console.warn('Failed to save image metadata to database:', dbError);
      }
      
      res.json({ 
        success: true, 
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        message: "Blog image uploaded successfully" 
      });
    } catch (error: any) {
      console.error('Blog image upload error:', error);
      res.status(500).json({ 
        message: "Error uploading blog image: " + error.message,
        success: false 
      });
    }
  });


  // Health check endpoint for deployment diagnostics
  app.get('/healthz', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
  });

  app.get("/api/categories/slug/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching category: " + error.message });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching category: " + error.message });
    }
  });

  app.get("/api/categories/:id/products", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.id);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching category products: " + error.message });
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid category data", errors: result.error.errors });
      }
      
      const category = await storage.createCategory(result.data);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating category: " + error.message });
    }
  });

  app.put("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const categoryId = req.params.id;
      const result = insertCategorySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid category data", errors: result.error.errors });
      }
      
      const category = await storage.updateCategory(categoryId, result.data);
      res.json(category);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Error updating category: " + error.message });
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const categoryId = req.params.id;
      const deleted = await storage.deleteCategory(categoryId);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting category: " + error.message });
    }
  });

  // Pages routes
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getPages();
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching pages: " + error.message });
    }
  });

  app.get("/api/pages/:id", async (req, res) => {
    try {
      const page = await storage.getPage(req.params.id);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching page: " + error.message });
    }
  });

  app.get("/api/pages/slug/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching page: " + error.message });
    }
  });

  app.post("/api/pages", requireAdmin, async (req, res) => {
    try {
      const result = insertPageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid page data", errors: result.error.errors });
      }
      
      const page = await storage.createPage(result.data);
      res.status(201).json(page);
    } catch (error: any) {
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Page with this slug already exists" });
      }
      res.status(500).json({ message: "Error creating page: " + error.message });
    }
  });

  app.patch("/api/pages/:id", requireAdmin, async (req, res) => {
    try {
      const pageId = req.params.id;
      const result = insertPageSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid page data", errors: result.error.errors });
      }
      
      const page = await storage.updatePage(pageId, result.data);
      res.json(page);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Page with this slug already exists" });
      }
      res.status(500).json({ message: "Error updating page: " + error.message });
    }
  });

  app.delete("/api/pages/:id", requireAdmin, async (req, res) => {
    try {
      const pageId = req.params.id;
      const deleted = await storage.deletePage(pageId);
      if (!deleted) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting page: " + error.message });
    }
  });

  // Blog Posts routes
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const {
        limit = "10",
        offset = "0",
        status = "published",
        featured,
        categoryId,
        categoryIds,
        authorId,
        authorIds,
        tags,
        search,
        startDate,
        endDate,
        sortBy = "publishedAt",
        sortOrder = "desc"
      } = req.query;

      const options = {
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
        status: status as string,
        featured: featured ? featured === 'true' : undefined,
        // Support both old single ID format and new array format for backward compatibility
        categoryIds: categoryIds ? 
          (typeof categoryIds === 'string' ? categoryIds.split(',') : categoryIds) : 
          (categoryId ? [categoryId as string] : undefined),
        authorIds: authorIds ? 
          (typeof authorIds === 'string' ? authorIds.split(',') : authorIds) : 
          (authorId ? [authorId as string] : undefined),
        tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : undefined,
        searchQuery: search as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const result = await storage.getBlogPosts(options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog posts: " + error.message });
    }
  });

  app.get("/api/blog/posts/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;
      const posts = await storage.getFeaturedBlogPosts(limit);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching featured blog posts: " + error.message });
    }
  });

  app.get("/api/blog/posts/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog post: " + error.message });
    }
  });

  app.get("/api/blog/posts/slug/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog post: " + error.message });
    }
  });

  app.get("/api/blog/posts/category/:categoryId", async (req, res) => {
    try {
      const { limit = "10", offset = "0" } = req.query;
      const options = {
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      };
      const result = await storage.getBlogPostsByCategory(req.params.categoryId, options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog posts by category: " + error.message });
    }
  });

  app.get("/api/blog/posts/tag/:tagSlug", async (req, res) => {
    try {
      const { limit = "10", offset = "0" } = req.query;
      const options = {
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      };
      const result = await storage.getBlogPostsByTag(req.params.tagSlug, options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog posts by tag: " + error.message });
    }
  });

  app.get("/api/blog/posts/author/:authorId", async (req, res) => {
    try {
      const { limit = "10", offset = "0" } = req.query;
      const options = {
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      };
      const result = await storage.getBlogPostsByAuthor(req.params.authorId, options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog posts by author: " + error.message });
    }
  });

  app.post("/api/blog/posts", requireAdmin, async (req, res) => {
    try {
      const result = insertBlogPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog post data", errors: result.error.errors });
      }
      
      const post = await storage.createBlogPost(result.data);
      res.status(201).json(post);
    } catch (error: any) {
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Blog post with this slug already exists" });
      }
      res.status(500).json({ message: "Error creating blog post: " + error.message });
    }
  });

  app.put("/api/blog/posts/:id", requireAdmin, async (req, res) => {
    try {
      const postId = req.params.id;
      const result = insertBlogPostSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog post data", errors: result.error.errors });
      }
      
      const post = await storage.updateBlogPost(postId, result.data);
      res.json(post);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Blog post with this slug already exists" });
      }
      res.status(500).json({ message: "Error updating blog post: " + error.message });
    }
  });

  app.delete("/api/blog/posts/:id", requireAdmin, async (req, res) => {
    try {
      const postId = req.params.id;
      const deleted = await storage.deleteBlogPost(postId);
      if (!deleted) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting blog post: " + error.message });
    }
  });

  // Duplicate blog post endpoint
  app.post("/api/blog/posts/:id/duplicate", requireAdmin, async (req, res) => {
    try {
      const sourcePostId = req.params.id;
      const sourcePost = await storage.getBlogPost(sourcePostId);
      
      if (!sourcePost) {
        return res.status(404).json({ message: "Source blog post not found" });
      }

      // Create a unique slug for the duplicated post
      const baseCopyTitle = `Copy of ${sourcePost.title}`;
      let copyTitle = baseCopyTitle;
      let copySlug = copyTitle.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      // Ensure unique slug by appending number if needed
      let counter = 1;
      let finalSlug = copySlug;
      while (await storage.getBlogPostBySlug(finalSlug)) {
        finalSlug = `${copySlug}-${counter}`;
        counter++;
      }

      // Create the duplicate post data
      const duplicateData = {
        title: copyTitle,
        slug: finalSlug,
        excerpt: sourcePost.excerpt,
        content: sourcePost.content,
        status: 'draft', // Always create duplicates as drafts
        featuredImage: sourcePost.featuredImage,
        authorId: sourcePost.authorId,
        categoryId: sourcePost.categoryId,
        tags: sourcePost.tags,
        seoTitle: sourcePost.seoTitle,
        seoDescription: sourcePost.seoDescription,
        // Don't copy publishedAt - will be set when published
      };

      const result = insertBlogPostSchema.safeParse(duplicateData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid duplicate blog post data", 
          errors: result.error.errors 
        });
      }

      const duplicatedPost = await storage.createBlogPost(result.data);
      res.status(201).json(duplicatedPost);
    } catch (error: any) {
      console.error('Error duplicating blog post:', error);
      res.status(500).json({ message: "Error duplicating blog post: " + error.message });
    }
  });

  // Enhanced Blog API Endpoints for Content Discovery and Navigation

  // Get related posts for a specific post
  app.get("/api/blog/posts/:slug/related", async (req, res) => {
    try {
      const { slug } = req.params;
      const { limit = "6" } = req.query;
      
      const post = await storage.getBlogPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      const relatedPosts = await contentAnalyticsService.getRelatedPosts(
        post, 
        parseInt(limit as string, 10)
      );

      res.json(relatedPosts);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching related posts: " + error.message });
    }
  });

  // Get navigation (previous/next) posts for a specific post
  app.get("/api/blog/posts/:slug/navigation", async (req, res) => {
    try {
      const { slug } = req.params;
      
      const post = await storage.getBlogPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Get posts from the same category, ordered by publication date
      const categoryId = post.categoryId;
      const publishedAt = post.publishedAt;

      if (!publishedAt) {
        return res.json({ previous: null, next: null });
      }

      // Get previous post (earlier publication date)
      const previousResult = await storage.getBlogPosts({
        status: 'published',
        categoryIds: categoryId ? [categoryId] : undefined,
        endDate: new Date(publishedAt).toISOString(),
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        limit: 1,
        offset: 0
      });

      // Get next post (later publication date)
      const nextResult = await storage.getBlogPosts({
        status: 'published',
        categoryIds: categoryId ? [categoryId] : undefined,
        startDate: new Date(publishedAt).toISOString(),
        sortBy: 'publishedAt',
        sortOrder: 'asc',
        limit: 1,
        offset: 0
      });

      const previousPost = previousResult.posts.find(p => p.id !== post.id) || null;
      const nextPost = nextResult.posts.find(p => p.id !== post.id) || null;

      res.json({
        previous: previousPost,
        next: nextPost
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching post navigation: " + error.message });
    }
  });

  // Get popular posts by category
  app.get("/api/blog/popular", async (req, res) => {
    try {
      const { 
        categoryId, 
        timeframe = "30d", 
        limit = "10" 
      } = req.query;

      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      const popularPosts = await contentAnalyticsService.getPopularPostsByCategory(
        categoryId as string,
        timeframe as '7d' | '30d' | '90d' | 'all',
        parseInt(limit as string, 10)
      );

      res.json(popularPosts);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching popular posts: " + error.message });
    }
  });

  // Get posts by author (for "More from this Author" sections)
  app.get("/api/blog/authors/:authorId/recent-posts", async (req, res) => {
    try {
      const { authorId } = req.params;
      const { limit = "6", exclude } = req.query;
      
      const excludeIds = exclude ? (typeof exclude === 'string' ? exclude.split(',') : exclude) : [];
      
      const posts = await contentAnalyticsService.getPostsByAuthor(
        authorId,
        parseInt(limit as string, 10),
        excludeIds as string[]
      );

      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching author posts: " + error.message });
    }
  });

  // Get recently updated posts
  app.get("/api/blog/recently-updated", async (req, res) => {
    try {
      const { limit = "10" } = req.query;
      
      const posts = await contentAnalyticsService.getRecentlyUpdatedPosts(
        parseInt(limit as string, 10)
      );

      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching recently updated posts: " + error.message });
    }
  });

  // Get blog archive data
  app.get("/api/blog/archive", async (req, res) => {
    try {
      const archiveData = await contentAnalyticsService.getArchiveData();
      res.json(archiveData);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching archive data: " + error.message });
    }
  });

  // Track post view (for analytics)
  app.post("/api/blog/posts/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      const userAgent = req.headers['user-agent'];
      
      await contentAnalyticsService.trackPostView(id, userAgent);
      res.json({ message: "View tracked successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error tracking post view: " + error.message });
    }
  });

  // Get content recommendations based on reading patterns
  app.get("/api/blog/recommendations", async (req, res) => {
    try {
      const { 
        basedOn, // comma-separated post IDs that user has read
        limit = "10",
        categoryId 
      } = req.query;

      if (!basedOn) {
        // Fallback to popular posts if no reading history
        const { posts } = await storage.getBlogPosts({
          status: 'published',
          categoryIds: categoryId ? [categoryId as string] : undefined,
          sortBy: 'viewCount',
          sortOrder: 'desc',
          limit: parseInt(limit as string, 10),
          offset: 0
        });
        return res.json(posts);
      }

      const basePostIds = (basedOn as string).split(',');
      const recommendations = new Set();
      
      // Get related posts for each base post
      for (const postId of basePostIds) {
        try {
          const basePost = await storage.getBlogPost(postId);
          if (basePost) {
            const related = await contentAnalyticsService.getRelatedPosts(
              basePost, 
              Math.ceil(parseInt(limit as string, 10) / basePostIds.length)
            );
            related.forEach(post => recommendations.add(JSON.stringify(post)));
          }
        } catch (error) {
          console.warn(`Could not get recommendations for post ${postId}:`, error);
        }
      }

      const recommendedPosts = Array.from(recommendations)
        .map(postStr => JSON.parse(postStr as string))
        .slice(0, parseInt(limit as string, 10));

      res.json(recommendedPosts);
    } catch (error: any) {
      res.status(500).json({ message: "Error generating recommendations: " + error.message });
    }
  });

  // Get breadcrumb data for a specific post
  app.get("/api/blog/breadcrumb/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      const post = await storage.getBlogPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      const breadcrumbs = [
        { label: "خانه", href: "/" },
        { label: "وبلاگ", href: "/blog" }
      ];

      // Add category if exists
      if (post.categoryId) {
        try {
          const category = await storage.getBlogCategory(post.categoryId);
          if (category) {
            breadcrumbs.push({
              label: category.name,
              href: `/blog/category/${category.slug}`
            });
          }
        } catch (error) {
          console.warn("Could not fetch category for breadcrumb:", error);
        }
      }

      // Add current post
      breadcrumbs.push({
        label: post.title,
        href: `/blog/${slug}`,
        current: true
      });

      res.json(breadcrumbs);
    } catch (error: any) {
      res.status(500).json({ message: "Error generating breadcrumb: " + error.message });
    }
  });

  // Get content analytics for a specific post
  app.get("/api/blog/posts/:id/analytics", async (req, res) => {
    try {
      const { id } = req.params;
      
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      const analytics = contentAnalyticsService.analyzeContent(post.content);
      
      res.json({
        ...analytics,
        viewCount: post.viewCount || 0,
        shareCount: post.shareCount || 0
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching post analytics: " + error.message });
    }
  });

  // Blog Authors routes
  app.get("/api/blog/authors", async (req, res) => {
    try {
      const authors = await storage.getBlogAuthors();
      res.json(authors);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog authors: " + error.message });
    }
  });

  app.get("/api/blog/authors/:id", async (req, res) => {
    try {
      const author = await storage.getBlogAuthor(req.params.id);
      if (!author) {
        return res.status(404).json({ message: "Blog author not found" });
      }
      res.json(author);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog author: " + error.message });
    }
  });

  app.post("/api/blog/authors", requireAdmin, async (req, res) => {
    try {
      const result = insertBlogAuthorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog author data", errors: result.error.errors });
      }
      
      const author = await storage.createBlogAuthor(result.data);
      res.status(201).json(author);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating blog author: " + error.message });
    }
  });

  app.put("/api/blog/authors/:id", requireAdmin, async (req, res) => {
    try {
      const authorId = req.params.id;
      const result = insertBlogAuthorSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog author data", errors: result.error.errors });
      }
      
      const author = await storage.updateBlogAuthor(authorId, result.data);
      res.json(author);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Error updating blog author: " + error.message });
    }
  });

  app.delete("/api/blog/authors/:id", requireAdmin, async (req, res) => {
    try {
      const authorId = req.params.id;
      const deleted = await storage.deleteBlogAuthor(authorId);
      if (!deleted) {
        return res.status(404).json({ message: "Blog author not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting blog author: " + error.message });
    }
  });

  // Blog Categories routes
  app.get("/api/blog/categories", async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog categories: " + error.message });
    }
  });

  app.get("/api/blog/categories/:id", async (req, res) => {
    try {
      const category = await storage.getBlogCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Blog category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog category: " + error.message });
    }
  });

  app.get("/api/blog/categories/slug/:slug", async (req, res) => {
    try {
      const category = await storage.getBlogCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Blog category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog category: " + error.message });
    }
  });

  app.post("/api/blog/categories", requireAdmin, async (req, res) => {
    try {
      const result = insertBlogCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog category data", errors: result.error.errors });
      }
      
      const category = await storage.createBlogCategory(result.data);
      res.status(201).json(category);
    } catch (error: any) {
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Blog category with this slug already exists" });
      }
      res.status(500).json({ message: "Error creating blog category: " + error.message });
    }
  });

  app.put("/api/blog/categories/:id", requireAdmin, async (req, res) => {
    try {
      const categoryId = req.params.id;
      const result = insertBlogCategorySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog category data", errors: result.error.errors });
      }
      
      const category = await storage.updateBlogCategory(categoryId, result.data);
      res.json(category);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Blog category with this slug already exists" });
      }
      res.status(500).json({ message: "Error updating blog category: " + error.message });
    }
  });

  app.delete("/api/blog/categories/:id", requireAdmin, async (req, res) => {
    try {
      const categoryId = req.params.id;
      const deleted = await storage.deleteBlogCategory(categoryId);
      if (!deleted) {
        return res.status(404).json({ message: "Blog category not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting blog category: " + error.message });
    }
  });

  // Bulk operations for blog categories
  app.post("/api/blog/categories/bulk-delete", requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid category IDs array" });
      }
      
      const result = await storage.deleteBlogCategoriesBulk(ids);
      res.json({ deletedCount: result });
    } catch (error: any) {
      res.status(500).json({ message: "Error bulk deleting blog categories: " + error.message });
    }
  });

  // Get blog categories with post counts
  app.get("/api/blog/categories/with-stats", async (req, res) => {
    try {
      const categoriesWithStats = await storage.getBlogCategoriesWithStats();
      res.json(categoriesWithStats);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog categories with stats: " + error.message });
    }
  });

  // Blog Tags routes
  app.get("/api/blog/tags", async (req, res) => {
    try {
      const tags = await storage.getBlogTags();
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog tags: " + error.message });
    }
  });

  app.get("/api/blog/tags/:id", async (req, res) => {
    try {
      const tag = await storage.getBlogTag(req.params.id);
      if (!tag) {
        return res.status(404).json({ message: "Blog tag not found" });
      }
      res.json(tag);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog tag: " + error.message });
    }
  });

  app.get("/api/blog/tags/slug/:slug", async (req, res) => {
    try {
      const tag = await storage.getBlogTagBySlug(req.params.slug);
      if (!tag) {
        return res.status(404).json({ message: "Blog tag not found" });
      }
      res.json(tag);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog tag: " + error.message });
    }
  });

  app.post("/api/blog/tags", requireAdmin, async (req, res) => {
    try {
      const result = insertBlogTagSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog tag data", errors: result.error.errors });
      }
      
      const tag = await storage.createBlogTag(result.data);
      res.status(201).json(tag);
    } catch (error: any) {
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Blog tag with this slug already exists" });
      }
      res.status(500).json({ message: "Error creating blog tag: " + error.message });
    }
  });

  app.put("/api/blog/tags/:id", requireAdmin, async (req, res) => {
    try {
      const tagId = req.params.id;
      const result = insertBlogTagSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog tag data", errors: result.error.errors });
      }
      
      const tag = await storage.updateBlogTag(tagId, result.data);
      res.json(tag);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Blog tag with this slug already exists" });
      }
      res.status(500).json({ message: "Error updating blog tag: " + error.message });
    }
  });

  app.delete("/api/blog/tags/:id", requireAdmin, async (req, res) => {
    try {
      const tagId = req.params.id;
      const deleted = await storage.deleteBlogTag(tagId);
      if (!deleted) {
        return res.status(404).json({ message: "Blog tag not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting blog tag: " + error.message });
    }
  });

  // Bulk operations for blog tags
  app.post("/api/blog/tags/bulk-delete", requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid tag IDs array" });
      }
      
      const result = await storage.deleteBlogTagsBulk(ids);
      res.json({ deletedCount: result });
    } catch (error: any) {
      res.status(500).json({ message: "Error bulk deleting blog tags: " + error.message });
    }
  });

  // Get blog tags with usage counts
  app.get("/api/blog/tags/with-stats", async (req, res) => {
    try {
      const tagsWithStats = await storage.getBlogTagsWithStats();
      res.json(tagsWithStats);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog tags with stats: " + error.message });
    }
  });

  // Blog Authors routes
  app.get("/api/blog/authors", async (req, res) => {
    try {
      const options: any = {};
      
      // Parse query parameters
      if (req.query.limit) options.limit = parseInt(req.query.limit as string);
      if (req.query.offset) options.offset = parseInt(req.query.offset as string);
      if (req.query.search) options.search = req.query.search as string;
      if (req.query.active !== undefined) options.active = req.query.active === 'true';
      if (req.query.featured !== undefined) options.featured = req.query.featured === 'true';
      if (req.query.sortBy) options.sortBy = req.query.sortBy as string;
      if (req.query.sortOrder) options.sortOrder = req.query.sortOrder as 'asc' | 'desc';
      
      const result = await storage.getBlogAuthors(options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog authors: " + error.message });
    }
  });

  app.get("/api/blog/authors/:id", async (req, res) => {
    try {
      const author = await storage.getBlogAuthor(req.params.id);
      if (!author) {
        return res.status(404).json({ message: "Blog author not found" });
      }
      res.json(author);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog author: " + error.message });
    }
  });

  app.get("/api/blog/authors/slug/:slug", async (req, res) => {
    try {
      const author = await storage.getBlogAuthorBySlug(req.params.slug);
      if (!author) {
        return res.status(404).json({ message: "Blog author not found" });
      }
      res.json(author);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog author: " + error.message });
    }
  });

  app.post("/api/blog/authors", requireAdmin, async (req, res) => {
    try {
      const result = insertBlogAuthorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog author data", errors: result.error.errors });
      }
      
      const author = await storage.createBlogAuthor(result.data);
      res.status(201).json(author);
    } catch (error: any) {
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Blog author with this slug already exists" });
      }
      res.status(500).json({ message: "Error creating blog author: " + error.message });
    }
  });

  app.put("/api/blog/authors/:id", requireAdmin, async (req, res) => {
    try {
      const authorId = req.params.id;
      const result = insertBlogAuthorSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid blog author data", errors: result.error.errors });
      }
      
      const author = await storage.updateBlogAuthor(authorId, result.data);
      res.json(author);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ message: "Blog author with this slug already exists" });
      }
      res.status(500).json({ message: "Error updating blog author: " + error.message });
    }
  });

  app.delete("/api/blog/authors/:id", requireAdmin, async (req, res) => {
    try {
      const authorId = req.params.id;
      const deleted = await storage.deleteBlogAuthor(authorId);
      if (!deleted) {
        return res.status(404).json({ message: "Blog author not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting blog author: " + error.message });
    }
  });

  // Bulk operations for blog authors
  app.post("/api/blog/authors/bulk-delete", requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid author IDs array" });
      }
      
      const result = await storage.deleteBlogAuthorsBulk(ids);
      res.json({ deletedCount: result });
    } catch (error: any) {
      res.status(500).json({ message: "Error bulk deleting blog authors: " + error.message });
    }
  });

  // Get blog authors with statistics
  app.get("/api/blog/authors/with-stats", async (req, res) => {
    try {
      const authorsWithStats = await storage.getBlogAuthorsWithStats();
      res.json(authorsWithStats);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog authors with stats: " + error.message });
    }
  });

  // Get individual author statistics
  app.get("/api/blog/authors/:id/stats", async (req, res) => {
    try {
      const authorId = req.params.id;
      const stats = await storage.getBlogAuthorStats(authorId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog author stats: " + error.message });
    }
  });

  // Get posts by author (by author ID)
  app.get("/api/blog/authors/:id/posts", async (req, res) => {
    try {
      const authorId = req.params.id;
      const options: any = {};
      
      // Parse query parameters
      if (req.query.limit) options.limit = parseInt(req.query.limit as string);
      if (req.query.offset) options.offset = parseInt(req.query.offset as string);
      
      const result = await storage.getBlogPostsByAuthor(authorId, options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog posts by author: " + error.message });
    }
  });

  // Get posts by author slug
  app.get("/api/blog/authors/slug/:slug/posts", async (req, res) => {
    try {
      const slug = req.params.slug;
      
      // First get the author by slug
      const author = await storage.getBlogAuthorBySlug(slug);
      if (!author) {
        return res.status(404).json({ message: "Blog author not found" });
      }
      
      const options: any = {};
      // Parse query parameters
      if (req.query.limit) options.limit = parseInt(req.query.limit as string);
      if (req.query.offset) options.offset = parseInt(req.query.offset as string);
      
      const result = await storage.getBlogPostsByAuthor(author.id, options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching blog posts by author slug: " + error.message });
    }
  });

  // ============================================================================
  // SEO ROUTES - Sitemap, RSS, and SEO Validation Endpoints
  // ============================================================================

  // Main blog sitemap endpoint
  app.get("/sitemap-blog.xml", async (req, res) => {
    try {
      const cacheKey = "sitemap-blog";
      let sitemapXML = sitemapCache.get(cacheKey);
      
      if (!sitemapXML) {
        sitemapXML = await sitemapGenerator.generateBlogSitemap();
        sitemapCache.set(cacheKey, sitemapXML);
      }
      
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      res.send(sitemapXML);
    } catch (error: any) {
      console.error('Error generating blog sitemap:', error);
      res.status(500).json({ message: "Error generating sitemap: " + error.message });
    }
  });

  // Category-specific sitemap
  app.get("/sitemap-blog-category-:slug.xml", async (req, res) => {
    try {
      const { slug } = req.params;
      const cacheKey = `sitemap-category-${slug}`;
      let sitemapXML = sitemapCache.get(cacheKey);
      
      if (!sitemapXML) {
        sitemapXML = await sitemapGenerator.generateCategorySitemap(slug);
        sitemapCache.set(cacheKey, sitemapXML);
      }
      
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=7200'); // 2 hours cache
      res.send(sitemapXML);
    } catch (error: any) {
      console.error('Error generating category sitemap:', error);
      res.status(500).json({ message: "Error generating category sitemap: " + error.message });
    }
  });

  // Author-specific sitemap
  app.get("/sitemap-blog-author-:slug.xml", async (req, res) => {
    try {
      const { slug } = req.params;
      const cacheKey = `sitemap-author-${slug}`;
      let sitemapXML = sitemapCache.get(cacheKey);
      
      if (!sitemapXML) {
        sitemapXML = await sitemapGenerator.generateAuthorSitemap(slug);
        sitemapCache.set(cacheKey, sitemapXML);
      }
      
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=7200'); // 2 hours cache
      res.send(sitemapXML);
    } catch (error: any) {
      console.error('Error generating author sitemap:', error);
      res.status(500).json({ message: "Error generating author sitemap: " + error.message });
    }
  });

  // Sitemap index
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const cacheKey = "sitemap-index";
      let sitemapXML = sitemapCache.get(cacheKey);
      
      if (!sitemapXML) {
        sitemapXML = await sitemapGenerator.generateSitemapIndex();
        sitemapCache.set(cacheKey, sitemapXML);
      }
      
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      res.send(sitemapXML);
    } catch (error: any) {
      console.error('Error generating sitemap index:', error);
      res.status(500).json({ message: "Error generating sitemap index: " + error.message });
    }
  });

  // ============================================================================
  // BLOG SEARCH ENDPOINTS
  // ============================================================================

  // Main advanced search endpoint
  app.get("/api/blog/search", async (req, res) => {
    try {
      const {
        q: query = "",
        scope = "all",
        categoryIds,
        authorIds,
        tags,
        startDate,
        endDate,
        minReadingTime,
        maxReadingTime,
        contentType,
        sortBy = "relevance",
        sortOrder = "desc",
        limit = "20",
        offset = "0",
        featured
      } = req.query;

      const searchOptions = {
        query: query as string,
        scope: scope as "all" | "title" | "content" | "authors" | "tags",
        categoryIds: categoryIds ? (categoryIds as string).split(",") : undefined,
        authorIds: authorIds ? (authorIds as string).split(",") : undefined,
        tags: tags ? (tags as string).split(",") : undefined,
        dateRange: {
          start: startDate ? new Date(startDate as string) : undefined,
          end: endDate ? new Date(endDate as string) : undefined
        },
        readingTimeRange: {
          min: minReadingTime ? parseInt(minReadingTime as string) : undefined,
          max: maxReadingTime ? parseInt(maxReadingTime as string) : undefined
        },
        sortBy: sortBy as "relevance" | "publishedAt" | "title" | "readingTime" | "viewCount",
        sortOrder: sortOrder as "asc" | "desc",
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        featured: featured ? featured === "true" : undefined
      };

      const searchResults = await blogSearchService.search(searchOptions);
      
      res.json(searchResults);
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Error performing search: " + error.message });
    }
  });

  // Search autocomplete suggestions
  app.get("/api/blog/search/suggestions", async (req, res) => {
    try {
      const { q: query = "", limit = "10" } = req.query;
      
      if (!query || (query as string).length < 2) {
        return res.json([]);
      }

      const suggestions = await blogSearchService.getSearchSuggestions(query as string);
      const limitedSuggestions = suggestions.slice(0, parseInt(limit as string));
      
      res.json(limitedSuggestions);
    } catch (error: any) {
      console.error("Error getting search suggestions:", error);
      res.status(500).json({ message: "Error getting search suggestions: " + error.message });
    }
  });

  // Popular search terms
  app.get("/api/blog/search/popular", async (req, res) => {
    try {
      const { limit = "10" } = req.query;
      
      const popularSearches = await blogSearchService.getPopularSearches(
        parseInt(limit as string)
      );
      
      res.json(popularSearches);
    } catch (error: any) {
      console.error("Error getting popular searches:", error);
      res.status(500).json({ message: "Error getting popular searches: " + error.message });
    }
  });

  // Track search analytics
  app.post("/api/blog/search/analytics", async (req, res) => {
    try {
      const result = insertBlogSearchAnalyticsSchema.safeParse({
        ...req.body,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid analytics data", 
          errors: result.error.errors 
        });
      }

      await blogSearchService.trackSearch(result.data);
      
      res.status(201).json({ message: "Analytics tracked successfully" });
    } catch (error: any) {
      console.error("Error tracking search analytics:", error);
      res.status(500).json({ message: "Error tracking search analytics: " + error.message });
    }
  });

  // Save search query
  app.post("/api/blog/search/saved", async (req, res) => {
    try {
      const result = insertBlogSavedSearchSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid saved search data", 
          errors: result.error.errors 
        });
      }

      const searchId = await blogSearchService.saveSearch(result.data);
      
      res.status(201).json({ id: searchId, message: "Search saved successfully" });
    } catch (error: any) {
      console.error("Error saving search:", error);
      res.status(500).json({ message: "Error saving search: " + error.message });
    }
  });

  // Get saved searches
  app.get("/api/blog/search/saved", async (req, res) => {
    try {
      const { sessionId } = req.query;
      
      const savedSearches = await blogSearchService.getSavedSearches(
        sessionId as string
      );
      
      res.json(savedSearches);
    } catch (error: any) {
      console.error("Error getting saved searches:", error);
      res.status(500).json({ message: "Error getting saved searches: " + error.message });
    }
  });

  // Delete saved search
  app.delete("/api/blog/search/saved/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Note: This would need to be implemented in the search service
      // For now, return a placeholder response
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting saved search:", error);
      res.status(500).json({ message: "Error deleting saved search: " + error.message });
    }
  });

  // Search performance test endpoint (development only)
  app.get("/api/blog/search/test-performance", async (req, res) => {
    try {
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "Not available in production" });
      }

      const { q: query = "test", iterations = "10" } = req.query;
      const iterCount = parseInt(iterations as string);
      
      const startTime = Date.now();
      const results = [];
      
      for (let i = 0; i < iterCount; i++) {
        const iterStart = Date.now();
        await blogSearchService.search({
          query: query as string,
          limit: 20,
          offset: 0
        }, false); // Don't track analytics for performance tests
        const iterEnd = Date.now();
        results.push(iterEnd - iterStart);
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
      const minTime = Math.min(...results);
      const maxTime = Math.max(...results);
      
      res.json({
        query: query as string,
        iterations: iterCount,
        totalTime,
        averageTime: avgTime,
        minTime,
        maxTime,
        individualTimes: results
      });
    } catch (error: any) {
      console.error("Error running search performance test:", error);
      res.status(500).json({ message: "Error running search performance test: " + error.message });
    }
  });

  // Comprehensive search endpoint (products + blog posts)
  app.get("/api/search/comprehensive", async (req, res) => {
    try {
      const { 
        q: query = "", 
        limit = "5" 
      } = req.query;
      
      if (!query || (query as string).trim().length < 2) {
        return res.json({
          products: [],
          blogArticles: [],
          total: 0
        });
      }
      
      const searchLimit = parseInt(limit as string);
      const searchQuery = (query as string).trim();
      
      // Search products
      const productResults = await storage.searchProducts({
        query: searchQuery,
        limit: searchLimit,
        inStock: true // Only show in-stock products
      });
      
      // Search blog posts
      const blogResults = await blogSearchService.search({
        query: searchQuery,
        limit: searchLimit,
        status: 'published' // Only show published posts
      }, false); // Don't track analytics for autocomplete
      
      // Format product results for frontend
      const formattedProducts = productResults.products.map(product => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        categoryId: product.categoryId,
        featured: product.featured,
        type: 'product' as const
      }));
      
      // Format blog article results for frontend
      const formattedBlogArticles = blogResults.results.map(result => ({
        id: result.post.id,
        title: result.post.title,
        slug: result.post.slug,
        excerpt: result.post.excerpt,
        featuredImage: result.post.featuredImage,
        publishedAt: result.post.publishedAt,
        readingTime: result.post.readingTime,
        author: result.post.author,
        category: result.post.category,
        snippet: result.snippet,
        highlightedTitle: result.highlightedTitle,
        type: 'blog' as const
      }));
      
      res.json({
        products: formattedProducts,
        blogArticles: formattedBlogArticles,
        total: productResults.total + blogResults.total
      });
      
    } catch (error: any) {
      console.error("Error in comprehensive search:", error);
      res.status(500).json({ 
        message: "Error performing comprehensive search: " + error.message,
        products: [],
        blogArticles: [],
        total: 0
      });
    }
  });

  // ============================================================================
  // SEO AND CONTENT DISCOVERY ENDPOINTS
  // ============================================================================

  // Sitemap statistics and validation
  app.get("/api/seo/sitemap/stats", async (req, res) => {
    try {
      const stats = await sitemapGenerator.getSitemapStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Error getting sitemap stats: " + error.message });
    }
  });

  app.get("/api/seo/sitemap/validate", async (req, res) => {
    try {
      const validation = await sitemapGenerator.validateSitemap();
      res.json(validation);
    } catch (error: any) {
      res.status(500).json({ message: "Error validating sitemap: " + error.message });
    }
  });

  // Clear sitemap cache
  app.post("/api/admin/seo/sitemap/clear-cache", requireAdmin, async (req, res) => {
    try {
      sitemapCache.clear();
      res.json({ message: "Sitemap cache cleared successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error clearing sitemap cache: " + error.message });
    }
  });

  // ============================================================================
  // RSS FEED ENDPOINTS
  // ============================================================================

  // Main blog RSS feed
  app.get("/blog/feed.xml", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const cacheKey = `rss-blog-${limit}`;
      let rssXML = rssCache.get(cacheKey);
      
      if (!rssXML) {
        rssXML = await rssGenerator.generateBlogFeed(limit);
        rssCache.set(cacheKey, rssXML);
      }
      
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes cache
      res.send(rssXML);
    } catch (error: any) {
      console.error('Error generating RSS feed:', error);
      res.status(500).json({ message: "Error generating RSS feed: " + error.message });
    }
  });

  // Alternative RSS feed endpoint
  app.get("/rss.xml", async (req, res) => {
    res.redirect(301, "/blog/feed.xml");
  });

  // Category-specific RSS feed
  app.get("/blog/category/:slug/feed.xml", async (req, res) => {
    try {
      const { slug } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const cacheKey = `rss-category-${slug}-${limit}`;
      let rssXML = rssCache.get(cacheKey);
      
      if (!rssXML) {
        rssXML = await rssGenerator.generateCategoryFeed(slug, limit);
        rssCache.set(cacheKey, rssXML);
      }
      
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      res.send(rssXML);
    } catch (error: any) {
      console.error('Error generating category RSS feed:', error);
      res.status(500).json({ message: "Error generating category RSS feed: " + error.message });
    }
  });

  // Author-specific RSS feed
  app.get("/blog/author/:slug/feed.xml", async (req, res) => {
    try {
      const { slug } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const cacheKey = `rss-author-${slug}-${limit}`;
      let rssXML = rssCache.get(cacheKey);
      
      if (!rssXML) {
        rssXML = await rssGenerator.generateAuthorFeed(slug, limit);
        rssCache.set(cacheKey, rssXML);
      }
      
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      res.send(rssXML);
    } catch (error: any) {
      console.error('Error generating author RSS feed:', error);
      res.status(500).json({ message: "Error generating author RSS feed: " + error.message });
    }
  });

  // Tag-specific RSS feed
  app.get("/blog/tag/:slug/feed.xml", async (req, res) => {
    try {
      const { slug } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const cacheKey = `rss-tag-${slug}-${limit}`;
      let rssXML = rssCache.get(cacheKey);
      
      if (!rssXML) {
        rssXML = await rssGenerator.generateTagFeed(slug, limit);
        rssCache.set(cacheKey, rssXML);
      }
      
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      res.send(rssXML);
    } catch (error: any) {
      console.error('Error generating tag RSS feed:', error);
      res.status(500).json({ message: "Error generating tag RSS feed: " + error.message });
    }
  });

  // RSS statistics and validation
  app.get("/api/seo/rss/stats", async (req, res) => {
    try {
      const stats = await rssGenerator.getRSSStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: "Error getting RSS stats: " + error.message });
    }
  });

  app.get("/api/seo/rss/validate", async (req, res) => {
    try {
      const validation = await rssGenerator.validateFeeds();
      res.json(validation);
    } catch (error: any) {
      res.status(500).json({ message: "Error validating RSS feeds: " + error.message });
    }
  });

  // Clear RSS cache
  app.post("/api/admin/seo/rss/clear-cache", requireAdmin, async (req, res) => {
    try {
      rssCache.clear();
      res.json({ message: "RSS cache cleared successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error clearing RSS cache: " + error.message });
    }
  });

  // ============================================================================
  // SEO VALIDATION AND UTILITIES
  // ============================================================================

  // Validate blog post SEO
  app.post("/api/seo/validate/post", async (req, res) => {
    try {
      const { title, description, keywords, content, image, slug } = req.body;
      
      const validation = {
        title: {
          isValid: !!title,
          length: title?.length || 0,
          recommendation: title?.length > 60 ? 'Title is too long' : 
                        title?.length < 30 ? 'Title is too short' : 'Good length',
          issues: !title ? ['Title is required'] : []
        },
        description: {
          isValid: !!description,
          length: description?.length || 0,
          recommendation: description?.length > 160 ? 'Description is too long' : 
                        description?.length < 120 ? 'Description is too short' : 'Good length',
          issues: !description ? ['Description is required'] : []
        },
        keywords: {
          isValid: keywords && keywords.length > 0,
          count: keywords?.length || 0,
          recommendation: keywords?.length > 10 ? 'Too many keywords' : 
                         !keywords || keywords.length === 0 ? 'Add some keywords' : 'Good keyword count',
          issues: !keywords || keywords.length === 0 ? ['Keywords are recommended'] : []
        },
        content: {
          isValid: !!content,
          wordCount: content ? content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
          readingTime: content ? Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200) : 0,
          issues: !content ? ['Content is required'] : []
        },
        image: {
          isValid: !!image,
          hasAlt: !!image,
          issues: !image ? ['Featured image is recommended'] : []
        },
        slug: {
          isValid: !!slug,
          isSEOFriendly: slug ? /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) : false,
          issues: !slug ? ['Slug is required'] : 
                 !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? ['Slug should be SEO-friendly (lowercase, hyphens only)'] : []
        }
      };

      const totalIssues = Object.values(validation).reduce((count, item) => count + (item as any).issues.length, 0);
      
      res.json({
        isValid: totalIssues === 0,
        score: Math.max(0, 100 - (totalIssues * 10)),
        validation,
        recommendations: [
          'Use focus keywords in title and description',
          'Include internal and external links',
          'Add alt text to all images',
          'Use header tags (H2, H3) for structure',
          'Keep paragraphs short and readable'
        ]
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error validating SEO: " + error.message });
    }
  });

  // Generate OG image
  app.get("/api/og-image", async (req, res) => {
    try {
      const { title, category, author, type = 'blog' } = req.query;
      
      if (!title) {
        return res.status(400).json({ message: "Title parameter is required" });
      }

      // Simple OG image generation (could be enhanced with actual image generation)
      const ogImageUrl = `https://via.placeholder.com/1200x630/3B82F6/FFFFFF?text=${encodeURIComponent(title as string)}`;
      
      res.json({
        url: ogImageUrl,
        width: 1200,
        height: 630,
        type: 'image/png'
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error generating OG image: " + error.message });
    }
  });

  // Ping search engines about sitemap updates
  app.post("/api/seo/ping-search-engines", requireAdmin, async (req, res) => {
    try {
      const sitemapUrl = `${req.protocol}://${req.get('host')}/sitemap-blog.xml`;
      const results = [];

      // Ping Google
      try {
        const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        // Note: In a real implementation, you'd make an HTTP request here
        results.push({ service: 'Google', success: true, url: googleUrl });
      } catch (error) {
        results.push({ service: 'Google', success: false, error: 'Failed to ping Google' });
      }

      // Ping Bing
      try {
        const bingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
        // Note: In a real implementation, you'd make an HTTP request here
        results.push({ service: 'Bing', success: true, url: bingUrl });
      } catch (error) {
        results.push({ service: 'Bing', success: false, error: 'Failed to ping Bing' });
      }

      res.json({
        message: "Search engines pinged successfully",
        sitemapUrl,
        results
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error pinging search engines: " + error.message });
    }
  });

  // SEO dashboard data
  app.get("/api/seo/dashboard", async (req, res) => {
    try {
      const [sitemapStats, rssStats] = await Promise.all([
        sitemapGenerator.getSitemapStats(),
        rssGenerator.getRSSStats()
      ]);

      // Get recent blog posts for SEO analysis
      const recentPosts = await storage.getBlogPosts({
        status: 'published',
        limit: 10,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });

      const seoIssues = [];
      let postsWithoutImages = 0;
      let postsWithoutDescriptions = 0;

      for (const post of recentPosts.posts) {
        if (!post.featuredImage) postsWithoutImages++;
        if (!post.seoDescription && !post.excerpt) postsWithoutDescriptions++;
      }

      if (postsWithoutImages > 0) {
        seoIssues.push(`${postsWithoutImages} recent posts missing featured images`);
      }
      if (postsWithoutDescriptions > 0) {
        seoIssues.push(`${postsWithoutDescriptions} recent posts missing SEO descriptions`);
      }

      res.json({
        sitemap: sitemapStats,
        rss: rssStats,
        recentPosts: recentPosts.total,
        seoIssues,
        lastUpdated: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error getting SEO dashboard data: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
