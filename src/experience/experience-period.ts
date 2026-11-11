const ONGOING_PERIOD_END = 'настоящее время';

function formatMonth(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  return `${month}.${String(date.getUTCFullYear())}`;
}

export function formatExperiencePeriod(startDate: Date, endDate: Date | null): string {
  const end = endDate ? formatMonth(endDate) : ONGOING_PERIOD_END;

  return `${formatMonth(startDate)} — ${end}`;
}
