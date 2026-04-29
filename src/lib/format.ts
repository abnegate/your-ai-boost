const monthLabel = new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' });
const dayLabel = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });
const numberCompact = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const numberStandard = new Intl.NumberFormat('en');

export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number) as [number, number];
  return monthLabel.format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatDate(iso: string): string {
  return dayLabel.format(new Date(iso));
}

export function formatNumber(value: number): string {
  return numberStandard.format(value);
}

export function formatCompact(value: number): string {
  return numberCompact.format(value);
}

export function formatMultiplier(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return value.toFixed(1);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function clampMultiplier(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 10) / 10;
}
