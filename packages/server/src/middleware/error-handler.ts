/**
 * Global error handler
 */

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);
  
  // Validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  
  // Prisma errors - check by error code
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002') {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'A record with this value already exists',
        field: (prismaError.meta?.target as string[])?.join('.'),
      });
    }
    if (prismaError.code === 'P2025') {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Record not found',
      });
    }
  }
  
  // Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Invalid request',
      details: error.validation,
    });
  }
  
  // Rate limit errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
  
  // Default error
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;
  
  return reply.status(statusCode).send({
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message,
  });
}