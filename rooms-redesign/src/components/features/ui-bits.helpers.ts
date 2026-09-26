// Non-React utilities shared by feature panels. Keeping them outside the component
// module lets Fast Refresh update the panel components independently.
import { format } from 'date-fns';
import { getDateKey } from '@/lib/availabilityData.js';
import type { Status } from '@/types/campus';

// ---------------------------------------------------------------------------
// Date helpers (ported from legacy Sidebar.js)
// ---------------------------------------------------------------------------

export function todayKey(): string {
  return getDateKey(new Date());
}

export function parseDateKey(dateKey: string): Date {
  const parsed = new Date(`${dateKey}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function shiftDateKey(dateKey: string, offsetDays: number): string {
  const next = parseDateKey(dateKey);
  next.setDate(next.getDate() + offsetDays);
  return getDateKey(next);
}

export function formatDateKeyLabel(dateKey: string): string {
  if (!dateKey) return '';
  return format(parseDateKey(dateKey), 'EEE, MMM d');
}

/** LibCal datetimes arrive as "YYYY-MM-DD HH:mm:ss"; display them warmly. */
export function formatLibCalDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '';
  const parsed = new Date(String(dateTimeString).replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return String(dateTimeString);
  return format(parsed, 'EEE, MMM d h:mm a');
}

/** availability blocks use decimal hours (9.5 => 9:30 AM). */
export function decimalToTimeString(dec: unknown): string {
  const d = parseFloat(String(dec));
  if (!Number.isFinite(d)) return '';
  const h = Math.floor(d) % 24;
  const m = Math.round((d - Math.floor(d)) * 60);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return format(date, 'h:mm a');
}

// ---------------------------------------------------------------------------
// External links (ported behavior)
// ---------------------------------------------------------------------------

/** Opens walking directions in Apple Maps on iOS, Google Maps otherwise. */
export function openWalkingDirections(lat: number, lng: number): void {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  const ua = navigator.userAgent || '';
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || ua;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    ((/Mac/.test(platform) || /Macintosh/.test(ua)) && navigator.maxTouchPoints > 1);

  const url = isIOS
    ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;

  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Minimal HTML sanitizer for LibCal terms / success markup (the legacy app
 * used DOMPurify, which is not in the new dependency set). Strips active
 * content and event handlers; forces links to open externally.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  doc
    .querySelectorAll('script,style,iframe,object,embed,form,link,meta,noscript')
    .forEach((el) => el.remove());
  doc.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = String(attr.value || '').replace(/\s+/g, '').toLowerCase();
      if (
        name.startsWith('on') ||
        ((name === 'href' || name === 'src') && value.startsWith('javascript:'))
      ) {
        el.removeAttribute(attr.name);
      }
    }
    if (el.tagName === 'A') {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  });
  return doc.body.innerHTML;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

export const STATUS_TONE: Record<Status, string> = {
  available: 'bg-status-available/10 text-status-available',
  'opening-soon': 'bg-status-opening-soon/10 text-status-opening-soon',
  unavailable: 'bg-status-unavailable/10 text-status-unavailable',
  unknown: 'bg-status-unknown/10 text-status-unknown',
};

export const STATUS_DOT: Record<Status, string> = {
  available: 'bg-status-available',
  'opening-soon': 'bg-status-opening-soon',
  unavailable: 'bg-status-unavailable',
  unknown: 'bg-status-unknown',
};
