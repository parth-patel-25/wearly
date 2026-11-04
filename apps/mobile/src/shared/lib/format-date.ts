/**
 * Format an ISO date string (YYYY-MM-DD or full ISO) as an Indian date
 * in DD/MM/YYYY form.
 */
export function formatDate(iso: string): string {
  if (!iso) {
    return "";
  }
  const date =
    iso.length === 10
      ? new Date(`${iso}T00:00:00`)
      : new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} → ${formatDate(end)}`;
}