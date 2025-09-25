import express, { type Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertPageSchema, insertProductPlanSchema, insertBlogPostSchema, insertBlogAuthorSchema, insertBlogCategorySchema, insertBlogTagSchema } from "@shared/schema";
import { sessionStore, verifyPassword, requireAdmin, getCookieOptions, getCSRFCookieOptions } from "./auth";

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
      const products = await storage.getProducts();
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

  const httpServer = createServer(app);
  return httpServer;
}
