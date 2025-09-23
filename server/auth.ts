import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// Environment configuration
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // Default for development
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-key";
const SESSION_LIFETIME = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// Handle production password security
if (process.env.NODE_ENV === 'production') {
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin123') {
    // Auto-generate secure password for production deployment
    ADMIN_PASSWORD = crypto.randomBytes(16).toString('hex');
    console.warn('⚠️  SECURITY NOTICE: Auto-generated admin password for production deployment.');
    console.warn('⚠️  Admin password:', ADMIN_PASSWORD);
    console.warn('⚠️  Please save this password - it will be needed for admin access.');
    console.warn('⚠️  Set ADMIN_PASSWORD environment variable for custom password.');
  }
}

// In-memory session store
interface Session {
  sessionId: string;
  csrfToken: string;
  createdAt: Date;
  lastActivity: Date;
}

class SessionStore {
  private sessions = new Map<string, Session>();
  private loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

  createSession(): Session {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(32).toString('hex');
    const now = new Date();

    const session: Session = {
      sessionId,
      csrfToken,
      createdAt: now,
      lastActivity: now,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if session has expired
    const now = new Date();
    if (now.getTime() - session.createdAt.getTime() > SESSION_LIFETIME) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = now;
    return session;
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  checkRateLimit(ip: string): boolean {
    const attempt = this.loginAttempts.get(ip);
    const now = new Date();

    if (!attempt) {
      this.loginAttempts.set(ip, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if 10 minutes have passed
    if (now.getTime() - attempt.lastAttempt.getTime() > 10 * 60 * 1000) {
      this.loginAttempts.set(ip, { count: 1, lastAttempt: now });
      return true;
    }

    // Allow if under 5 attempts
    if (attempt.count < 5) {
      attempt.count++;
      attempt.lastAttempt = now;
      return true;
    }

    return false;
  }

  // Cleanup expired sessions and rate limit data
  cleanup(): void {
    const now = new Date();
    
    // Clean expired sessions
    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      if (now.getTime() - session.createdAt.getTime() > SESSION_LIFETIME) {
        this.sessions.delete(sessionId);
      }
    }

    // Clean old rate limit data
    for (const [ip, attempt] of Array.from(this.loginAttempts.entries())) {
      if (now.getTime() - attempt.lastAttempt.getTime() > 10 * 60 * 1000) {
        this.loginAttempts.delete(ip);
      }
    }
  }
}

export const sessionStore = new SessionStore();

// Run cleanup every 30 minutes
setInterval(() => sessionStore.cleanup(), 30 * 60 * 1000);

// Timing-safe password comparison
export function verifyPassword(password: string): boolean {
  const providedBuffer = Buffer.from(password, 'utf8');
  const correctBuffer = Buffer.from(ADMIN_PASSWORD, 'utf8');
  
  if (providedBuffer.length !== correctBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(providedBuffer, correctBuffer);
}

// Middleware to require authentication
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Skip auth check for GET requests (read-only operations remain public)
  if (req.method === 'GET') {
    return next();
  }

  const sessionId = req.cookies.admin_session;
  if (!sessionId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const session = sessionStore.getSession(sessionId);
  if (!session) {
    res.clearCookie('admin_session');
    res.clearCookie('csrf_token');
    return res.status(401).json({ message: "Invalid or expired session" });
  }

  // Verify CSRF token for state-changing operations
  const csrfTokenFromHeader = req.headers['x-csrf-token'] as string;
  const csrfTokenFromCookie = req.cookies.csrf_token;

  if (!csrfTokenFromHeader || !csrfTokenFromCookie || 
      csrfTokenFromHeader !== csrfTokenFromCookie ||
      csrfTokenFromHeader !== session.csrfToken) {
    return res.status(403).json({ message: "CSRF token validation failed" });
  }

  // Add session info to request for use in routes
  (req as any).adminSession = session;
  next();
}

// Cookie configuration
export function getCookieOptions(isSecure = false) {
  return {
    httpOnly: true,
    secure: isSecure, // Use secure cookies in production
    sameSite: 'strict' as const,
    maxAge: SESSION_LIFETIME,
  };
}

export function getCSRFCookieOptions(isSecure = false) {
  return {
    secure: isSecure,
    sameSite: 'strict' as const,
    maxAge: SESSION_LIFETIME,
  };
}