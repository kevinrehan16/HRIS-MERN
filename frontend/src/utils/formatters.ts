/**
 * Kunin ang initials ng employee (e.g., Kevin Macandog -> KM)
 */
export const getInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return '??';
  const f = firstName?.charAt(0) || '';
  const l = lastName?.charAt(0) || '';
  return (f + l).toUpperCase();
};

/**
 * I-format ang number sa Philippine Peso (e.g., 150000 -> ₱150,000.00)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

/**
 * I-format ang ISO date sa readable format (e.g., 2026-03-29 -> Mar 29, 2026)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '---';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};