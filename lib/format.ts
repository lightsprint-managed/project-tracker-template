const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});

export function formatCurrency(value: number | string | null | undefined) {
  return currency.format(Number(value ?? 0));
}

export function formatCompact(value: number | string | null | undefined) {
  return compact.format(Number(value ?? 0));
}

/** `2026-10-09` or a Date → `Oct 9, 2026` (dates are calendar days, not instants). */
export function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—';
  const date =
    typeof value === 'string' ? new Date(`${value.slice(0, 10)}T00:00:00Z`) : value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/** Whole days from today to `value` (negative when it is in the past). */
export function daysFromToday(value: string | Date) {
  const date =
    typeof value === 'string' ? new Date(`${value.slice(0, 10)}T00:00:00Z`) : value;
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((date.getTime() - todayUtc) / 86_400_000);
}

/** A calendar date `days` from today as `YYYY-MM-DD` (used by seed data). */
export function isoDateFromToday(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
