export function DateTimeFormat(timestamp: string | null | undefined): string {
  if (timestamp) {
    const date = new Date(timestamp);

    // Convert to Cambodia time (UTC +7)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Phnom_Penh",
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // To display AM/PM
    };

    // Format the date and time in Cambodia time
    const formattedDateTime = date.toLocaleString("en-US", options);

    return formattedDateTime;
  }
  return "";
}
