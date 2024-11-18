export const createErrorResponse = (message: string, redirectUrl: undefined | string = undefined) => ({
    error: message,
    success: undefined,
    redirectUrl,
    isTwoFA: undefined
  });
  export const hasAtLeastOneProperty = (obj: object): boolean => {
    return Object.keys(obj).length > 0;
  };
 export const cloudinaryUrl = (publicId: string, transformations = "c_fill") => {
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const baseUrl = `https://res.cloudinary.com/${cloud_name}/image/upload`;
    return `${baseUrl}/${transformations}/${publicId}.jpg`;
  };
  