// src/components/features/ui-bits.tsx
//
// Shared building blocks for the Features-owned panels (dining / parking /
// library booking / favorites / legend / boot loader). The Shell agent owns
// its own classroom equivalents — these are deliberately self-contained so
// Stage 2 stays race-free (integration may dedupe later).

import * as React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
  const platform = (navigator as any).userAgentData?.platform || ua;
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

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', STATUS_DOT[status], className)}
    />
  );
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: Status;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_TONE[status],
        className
      )}
    >
      <StatusDot status={status} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Panel chrome
// ---------------------------------------------------------------------------

export function PanelFrame({
  eyebrow,
  title,
  onBack,
  backLabel = 'Back',
  headerActions,
  children,
}: {
  eyebrow: string;
  title: string;
  onBack?: () => void;
  backLabel?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full max-w-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </div>
          <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
        </div>
        {headerActions}
      </div>
      <div className="rooms-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
    </div>
  );
}

export function SectionHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <SectionHeader className="mt-0">{label}</SectionHeader>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback bits
// ---------------------------------------------------------------------------

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin text-muted-foreground', className)} />;
}

export function LoadingNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2.5 text-sm text-muted-foreground">
      <Spinner />
      <span>{children}</span>
    </div>
  );
}

export function ErrorNote({
  message,
  onRetry,
  retryLabel = 'Try again',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-status-unavailable/30 bg-status-unavailable/10 px-3 py-2.5 text-sm text-status-unavailable">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1.5 text-xs font-semibold underline underline-offset-2 hover:opacity-80"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {body ? <p className="max-w-[260px] text-xs leading-relaxed text-muted-foreground">{body}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

export function PrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl bg-umd-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export function GhostButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Day switcher (ported from the legacy libcal-date-browser pattern)
// ---------------------------------------------------------------------------

export function DaySwitcher({
  label,
  dateKey,
  onChange,
  disabled,
}: {
  label: string;
  dateKey: string;
  onChange: (nextKey: string) => void;
  disabled?: boolean;
}) {
  const isToday = dateKey === todayKey();
  const btnClass =
    'rounded-full border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40';

  return (
    <div>
      <SectionHeader className="mt-0">{label}</SectionHeader>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={btnClass}
          aria-label="Previous day"
          disabled={disabled || !dateKey}
          onClick={() => onChange(shiftDateKey(dateKey, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <label className="relative flex-1 cursor-pointer rounded-xl border border-border bg-card px-3 py-1.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary">
          <input
            type="date"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            value={dateKey}
            disabled={disabled}
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
            aria-label={`Choose ${label.toLowerCase()}`}
          />
          <span>{formatDateKeyLabel(dateKey)}</span>
        </label>
        <button
          type="button"
          className={btnClass}
          aria-label="Next day"
          disabled={disabled || !dateKey}
          onClick={() => onChange(shiftDateKey(dateKey, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {!isToday ? (
          <button
            type="button"
            className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-umd-red transition-colors hover:bg-umd-red/10 disabled:pointer-events-none disabled:opacity-40"
            disabled={disabled}
            onClick={() => onChange(todayKey())}
          >
            Today
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Close button (sheet headers)
// ---------------------------------------------------------------------------

export function CloseButton({ onClose, label = 'Close' }: { onClose: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
