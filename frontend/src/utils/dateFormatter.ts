/**
 * Formats a date string from 'YYYY-MM-DD' to a more readable format
 */
export function formatDateString(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

/**
 * Formats a time string from ISO format to a readable time format
 */
export function formatTimeString(timeString: string): string {
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
}
