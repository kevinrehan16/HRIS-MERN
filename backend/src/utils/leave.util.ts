type LeaveCalendar = {
  startDate: Date;
  endDate: Date;
  isHalfDay: boolean;
  restDays: string;
  holidayDates: Date[];
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const parseDateOnly = (value: string, fieldName: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${fieldName} must be a valid date.`);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const toDateKey = (value: Date) => value.toISOString().slice(0, 10);

/** Calculates paid leave days using the employee's work calendar and company holidays. */
export const calculateLeaveDays = ({ startDate, endDate, isHalfDay, restDays, holidayDates }: LeaveCalendar): number => {
  if (endDate < startDate) throw new Error('End date cannot be earlier than start date.');
  if (isHalfDay && toDateKey(startDate) !== toDateKey(endDate)) {
    throw new Error('A half-day request must begin and end on the same date.');
  }

  const restDaySet = new Set(restDays.split(',').map((day) => day.trim().toLowerCase()).filter(Boolean));
  const holidaySet = new Set(holidayDates.map(toDateKey));
  let days = 0;
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const isRestDay = restDaySet.has(DAY_NAMES[cursor.getUTCDay()].toLowerCase());
    if (!isRestDay && !holidaySet.has(toDateKey(cursor))) days += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (days === 0) throw new Error('The selected dates do not include a scheduled workday.');
  return isHalfDay ? 0.5 : days;
};