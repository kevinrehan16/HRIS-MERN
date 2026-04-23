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

export const formatDisplayTime = (dateString: string | null) => {
  if (!dateString) return "---";
  
  const date = new Date(dateString);
  
  // Imbes na toLocaleTimeString, gamitin natin ang Manual Getters 
  // para makuha ang "Raw" value na sinave natin sa DB
  let hours = date.getUTCHours(); // Gamitin ang UTC para hindi mag-offset
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // conversion ng 0 to 12
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Kalkulahin ang bilang ng araw sa pagitan ng dalawang dates (Inclusive)
 * Example: "2026-04-15" to "2026-04-17" -> 3 Days
 */
/**
 * Kalkulahin ang bilang ng araw (Business Days lang - No Sat/Sun)
 * Example: Friday to Monday -> 2 Days (Fri, Mon)
 */
export const calculateLeaveDays = (startDate: string | Date, endDate: string | Date): number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Siguraduhin na midnight ang start para walang butal sa oras
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  let count = 0;
  const current = new Date(start);

  // I-loop ang bawat araw mula start hanggang end
  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Isama lang sa count kung hindi 0 (Linggo) at hindi 6 (Sabado)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }

    // Move to the next day
    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Kunin ang Month Short name (e.g., "Apr")
 */
export const getMonthShort = (dateString: string | Date): string => {
  if (!dateString) return '---';
  // Gumamit ng 'UTC' timeZone option para hindi mag-shift ang date
  return new Date(dateString).toLocaleString('en-US', { 
    month: 'short', 
    timeZone: 'UTC' 
  });
};

/**
 * Kunin ang Day Number gamit ang UTC
 */
export const getDayNumber = (dateString: string | Date): number => {
  if (!dateString) return 0;
  // getUTCDate() ang kukuha ng eksaktong date sa database (e.g., 15)
  return new Date(dateString).getUTCDate(); 
};