
import { getYear, getMonth, differenceInHours, differenceInDays, differenceInWeeks, getDate, format,  differenceInSeconds, differenceInMinutes } from 'date-fns';

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
export function timeAgoNumber(date: Date) {
  const now = new Date();
  const secondsDiff = differenceInSeconds(now, date);

  if (secondsDiff < 60) {
    return { amount: secondsDiff, type: "s" };
  }

  const minutesDiff = differenceInMinutes(now, date);
  if (minutesDiff < 60) {
    return { amount: minutesDiff, type: "m" };
  }

  const hoursDiff = differenceInHours(now, date);
  if (hoursDiff < 24) {
    return { amount: hoursDiff, type: "h" };
  }

  const daysDiff = differenceInDays(now, date);
  if (daysDiff < 7) {
    return { amount: daysDiff, type: "d" };
  }

  const weeksDiff = differenceInWeeks(now, date);
  return { amount: weeksDiff, type: "w" };
}

  export const dateHandler = (date: Date) => {
    const year = getYear(date);
    const month = getMonth(date);
   const dayOfMonth = getDate(date);
   const dayOfWeek = format(date, 'EEEE');
   const time = format(date, 'h:mm a');
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthText = months[month];

      return {year, month, dayOfMonth, dayOfWeek, monthText, time}
  }
  
  export const getUppercaseFirstLetter = (name: string) => {
    return  name.charAt(0).toUpperCase() + name.slice(1);
  }
  export function formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b';
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    } else {
      return num.toString();
    }
  }
  
  export const threeResponse = (error: string) => {
    return {
error, 
success: false,
data: undefined
    }
  }


  export const calculatePagination = (page?: number , pageSize= 15) => {
    const currentPage = Math.max(1, Number(page) || 1);
            const offset = (currentPage - 1) * pageSize;

            return {currentPage, offset, pageSize}
  }

  export const calculateNextPage = (currentPage: number, total: number, pageSize: number) => {
    const totalPages = Math.ceil(total / pageSize);
            const nextPage = currentPage < totalPages ? currentPage + 1 : null;
            return {totalPages, nextPage}
  }

  export  function removeDuplicates<T extends { id: string }>(arr: T[]): T[] {
    const uniqueMap = new Map<string, T>();
    for (const item of arr) {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }
    return Array.from(uniqueMap.values());
  }