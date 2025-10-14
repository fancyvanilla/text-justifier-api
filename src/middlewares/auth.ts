import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}
const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(email: string) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }  
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email?: string };
    (req as any).user = payload;
    return next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export type JwtPayload = { email?: string };
