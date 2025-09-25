import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes image URLs by converting /src/assets/stock_images/ paths to /images/ paths
 * This fixes the featured image display for ALL blog posts, not just hardcoded ones
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Convert /src/assets/stock_images/ URLs to /images/ URLs
  if (url.startsWith('/src/assets/stock_images/')) {
    return url.replace('/src/assets/stock_images/', '/images/');
  }
  
  // Return URL as is if it doesn't need sanitization
  return url;
}

/**
 * Robust clipboard copy with fallback for older browsers and proper error handling
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    console.warn('Modern clipboard API failed, trying fallback method:', error);
  }
  
  // Fallback to legacy method
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', 'readonly');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('All clipboard methods failed:', error);
    return false;
  }
}

/**
 * Robust native share with proper error handling
 */
export async function nativeShare(data: ShareData): Promise<boolean> {
  try {
    if (!navigator.share) {
      return false; // Native share not supported
    }
    
    await navigator.share(data);
    return true;
  } catch (error) {
    // User cancelled sharing or other error occurred
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled, this is expected behavior
      return false;
    }
    
    console.warn('Native share failed:', error);
    return false;
  }
}
