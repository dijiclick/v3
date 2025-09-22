import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertPageSchema } from "@shared/schema";
import { sessionStore, verifyPassword, requireAdmin, getCookieOptions, getCSRFCookieOptions } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());
  
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

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: 'public/uploads/',
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
      
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ 
        success: true, 
        imageUrl,
        message: "Image uploaded successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error uploading image: " + error.message });
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
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

  const httpServer = createServer(app);
  return httpServer;
}
