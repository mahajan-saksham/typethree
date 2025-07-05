/**
 * Formats a number as Indian Rupee currency
 * @param amount The amount to format
 * @returns Formatted currency string (e.g., ₹25,00,000)
 */
export const formatCurrency = (amount: number): string => {
  // Format as Indian currency (lakhs and crores)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formats a percentage value
 * @param value The percentage value
 * @returns Formatted percentage string (e.g., 14.5%)
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Formats a date string to a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date (e.g., 15 Mar 2025)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
