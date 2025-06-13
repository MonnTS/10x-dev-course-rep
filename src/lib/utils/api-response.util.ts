import type { ErrorLogService } from '../services/error/error-log.service';

/**
 * Creates a standardized error response for API endpoints
 *
 * @param error The error that occurred
 * @param errorLogService Optional error logging service
 * @param userId User ID for error logging
 * @returns A Response object with appropriate status and error message
 */
export async function createErrorResponse(
  error: unknown,
  errorLogService?: ErrorLogService,
  userId?: string
): Promise<Response> {
  // Log the error if service is provided
  if (errorLogService && userId) {
    await errorLogService.logError(
      error instanceof Error ? error : new Error(String(error)),
      userId
    );
  }

  // Determine appropriate status code
  let statusCode = 500;

  if (error instanceof Error) {
    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (
      error.message.includes('validation') ||
      error.message.includes('required') ||
      error.message.includes('invalid')
    ) {
      statusCode = 400;
    } else if (
      error.message.includes('unauthorized') ||
      error.message.includes('authentication')
    ) {
      statusCode = 401;
    } else if (
      error.message.includes('permission') ||
      error.message.includes('access')
    ) {
      statusCode = 403;
    }
  }

  // Create the response
  return new Response(
    JSON.stringify({
      error:
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'An unexpected error occurred',
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
