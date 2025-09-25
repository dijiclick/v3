/**
 * Error handling utilities for blog components
 * Provides consistent error handling, retry mechanisms, and Persian error messages
 */

import { useToast } from "@/hooks/use-toast";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  timestamp?: Date;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

export class BlogErrorHandler {
  private static defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  };

  /**
   * Persian error messages for different error scenarios
   */
  static errorMessages = {
    network: "خطا در اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید.",
    server: "خطای داخلی سرور. لطفاً بعداً تلاش کنید.",
    notFound: "محتوای درخواستی یافت نشد.",
    timeout: "درخواست شما زمان زیادی طول کشید. لطفاً مجدداً تلاش کنید.",
    unauthorized: "شما مجاز به دسترسی این محتوا نیستید.",
    forbidden: "دسترسی به این محتوا امکان‌پذیر نیست.",
    tooManyRequests: "درخواست‌های زیادی ارسال شده. لطفاً کمی صبر کنید.",
    badRequest: "درخواست نامعتبر است. لطفاً اطلاعات ورودی را بررسی کنید.",
    blogPosts: "خطا در دریافت مطالب وبلاگ. برخی محتوا ممکن است موقتاً در دسترس نباشد.",
    popularPosts: "خطا در دریافت مطالب محبوب. فهرست پیش‌فرض نمایش داده می‌شود.",
    featuredProducts: "خطا در دریافت محصولات ویژه. لطفاً صفحه محصولات را مشاهده کنید.",
    hotTags: "خطا در دریافت برچسب‌های داغ. برچسب‌های پیش‌فرض نمایش داده می‌شود.",
    relatedPosts: "خطا در دریافت مطالب مرتبط.",
    categories: "خطا در دریافت دسته‌بندی‌ها. تمام مطالب نمایش داده می‌شود.",
    search: "خطا در جستجو. لطفاً مجدداً تلاش کنید.",
    navigation: "خطا در دریافت پیمایش مطالب.",
    general: "متأسفانه خطایی رخ داده است. لطفاً صفحه را تازه‌سازی کنید."
  };

  /**
   * Get appropriate error message based on error type
   */
  static getErrorMessage(error: unknown, fallbackType: keyof typeof BlogErrorHandler.errorMessages = 'general'): string {
    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        return this.errorMessages.network;
      }

      // Check for specific error patterns
      if (error.message.includes('timeout')) {
        return this.errorMessages.timeout;
      }

      if (error.message.includes('401')) {
        return this.errorMessages.unauthorized;
      }

      if (error.message.includes('403')) {
        return this.errorMessages.forbidden;
      }

      if (error.message.includes('404')) {
        return this.errorMessages.notFound;
      }

      if (error.message.includes('429')) {
        return this.errorMessages.tooManyRequests;
      }

      if (error.message.includes('500')) {
        return this.errorMessages.server;
      }
    }

    return this.errorMessages[fallbackType];
  }

  /**
   * Log error for debugging with context information
   */
  static logError(error: unknown, context: string, additionalData?: Record<string, any>) {
    const errorInfo = {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      ...additionalData
    };

    console.error(`[BlogError:${context}]`, errorInfo);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.capture(errorInfo);
    }
  }

  /**
   * Sleep function for retry delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context = 'unknown'
  ): Promise<T> {
    const { maxRetries, retryDelay, backoffMultiplier } = {
      ...this.defaultRetryConfig,
      ...config
    };

    let lastError: unknown;
    let delay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        
        // Log successful retry if it wasn't the first attempt
        if (attempt > 0) {
          console.log(`[BlogError:${context}] Retry succeeded on attempt ${attempt + 1}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Log retry attempt
        this.logError(error, `${context}:retry_attempt_${attempt + 1}`, {
          attempt: attempt + 1,
          maxRetries,
          nextRetryIn: attempt < maxRetries ? delay : null
        });

        // Don't retry on the last attempt
        if (attempt < maxRetries) {
          console.warn(`[BlogError:${context}] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await this.sleep(delay);
          delay *= backoffMultiplier;
        }
      }
    }

    // All retries failed
    this.logError(lastError, `${context}:all_retries_failed`, {
      totalAttempts: maxRetries + 1
    });
    
    throw lastError;
  }

  /**
   * Create a toast notification for errors
   */
  static showErrorToast(
    error: unknown, 
    context: string, 
    toast: ReturnType<typeof useToast>['toast'],
    customMessage?: string
  ) {
    const message = customMessage || this.getErrorMessage(error);
    
    toast({
      variant: "destructive",
      title: "خطا",
      description: message,
      duration: 5000,
    });

    this.logError(error, `${context}:toast_shown`, { message });
  }

  /**
   * Determine if an error is retryable
   */
  static isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Don't retry on client errors (4xx) except timeout
      if (message.includes('400') || message.includes('401') || 
          message.includes('403') || message.includes('404')) {
        return false;
      }

      // Retry on network errors, timeouts, and server errors
      return message.includes('fetch') || 
             message.includes('timeout') || 
             message.includes('500') || 
             message.includes('502') || 
             message.includes('503') || 
             message.includes('504');
    }
    
    return true; // Default to retryable for unknown errors
  }

  /**
   * Parse API response and throw appropriate errors
   */
  static async parseApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage: string;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error('Invalid JSON response from server');
    }
  }
}

/**
 * Enhanced fetch function with retry logic and error handling
 */
export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  retryConfig: Partial<RetryConfig> = {}
): Promise<Response> {
  const context = `fetch:${url}`;
  
  return BlogErrorHandler.withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!BlogErrorHandler.isRetryableError(new Error(`HTTP ${response.status}`)) && !response.ok) {
        // Don't retry non-retryable errors
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }, retryConfig, context);
}

/**
 * Default fallback data for different content types
 */
export const fallbackData = {
  popularPosts: [
    { id: 'fallback-1', title: 'راهنمای شروع کار با React', slug: '#' },
    { id: 'fallback-2', title: 'آموزش TypeScript برای مبتدیان', slug: '#' },
    { id: 'fallback-3', title: 'بهترین شیوه‌های CSS Grid', slug: '#' },
    { id: 'fallback-4', title: 'طراحی رابط کاربری مدرن', slug: '#' },
    { id: 'fallback-5', title: 'تکنولوژی‌های وب آینده', slug: '#' },
    { id: 'fallback-6', title: 'نکات بهینه‌سازی عملکرد', slug: '#' }
  ],
  
  hotTags: [
    'بازی', 'تکنولوژی', 'آموزش', 'راهنما', 
    'اخبار', 'بررسی', 'نرم‌افزار', 'وب'
  ],
  
  featuredProducts: [
    { 
      id: 'fallback-prod-1', 
      title: 'راهنمای جامع برنامه‌نویسی', 
      price: 250000, 
      slug: '#' 
    },
    { 
      id: 'fallback-prod-2', 
      title: 'دوره طراحی UI/UX', 
      price: 180000, 
      slug: '#' 
    },
    { 
      id: 'fallback-prod-3', 
      title: 'کتاب الکترونیکی جاوااسکریپت', 
      price: 120000, 
      slug: '#' 
    }
  ]
};