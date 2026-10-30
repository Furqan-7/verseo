// Dates in the API are ISO strings: "2026-10-28" for calendar days (stored
// as Postgres DATE) and full ISO timestamps for moments.

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function addDays(iso: string, days: number): string {
  const d = fromIsoDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIsoDate(d);
}

// Monday of the week that contains `date`, at 00:00 UTC.
export function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((fromIsoDate(toIso).getTime() - fromIsoDate(fromIso).getTime()) / 86_400_000);
}
