import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * Multer File type definition
 */
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

/**
 * Shape of data we store inside JWT
 */
export interface AuthPayload extends JwtPayload {
  userId: string;
  id?: string;  // Added for controller compatibility
  role: string;
}

/**
 * Extend Express Request to include user and file uploads
 */
export interface AuthRequest extends Request {
  user?: AuthPayload;
  files?: any;
  file?: any;
}

/**
 * JWT Authentication Middleware
 */
export const authenticate: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authRequest = req as AuthRequest;
    const authHeader = authRequest.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    // Map userId to id for controller compatibility
    authRequest.user = {
      ...decoded,
      id: decoded.userId
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * Optional JWT Authentication Middleware
 * Attaches user to req if token is valid, otherwise continues
 */
export const optionalAuthenticate: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authRequest = req as AuthRequest;
    const authHeader = authRequest.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    authRequest.user = {
      ...decoded,
      id: decoded.userId
    };
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};
