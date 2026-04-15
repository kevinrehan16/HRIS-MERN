/**
 * Kunin ang initials ng employee (e.g., Kevin Macandog -> KM)
 */
export const formatID = (id: number | string, prefix: string = "ID", padLength: number = 6): string => {
  const numericId = id.toString();
  return `${prefix}-${numericId.padStart(padLength, '0')}`;
};

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

/**
 * Ino-convert ang "HH:mm" o "HH:mm - HH:mm" into "hh:mm AM/PM"
 * Example: "06:00 - 15:00" -> "06:00 AM - 03:00 PM"
 */
export const formatShiftSchedule = (shiftString: string | undefined | null): string => {
  if (!shiftString) return 'No Schedule';

  // Function para i-convert ang individual time string
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.trim().split(':');
    let h = parseInt(hours, 10);
    const m = minutes || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    
    h = h % 12;
    h = h ? h : 12; // Ang 0 ay dapat maging 12
    
    // Nilalagyan natin ng padStart(2, '0') para laging may leading zero (e.g., 06:00 AM)
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  // Kung ang input ay may dash (e.g., "06:00 - 15:00")
  if (shiftString.includes('-')) {
    const [start, end] = shiftString.split('-');
    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  // Kung single time lang ang pinasa
  return formatTime(shiftString);
};