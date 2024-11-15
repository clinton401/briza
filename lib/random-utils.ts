export const createErrorResponse = (message: string) => ({
    error: message,
    success: undefined,
    redirectUrl: undefined,
  });