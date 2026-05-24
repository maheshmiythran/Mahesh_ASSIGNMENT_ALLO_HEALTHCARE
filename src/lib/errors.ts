import { NextResponse } from 'next/server';
import { ErrorResponse } from './types';
import { logger } from './logger';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createErrorResponse(statusCode: number, message: string, context?: Record<string, unknown>): NextResponse<ErrorResponse> {
  logger.error(message, context);
  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}

export function createSuccessResponse<T>(data: T, statusCode: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status: statusCode });
}

// Common error responses
export const errorResponses = {
  badRequest: (message: string = 'Bad request', context?: Record<string, unknown>) =>
    createErrorResponse(400, message, context),

  notFound: (message: string = 'Not found', context?: Record<string, unknown>) =>
    createErrorResponse(404, message, context),

  conflict: (message: string = 'Conflict', context?: Record<string, unknown>) =>
    createErrorResponse(409, message, context),

  unprocessable: (message: string = 'Unprocessable entity', context?: Record<string, unknown>) =>
    createErrorResponse(422, message, context),

  internalError: (message: string = 'Internal server error', context?: Record<string, unknown>) =>
    createErrorResponse(500, message, context),
};
