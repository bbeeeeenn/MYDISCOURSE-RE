export const philippineTimeZone = "Asia/Manila";
const philippineOffset = "+08:00";

export function getPhilippineToday() {
   const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: philippineTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
   }).formatToParts(new Date());
   const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, value]),
   );
   return `${values.year}-${values.month}-${values.day}`;
}

export function formatPhilippineTime(value: Date) {
   return new Intl.DateTimeFormat("en-PH", {
      timeZone: philippineTimeZone,
      hour: "numeric",
      minute: "2-digit",
   }).format(value);
}

export function parsePhilippineDate(date: string) {
   return new Date(`${date}T00:00:00${philippineOffset}`);
}

export function parsePhilippineDateTime(date: string, time: string) {
   return new Date(`${date}T${time}:00${philippineOffset}`);
}
