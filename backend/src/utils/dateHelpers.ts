/**
 * Utility para makuha ang kasalukuyang oras sa Philippine Time (UTC+8)
 */
export const getPHTTime = (): Date => {
  const now = new Date();
  // Dagdagan ng 8 oras ang UTC time
  return new Date(now.getTime() + (8 * 60 * 60 * 1000));
};

/**
 * Utility para makuha ang Start of Day (00:00:00) sa Philippine Time
 * Ginagamit ito para sa 'date' field sa database para unique per day.
 */
export const getPHStartOfDay = (): Date => {
  const phTime = getPHTTime();
  phTime.setUTCHours(0, 0, 0, 0);
  return phTime;
};