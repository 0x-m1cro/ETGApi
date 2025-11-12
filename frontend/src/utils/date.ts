import { format, addDays, differenceInDays, parseISO } from 'date-fns';

export const formatDate = (date: Date, formatStr: string = 'yyyy-MM-dd'): string => {
  return format(date, formatStr);
};

export const formatDisplayDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const addDaysToDate = (date: Date, days: number): Date => {
  return addDays(date, days);
};

export const calculateNights = (checkin: Date | string, checkout: Date | string): number => {
  const checkinDate = typeof checkin === 'string' ? parseISO(checkin) : checkin;
  const checkoutDate = typeof checkout === 'string' ? parseISO(checkout) : checkout;
  return differenceInDays(checkoutDate, checkinDate);
};

export const getMinCheckInDate = (): Date => {
  return addDays(new Date(), 1); // Tomorrow
};

export const getMaxCheckInDate = (): Date => {
  return addDays(new Date(), 730); // Max 730 days ahead
};

export const isValidDateRange = (checkin: Date, checkout: Date): boolean => {
  const nights = calculateNights(checkin, checkout);
  return nights > 0 && nights <= 30; // Max 30 nights
};
