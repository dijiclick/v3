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

/**
 * Detects text direction based on character analysis
 * Returns 'rtl' for Persian/Arabic text, 'ltr' for Latin text
 */
export function detectTextDirection(text: string): 'rtl' | 'ltr' {
  if (!text || text.trim().length === 0) {
    return 'rtl'; // Default to RTL for empty text (Persian UI context)
  }

  // Remove whitespace and punctuation for analysis
  const cleanText = text.replace(/[\s\u0020-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]/g, '');
  
  if (cleanText.length === 0) {
    return 'rtl'; // Default to RTL for whitespace-only text
  }

  let rtlCount = 0;
  let ltrCount = 0;

  for (const char of cleanText) {
    const code = char.charCodeAt(0);
    
    // Persian/Arabic character ranges
    if (
      (code >= 0x0600 && code <= 0x06FF) || // Arabic
      (code >= 0x0750 && code <= 0x077F) || // Arabic Supplement
      (code >= 0x08A0 && code <= 0x08FF) || // Arabic Extended-A
      (code >= 0xFB50 && code <= 0xFDFF) || // Arabic Presentation Forms-A
      (code >= 0xFE70 && code <= 0xFEFF) || // Arabic Presentation Forms-B
      (code >= 0x06F0 && code <= 0x06F9)    // Persian digits
    ) {
      rtlCount++;
    }
    // Latin character ranges
    else if (
      (code >= 0x0041 && code <= 0x005A) || // Uppercase A-Z
      (code >= 0x0061 && code <= 0x007A) || // Lowercase a-z
      (code >= 0x0030 && code <= 0x0039) || // Digits 0-9
      (code >= 0x00C0 && code <= 0x024F)    // Latin Extended
    ) {
      ltrCount++;
    }
  }

  // Determine direction based on character count
  // If more than 50% of characters are RTL, use RTL direction
  const totalDirectionalChars = rtlCount + ltrCount;
  
  if (totalDirectionalChars === 0) {
    return 'rtl'; // Default to RTL for non-directional characters
  }
  
  const rtlPercentage = rtlCount / totalDirectionalChars;
  return rtlPercentage > 0.5 ? 'rtl' : 'ltr';
}
