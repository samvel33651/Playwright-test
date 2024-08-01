import { subHours, format, addDays } from "date-fns";

export const getDateHoursBeforeNow = (
  hours: number,
  dateFormat: string = "yyyy-MM-dd--HH-mm-ss"
): string => {
  const currentDate = new Date();
  const hoursAgo = subHours(currentDate, hours);
  return format(hoursAgo, dateFormat);
};

export const getDateDaysInFuture = (
  days: number,
  dateFormat: string = "yyyy-MM-dd--HH-mm-ss"
): string => {
  const currentDate = new Date();
  const daysLater = addDays(currentDate, days);
  return format(daysLater, dateFormat);
};
