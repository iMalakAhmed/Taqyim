export function formatTimestamp(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // For recent posts (less than 24 hours)
  if (diffInSeconds < 86400) {
    return date
      .toLocaleTimeString("en-UK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .toUpperCase();
  }

  // For posts up to 7 days old
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "DAY" : "DAYS"} AGO`;
  }

  // For older posts
  return date
    .toLocaleDateString("en-UK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}
