export const createErrorResponse = (message: string) => ({
    error: message,
    success: undefined,
    redirectUrl: undefined,
    isTwoFA: undefined
  });
  export const hasAtLeastOneProperty = (obj: object): boolean => {
    return Object.keys(obj).length > 0;
  };
  