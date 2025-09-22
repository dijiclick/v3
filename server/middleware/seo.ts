import { Request, Response, NextFunction } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { storage } from '../storage';

const getBaseHTML = () => {
  const htmlPath = join(process.cwd(), 'client', 'index.html');
  return readFileSync(htmlPath, 'utf-8');
};

const removeConflictingMetaTags = (html: string) => {
  return html
    // Remove base title
    .replace(/<title>.*?<\/title>/i, '')
    // Remove conflicting meta tags
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+name="keywords"[^>]*>/gi, '')
    .replace(/<meta\s+name="robots"[^>]*>/gi, '')
    // Remove conflicting Open Graph tags
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    // Remove conflicting Twitter tags
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    // Remove base canonical
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '');
};

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const getAbsoluteUrl = (req: Request, path: string = '') => {
  const protocol = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}${path}`;
};

export const seoMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Only handle HTML GET requests, skip API routes and static assets
  if (req.method !== 'GET' || 
      req.path.startsWith('/api') || 
      req.path.includes('.') || 
      !req.accepts('text/html')) {
    return next();
  }

  // Skip SEO middleware in development mode to allow Vite to handle routing properly
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const url = req.path;
  
  // Handle product pages with new /:categorySlug/:productSlug format
  const urlParts = url.split('/').filter(part => part);
  if (urlParts.length === 2) {
    const [categorySlug, productSlug] = urlParts;
    
    if (!categorySlug || !productSlug) {
      return next();
    }

    try {
      // Fetch product data server-side using new method
      const product = await storage.getProductByCategoryAndSlug(categorySlug, productSlug);

      if (!product) {
        // Product not found - return 404 with proper SEO
        res.status(404);
        
        let html = removeConflictingMetaTags(getBaseHTML());
        
        const notFoundMeta = `<title>Product Not Found - TechShop</title>
    <meta name="description" content="The product you're looking for couldn't be found. Browse our collection of premium electronics and more." />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="${getAbsoluteUrl(req, url)}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="Product Not Found - TechShop" />
    <meta property="og:description" content="The product you're looking for couldn't be found. Browse our collection of premium electronics and more." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${getAbsoluteUrl(req, url)}" />
    <meta property="og:site_name" content="TechShop" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Product Not Found - TechShop" />
    <meta name="twitter:description" content="The product you're looking for couldn't be found. Browse our collection of premium electronics and more." />`;

        html = html.replace(
          '<meta charset="UTF-8" />',
          `<meta charset="UTF-8" />
    ${notFoundMeta}`
        );

        return res.send(html);
      }

      // Product found - inject product-specific meta tags
      let html = removeConflictingMetaTags(getBaseHTML());
      
      const absoluteImageUrl = product.image?.startsWith('http') 
        ? product.image 
        : product.image 
          ? getAbsoluteUrl(req, product.image)
          : `${getAbsoluteUrl(req)}/images/product-placeholder.jpg`;

      const productMeta = `<title>${escapeHtml(product.title)} - TechShop</title>
    <meta name="description" content="${escapeHtml(product.description || `Buy ${product.title} for $${product.price}. ${product.inStock ? 'In stock' : 'Out of stock'} with fast shipping and excellent customer service.`)}" />
    <meta name="keywords" content="${escapeHtml(`${product.title}, ${product.tags?.join(', ') || ''}, buy online, tech shop`)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${getAbsoluteUrl(req, url)}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(product.title)} - TechShop" />
    <meta property="og:description" content="${escapeHtml(product.description || `Buy ${product.title} for $${product.price}. ${product.inStock ? 'In stock' : 'Out of stock'} with fast shipping.`)}" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${getAbsoluteUrl(req, url)}" />
    <meta property="og:image" content="${absoluteImageUrl}" />
    <meta property="og:site_name" content="TechShop" />
    <meta property="product:price:amount" content="${product.price}" />
    <meta property="product:price:currency" content="USD" />
    <meta property="product:availability" content="${product.inStock ? 'in stock' : 'out of stock'}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(product.title)} - TechShop" />
    <meta name="twitter:description" content="${escapeHtml(product.description || `Buy ${product.title} for $${product.price}. ${product.inStock ? 'In stock' : 'Out of stock'} with fast shipping.`)}" />
    <meta name="twitter:image" content="${absoluteImageUrl}" />`;

      // Product structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.title,
        "description": product.description,
        "image": absoluteImageUrl,
        "sku": product.slug,
        "brand": {
          "@type": "Brand",
          "name": "TechShop"
        },
        "offers": {
          "@type": "Offer",
          "url": getAbsoluteUrl(req, url),
          "priceCurrency": "USD",
          "price": product.price,
          "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "TechShop"
          }
        },
        "aggregateRating": product.rating && product.reviewCount ? {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.reviewCount,
          "bestRating": "5",
          "worstRating": "1"
        } : undefined
      };

      const jsonLd = `
    <script type="application/ld+json" data-seo="server-product">
${JSON.stringify(structuredData, null, 2)}
    </script>`;

      // Add product meta tags after charset
      html = html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />
    ${productMeta}`
      );
      
      html = html.replace(
        '</head>',
        `${jsonLd}
  </head>`
      );

      return res.send(html);

    } catch (error) {
      console.error('SEO middleware error:', error);
      return next();
    }
  }

  // For other routes, continue to default handling
  next();
};