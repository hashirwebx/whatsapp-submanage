/**
 * Date Utilities for Subscription Management
 * Supports multiple date formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
 */

/**
 * Parse date from various formats to ISO date string (YYYY-MM-DD)
 * Supports: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
 */
export function parseDate(dateStr: string): string | null {
  if (!dateStr || !dateStr.trim()) return null;

  const trimmed = dateStr.trim();

  // Try DD/MM/YYYY format (European/Pakistani format)
  const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Validate the date is actually valid
    if (isValidDate(parsedDate)) {
      return parsedDate;
    }
  }

  // Try YYYY-MM-DD format (ISO format)
  const yyyymmdd = trimmed.match(/^\d{4}-\d{2}-\d{2}$/);
  if (yyyymmdd && isValidDate(trimmed)) {
    return trimmed;
  }

  // Try MM/DD/YYYY format (American format)
  const mmddyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    const parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    if (isValidDate(parsedDate)) {
      return parsedDate;
    }
  }

  return null;
}

/**
 * Check if a date string in YYYY-MM-DD format is valid
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format ISO date (YYYY-MM-DD) to display format (DD/MM/YYYY)
 */
export function formatDateForDisplay(dateStr: string, format: 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'DD/MM/YYYY'): string {
  if (!dateStr) return '';
  
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    
    if (format === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    } else {
      return `${month}/${day}/${year}`;
    }
  }
  
  return dateStr;
}

/**
 * Get date object from ISO date string
 */
export function getDateFromISO(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isValidDate(dateStr) ? date : null;
}

/**
 * Calculate days until a specific date
 */
export function getDaysUntil(dateStr: string): number {
  const date = getDateFromISO(dateStr);
  if (!date) return 0;
  
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateStr: string): boolean {
  return getDaysUntil(dateStr) < 0;
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string): boolean {
  const date = getDateFromISO(dateStr);
  if (!date) return false;
  
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date
 */
export function addDays(dateStr: string, days: number): string {
  const date = getDateFromISO(dateStr);
  if (!date) return dateStr;
  
  date.setDate(date.getDate() + days);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get the next billing date based on current date and billing cycle
 */
export function getNextBillingDate(
  currentDate: string, 
  billingCycle: 'weekly' | 'monthly' | 'yearly'
): string {
  const date = getDateFromISO(currentDate);
  if (!date) return currentDate;
  
  switch (billingCycle) {
    case 'weekly':
      return addDays(currentDate, 7);
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format date for Pakistan timezone display
 */
export function formatPakistanDate(dateStr: string): string {
  const date = getDateFromISO(dateStr);
  if (!date) return '';
  
  return new Intl.DateTimeFormat('en-PK', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get relative date string (e.g., "Tomorrow", "In 3 days", "Today")
 */
export function getRelativeDateString(dateStr: string): string {
  const daysUntil = getDaysUntil(dateStr);
  
  if (daysUntil < 0) {
    return `${Math.abs(daysUntil)} days ago`;
  } else if (daysUntil === 0) {
    return 'Today';
  } else if (daysUntil === 1) {
    return 'Tomorrow';
  } else if (daysUntil <= 7) {
    return `In ${daysUntil} days`;
  } else if (daysUntil <= 30) {
    const weeks = Math.floor(daysUntil / 7);
    return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
  } else if (daysUntil <= 365) {
    const months = Math.floor(daysUntil / 30);
    return `In ${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(daysUntil / 365);
    return `In ${years} year${years > 1 ? 's' : ''}`;
  }
}
