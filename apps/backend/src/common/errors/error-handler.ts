import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de manejo de errores global
 * Adaptado del backend-plan: reemplaza exception filters de NestJS
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
