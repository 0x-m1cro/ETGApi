export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatGuestString = (adults: number, children: number[]): string => {
  const adultStr = `${adults} Adult${adults > 1 ? 's' : ''}`;
  const childStr = children.length > 0 ? `, ${children.length} Child${children.length > 1 ? 'ren' : ''}` : '';
  return adultStr + childStr;
};

export const formatRoomString = (roomCount: number): string => {
  return `${roomCount} Room${roomCount > 1 ? 's' : ''}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStarRating = (rating: number | undefined): string => {
  if (!rating) return 'Unrated';
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};
