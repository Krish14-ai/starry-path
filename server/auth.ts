import { Request, Response, NextFunction } from "express";

// Extend express-session to include our userId
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

/**
 * Middleware that protects API routes.
 * Returns 401 if the request has no active session with a userId.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  next();
}
