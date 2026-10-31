// Utility functions for dates and string sanitization

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
const getTodayFormatted = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Escapes special regex characters in user-provided search strings to prevent ReDoS
 */
const escapeRegex = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validates whether a string matches YYYY-MM format
 */
const isValidMonth = (monthStr) => {
  return /^\d{4}-\d{2}$/.test(monthStr);
};

/**
 * Validates whether a string matches YYYY-MM-DD format
 */
const isValidDate = (dateStr) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

module.exports = {
  getTodayFormatted,
  escapeRegex,
  isValidMonth,
  isValidDate,
};

