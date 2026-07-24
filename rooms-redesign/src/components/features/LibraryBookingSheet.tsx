// src/components/features/LibraryBookingSheet.tsx
//
// LibCal study-room booking sheet, shown when the store selection is
// { kind: 'room' } and the resolved room's raw record has source === 'libcal'.
// Ports the legacy Sidebar.js booking flow end to end:
//
//   1. Browse availability by date — prev/next/today + date input. The store's
//      own data covers the active day; other days are fetched through
//      /.netlify/functions/libcal-availability and cached locally (the legacy
//      app used a dedicated per-room browser the same way).
//   2. Bookable blocks (raw.libcal.available_blocks) expose a "Book" action.
//      Starting a booking POSTs the room payload + chosen start to
//      /.netlify/functions/libcal-booking-options, which returns the default
//      end time and the list of valid "reserve until" options — including
//      partial bookings inside a larger block (the user picks start + end).
//   3. Continue -> /.netlify/functions/libcal-booking-form returns hold
//      message, summary rows, optional terms HTML, dynamic form fields, and
//      the bookingContext required for submission.
//   4. Submit -> /.netlify/functions/libcal-booking-submit with
//      { bookingContext, fieldValues }; success renders LibCal's returned
//      confirmation HTML (sanitized).

import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useCampusStore } from '@/lib/store';
import {
  fetchLibCalAvailabilityForDate,
  fetchLibCalBookingForm,
  fetchLibCalBookingOptions,
  submitLibCalBooking,
} from '@/lib/libcalData.js';
import {
  playErrorHaptic,
  playSelectionHaptic,
  playSuccessHaptic,
} from '@/lib/haptics.js';
import { cn } from '@/lib/utils';
import type { BuildingEntry, RoomEntry } from '@/types/campus';
import {
  DaySwitcher,
  EmptyState,
  ErrorNote,
  GhostButton,
  LoadingNote,
  PanelFrame,
  PrimaryButton,
  SectionHeader,
  decimalToTimeString,
  formatLibCalDateTime,
  openWalkingDirections,
  sanitizeHtml,
  todayKey,
} from './ui-bits';

// ---------------------------------------------------------------------------
// Types for the booking state machine (ported from legacy Sidebar.js)
// ---------------------------------------------------------------------------

interface StartOption {
  start: string;
  end: string;
  label: string;
}

interface DurationOption {
  end: string;
  label: string;
  selected?: boolean;
}

interface BookingFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface BookingField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: BookingFieldOption[];
}

interface SummaryRow {
  item: string;
  category: string;
  from: string;
  to: string;
}

interface BookingContext {
  session: string;
  booking: Record<string, unknown>;
}

type BookingStatus =
  | 'idle'
  | 'loading-options'
  | 'options-ready'
  | 'loading-form'
  | 'form-ready'
  | 'submitting'
  | 'success'
  | 'auth-required'
  | 'error';

interface BookingState {
  roomId: string | null;
  status: BookingStatus;
  startDateTime: string;
  endDateTime: string;
  startOptions: StartOption[];
  durationOptions: DurationOption[];
  fields: BookingField[];
  fieldValues: Record<string, string>;
  holdMessage: string;
  summaryRows: SummaryRow[];
  termsHtml: string;
  bookingContext: BookingContext | null;
  submitLabel: string;
  showForm: boolean;
  successHtml: string;
  authMessage: string;
  error: string | null;
}

const EMPTY_BOOKING: BookingState = {
  roomId: null,
  status: 'idle',
  startDateTime: '',
  endDateTime: '',
  startOptions: [],
  durationOptions: [],
  fields: [],
  fieldValues: {},
  holdMessage: '',
  summaryRows: [],
  termsHtml: '',
  bookingContext: null,
  submitLabel: 'Submit Booking',
  showForm: false,
  successHtml: '',
  authMessage: '',
  error: null,
};

interface BrowseState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  room: any | null;
  error: string | null;
}

const EMPTY_BROWSE: BrowseState = { status: 'idle', room: null, error: null };

// ---------------------------------------------------------------------------
// In-app booking is DISABLED (2026). UMD LibCal now requires SSO login to
// reserve — its booking-form / submit endpoints redirect anonymous sessions
// to /spaces/auth (verified live). Worse, the flow placed a transient LibCal
// hold via booking/add just to read duration options, which the patron then
// tripped over when finishing on LibCal. So we keep the availability browser
// (read-only, no hold) and hand off to the room's LibCal page to reserve.
//
// The entire legacy in-app booking flow below is preserved but gated behind
// this flag — flip it back to true to re-enable if LibCal ever reopens
// anonymous booking. (Everything referenced by that flow stays imported so
// the code keeps compiling.)
const IN_APP_BOOKING_ENABLED = false;

/** Deep link to the room's LibCal page for the browsed date (where the patron
 * signs in and reserves). Falls back to the plain space page. */
function libcalBookingUrl(rawRoom: any, dateKey: string): string | null {
  const base = rawRoom?.libcal?.booking_url;
  if (!base) return null;
  if (!dateKey) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}date=${dateKey}`;
}

// ---------------------------------------------------------------------------
// Helpers (ported)
// ---------------------------------------------------------------------------

function getRoomPayload(rawRoom: any) {
  return {
    eid: rawRoom?.libcal?.eid,
    gid: rawRoom?.libcal?.gid,
    lid: rawRoom?.libcal?.lid,
    name: rawRoom?.name,
    title: rawRoom?.libcal?.title || rawRoom?.name,
  };
}

function buildStartOptions(block: any): StartOption[] {
  const rawSlots =
    Array.isArray(block?.slots) && block.slots.length > 0
      ? block.slots
      : block?.start
        ? [{ start: block.start, end: block.end }]
        : [];

  const unique = new Map<string, { start: string; end: string }>();
  rawSlots.forEach((slot: any) => {
    if (!slot?.start) return;
    if (!unique.has(slot.start)) unique.set(slot.start, { start: slot.start, end: slot.end || '' });
  });

  return Array.from(unique.values()).map((slot) => ({
    ...slot,
    label: formatLibCalDateTime(slot.start),
  }));
}

function buildInitialFieldValues(fields: BookingField[]): Record<string, string> {
  const values: Record<string, string> = {};
  (fields || []).forEach((field) => {
    values[field.name] = '';
  });
  return values;
}

function compactHoldMessage(message: string): string {
  const raw = String(message || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const match = raw.match(/held for you until\s+(.+?)\.\s/i);
  if (match?.[1]) return `Held until ${match[1]}`;
  return raw;
}

/** Locate a selected room (+ its building) in the store's building list. */
function findSelectedRoom(
  buildings: BuildingEntry[],
  id: string
): { building: BuildingEntry; room: RoomEntry } | null {
  let buildingCode: string | null = null;
  let roomId = id;
  const slash = id.indexOf('/');
  if (slash > 0) {
    buildingCode = id.slice(0, slash);
    roomId = id.slice(slash + 1);
  }
  for (const building of buildings) {
    if (buildingCode && building.code !== buildingCode) continue;
    const room = (building.rooms || []).find((r) => String(r.id) === roomId);
    if (room) return { building, room };
  }
  return null;
}

/** Find this room inside a libcal-availability response for another date. */
function findRoomInLibCalResponse(buildings: any[], eid: unknown, roomId: string): any | null {
  for (const building of Array.isArray(buildings) ? buildings : []) {
    for (const room of building?.classrooms || []) {
      if (eid != null && Number(room?.libcal?.eid) === Number(eid)) return room;
      if (String(room?.id) === roomId) return room;
    }
  }
  return null;
}

const inputClass =
  'w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LibraryBookingSheet() {
  const selected = useCampusStore((s) => s.selected);
  const buildings = useCampusStore((s) => s.buildings);
  const activeDateKey = useCampusStore((s) => s.activeDateKey);
  const clearSelection = useCampusStore((s) => s.clearSelection);

  const isRoom = selected?.kind === 'room';
  const resolved = isRoom ? findSelectedRoom(buildings, String(selected!.id)) : null;
  const storeRoomRaw: any | null = resolved?.room?.raw ?? null;
  const isLibCal = storeRoomRaw?.source === 'libcal' && Boolean(storeRoomRaw?.libcal);

  // Back returns to the parent building's detail view (falls back to the
  // browse list when the building can't be resolved).
  const selectBuilding = useCampusStore((s) => s.select);
  const handleBack = () => {
    if (resolved?.building) {
      selectBuilding({ kind: 'building', id: resolved.building.code });
    } else {
      clearSelection();
    }
  };

  const [browseKey, setBrowseKey] = useState<string>('');
  const [browse, setBrowse] = useState<BrowseState>(EMPTY_BROWSE);
  const [booking, setBooking] = useState<BookingState>(EMPTY_BOOKING);
  const cacheRef = useRef(new Map<string, any[]>());
  const requestRef = useRef(0);

  const selectedRoomId = isRoom ? String(selected!.id) : null;
  const roomEid = storeRoomRaw?.libcal?.eid ?? null;

  // Reset everything when the selected room changes.
  useEffect(() => {
    setBrowseKey(activeDateKey);
    setBrowse(EMPTY_BROWSE);
    setBooking(EMPTY_BOOKING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId]);

  // Browsing a different date cancels any in-progress booking (ported).
  useEffect(() => {
    setBooking(EMPTY_BOOKING);
  }, [browseKey]);

  // Fetch availability for non-active browse dates. `reload` drops the cache
  // entry first so the retry button can force a refetch of the same date.
  const loadBrowseDate = (dateKey: string, reload = false) => {
    if (!isLibCal || !dateKey || dateKey === activeDateKey) {
      setBrowse(EMPTY_BROWSE);
      return;
    }
    if (reload) cacheRef.current.delete(dateKey);
    const cached = cacheRef.current.get(dateKey);
    if (cached) {
      const room = findRoomInLibCalResponse(cached, roomEid, selectedRoomId || '');
      setBrowse({
        status: 'ready',
        room,
        error: room ? null : 'This room has no LibCal data for that date.',
      });
      return;
    }
    const requestId = ++requestRef.current;
    setBrowse({ status: 'loading', room: null, error: null });
    fetchLibCalAvailabilityForDate(dateKey)
      .then((list: any[]) => {
        if (requestRef.current !== requestId) return;
        const buildingsForDate = Array.isArray(list) ? list : [];
        cacheRef.current.set(dateKey, buildingsForDate);
        const room = findRoomInLibCalResponse(buildingsForDate, roomEid, selectedRoomId || '');
        setBrowse({
          status: 'ready',
          room,
          error: room ? null : 'This room has no LibCal data for that date.',
        });
      })
      .catch((err: any) => {
        if (requestRef.current !== requestId) return;
        setBrowse({
          status: 'error',
          room: null,
          error: err?.message || 'Could not load study-room times for that day.',
        });
      });
  };

  useEffect(() => {
    loadBrowseDate(browseKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browseKey, isLibCal, activeDateKey, roomEid, selectedRoomId]);

  const browsingActiveDay = !browseKey || browseKey === activeDateKey;
  const rawRoom: any | null = browsingActiveDay ? storeRoomRaw : browse.room;

  const blocks: any[] = useMemo(
    () => (Array.isArray(rawRoom?.libcal?.available_blocks) ? rawRoom.libcal.available_blocks : []),
    [rawRoom]
  );

  const isToday = browseKey === todayKey();
  const nowDecimal = useMemo(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browseKey, blocks.length]);

  // --- Booking flow actions (ported from legacy Sidebar.js) ---

  const loadOptions = async (startDateTime: string, startOptions: StartOption[]) => {
    if (!rawRoom || !selectedRoomId) return;
    const payload = getRoomPayload(rawRoom);
    setBooking({
      ...EMPTY_BOOKING,
      roomId: selectedRoomId,
      status: 'loading-options',
      startDateTime,
      startOptions,
    });
    try {
      const response: any = await fetchLibCalBookingOptions(payload, startDateTime);
      setBooking({
        ...EMPTY_BOOKING,
        roomId: selectedRoomId,
        status: 'options-ready',
        startDateTime: response?.startDateTime || startDateTime,
        endDateTime: response?.defaultEndDateTime || '',
        startOptions,
        durationOptions: response?.durationOptions || [],
      });
    } catch (err: any) {
      playErrorHaptic();
      setBooking({
        ...EMPTY_BOOKING,
        roomId: selectedRoomId,
        status: 'error',
        startDateTime,
        startOptions,
        error: err?.message || 'Could not start the booking flow.',
      });
    }
  };

  const startBooking = (block: any) => {
    if (!rawRoom?.libcal || !block?.start) return;
    playSelectionHaptic();
    const startOptions = buildStartOptions(block);
    void loadOptions(startOptions[0]?.start || block.start, startOptions);
  };

  const loadForm = async () => {
    if (!rawRoom?.libcal || !booking.startDateTime || !booking.endDateTime) return;
    playSelectionHaptic();
    const payload = getRoomPayload(rawRoom);
    setBooking((prev) => ({ ...prev, status: 'loading-form', error: null }));
    try {
      const response: any = await fetchLibCalBookingForm(
        payload,
        booking.startDateTime,
        booking.endDateTime
      );
      // LibCal now requires SSO before serving the booking form — fall back
      // to finishing the reservation on LibCal itself.
      if (response?.authRequired) {
        setBooking((prev) => ({
          ...prev,
          status: 'auth-required',
          authMessage:
            response?.message ||
            'UMD LibCal now requires you to sign in before reserving. Continue on LibCal to finish booking.',
          error: null,
        }));
        return;
      }
      setBooking((prev) => ({
        ...prev,
        status: 'form-ready',
        holdMessage: response?.holdMessage || '',
        summaryRows: response?.summaryRows || [],
        termsHtml: response?.termsHtml || '',
        bookingContext: response?.bookingContext || null,
        fields: response?.fields || [],
        fieldValues: buildInitialFieldValues(response?.fields || []),
        submitLabel: response?.submitLabel || 'Submit Booking',
        showForm: !(response?.termsHtml || '').trim(),
        error: null,
      }));
    } catch (err: any) {
      playErrorHaptic();
      setBooking((prev) => ({
        ...prev,
        status: 'options-ready',
        error: err?.message || 'Could not load the booking form.',
      }));
    }
  };

  const submitBooking = async () => {
    if (!rawRoom?.libcal) return;
    playSelectionHaptic();

    const missing = (booking.fields || []).find(
      (field) => field.required && !String(booking.fieldValues?.[field.name] || '').trim()
    );
    if (missing) {
      playErrorHaptic();
      setBooking((prev) => ({ ...prev, error: `${missing.label} is required.` }));
      return;
    }

    setBooking((prev) => ({ ...prev, status: 'submitting', error: null }));
    try {
      const response: any = await submitLibCalBooking(booking.bookingContext, booking.fieldValues);
      if (response?.authRequired) {
        playErrorHaptic();
        setBooking((prev) => ({
          ...prev,
          status: 'auth-required',
          authMessage:
            response?.message ||
            'UMD LibCal now requires you to sign in before reserving. Continue on LibCal to finish booking.',
          error: null,
        }));
        return;
      }
      playSuccessHaptic();
      setBooking((prev) => ({
        ...prev,
        status: 'success',
        successHtml: response?.successHtml || '',
        error: null,
      }));
    } catch (err: any) {
      playErrorHaptic();
      setBooking((prev) => ({
        ...prev,
        status: 'form-ready',
        error: err?.message || 'Could not submit the booking.',
      }));
    }
  };

  if (!isRoom || !isLibCal) return null;

  const bookingUrl = libcalBookingUrl(rawRoom, browseKey);
  const holdMessage = compactHoldMessage(booking.holdMessage);
  const openLibCal = () => {
    if (!bookingUrl) return;
    playSelectionHaptic();
    window.open(bookingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <PanelFrame
      eyebrow={resolved?.building?.name ?? 'Study Room'}
      title={String(resolved?.room?.name ?? rawRoom?.name ?? 'Study Room')}
      onBack={handleBack}
    >
      {/* Room meta */}
      <div className="flex flex-wrap gap-1.5">
        {rawRoom?.type ? (
          <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
            {rawRoom.type}
          </span>
        ) : null}
        {rawRoom?.capacity ? (
          <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
            Capacity {rawRoom.capacity}
          </span>
        ) : null}
        <span className="rounded-full border border-umd-red/30 bg-umd-red/10 px-2.5 py-1 text-[11px] font-medium text-umd-red">
          Reservable via LibCal
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {resolved?.building ? (
          <GhostButton
            onClick={() => {
              playSelectionHaptic();
              openWalkingDirections(resolved.building.lat, resolved.building.lng);
            }}
          >
            Navigate
          </GhostButton>
        ) : null}
        {bookingUrl ? (
          <GhostButton onClick={openLibCal}>
            Open in LibCal
            <ExternalLink className="h-3.5 w-3.5" />
          </GhostButton>
        ) : null}
      </div>

      {!IN_APP_BOOKING_ENABLED ? (
        <p className="mt-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          UMD LibCal requires you to sign in to reserve. Browse available times
          below, then finish on LibCal with your UMD login.
        </p>
      ) : null}

      {/* Date browser */}
      <div className="mt-5">
        <DaySwitcher
          label="Booking Date"
          dateKey={browseKey}
          onChange={(key) => {
            playSelectionHaptic();
            setBrowseKey(key);
          }}
        />
        <div className="mt-2 space-y-2">
          {browse.status === 'loading' ? (
            <LoadingNote>Loading study-room times…</LoadingNote>
          ) : null}
          {browse.status === 'error' && browse.error ? (
            <ErrorNote message={browse.error} onRetry={() => loadBrowseDate(browseKey, true)} />
          ) : null}
        </div>
      </div>

      {/* Bookable blocks */}
      <SectionHeader>{IN_APP_BOOKING_ENABLED ? 'Bookable Times' : 'Available Times'}</SectionHeader>
      {blocks.length ? (
        <div className="space-y-2">
          {blocks.map((block: any, idx: number) => {
            const startDec = parseFloat(block?.time_start);
            const endDec = parseFloat(block?.time_end);
            const activeNow =
              isToday &&
              Number.isFinite(startDec) &&
              Number.isFinite(endDec) &&
              nowDecimal >= startDec &&
              nowDecimal < (endDec <= startDec ? endDec + 24 : endDec);
            return (
              <div
                key={`${block?.start ?? idx}`}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5',
                  activeNow
                    ? 'border-status-available/40 bg-status-available/10'
                    : 'border-border bg-card'
                )}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {decimalToTimeString(block?.time_start)} –{' '}
                    {decimalToTimeString(block?.time_end)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activeNow ? 'Available now' : 'Available to reserve'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={IN_APP_BOOKING_ENABLED ? () => startBooking(block) : openLibCal}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-umd-red px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {IN_APP_BOOKING_ENABLED ? (
                    'Book'
                  ) : (
                    <>
                      Reserve
                      <ExternalLink className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : browse.status === 'loading' ? null : (
        <EmptyState
          title="No bookable times"
          body="This room has no reservable blocks on the selected date."
        />
      )}

      {/* Booking card — legacy in-app booking flow, gated off (see
          IN_APP_BOOKING_ENABLED). Preserved for easy re-enable. */}
      {IN_APP_BOOKING_ENABLED && booking.status !== 'idle' && booking.roomId === selectedRoomId ? (
        <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <SectionHeader className="mt-0">Reserve In App</SectionHeader>

          {booking.error ? (
            <div className="mb-3">
              <ErrorNote message={booking.error} />
            </div>
          ) : null}

          {booking.status === 'loading-options' || booking.status === 'loading-form' ? (
            <LoadingNote>
              {booking.status === 'loading-options'
                ? 'Checking LibCal booking options…'
                : 'Loading the official booking form…'}
            </LoadingNote>
          ) : null}

          {booking.status === 'error' ? (
            <div className="mt-2 flex gap-2">
              <GhostButton onClick={() => setBooking(EMPTY_BOOKING)}>Cancel</GhostButton>
            </div>
          ) : null}

          {booking.status === 'auth-required' ? (
            <div className="space-y-3">
              <p className="rounded-xl border border-status-opening-soon/40 bg-status-opening-soon/10 px-3 py-2.5 text-xs leading-relaxed text-foreground/90">
                {booking.authMessage}
              </p>
              <div className="flex flex-wrap gap-2">
                {bookingUrl ? (
                  <PrimaryButton
                    onClick={() => {
                      playSelectionHaptic();
                      window.open(bookingUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Reserve on LibCal
                    <ExternalLink className="h-3.5 w-3.5" />
                  </PrimaryButton>
                ) : null}
                <GhostButton onClick={() => setBooking(EMPTY_BOOKING)}>Cancel</GhostButton>
              </div>
            </div>
          ) : null}

          {booking.status === 'options-ready' ? (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Start</span>
                <select
                  className={inputClass}
                  value={booking.startDateTime}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    playSelectionHaptic();
                    void loadOptions(e.target.value, booking.startOptions);
                  }}
                >
                  {booking.startOptions.map((option) => (
                    <option key={option.start} value={option.start}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Reserve Until
                </span>
                <select
                  className={inputClass}
                  value={booking.endDateTime}
                  onChange={(e) =>
                    setBooking((prev) => ({ ...prev, endDateTime: e.target.value }))
                  }
                >
                  {booking.durationOptions.map((option) => (
                    <option key={option.end} value={option.end}>
                      {formatLibCalDateTime(option.end)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2 pt-1">
                <PrimaryButton onClick={() => void loadForm()}>Continue</PrimaryButton>
                <GhostButton onClick={() => setBooking(EMPTY_BOOKING)}>Cancel</GhostButton>
              </div>
            </div>
          ) : null}

          {booking.status === 'form-ready' ||
          booking.status === 'submitting' ||
          booking.status === 'success' ? (
            <div className="space-y-3">
              {holdMessage ? (
                <p className="rounded-xl border border-status-opening-soon/40 bg-status-opening-soon/10 px-3 py-2 text-xs font-medium text-status-opening-soon">
                  {holdMessage}
                </p>
              ) : null}

              {booking.summaryRows.length ? (
                <div className="space-y-1.5 rounded-xl border border-border bg-secondary/50 px-3 py-2.5">
                  {booking.summaryRows.map((row, index) => (
                    <div
                      key={`${row.item}-${index}`}
                      className="flex flex-wrap items-baseline gap-x-2 text-xs"
                    >
                      <span className="font-semibold text-foreground">{row.item}</span>
                      <span className="text-foreground/80">
                        {row.from} - {row.to}
                      </span>
                      <span className="text-muted-foreground">{row.category}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {booking.status === 'success' ? (
                <>
                  {booking.successHtml ? (
                    <div
                      className="rounded-xl border border-status-available/40 bg-status-available/10 px-3 py-2.5 text-sm text-foreground [&_a]:text-umd-red [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(booking.successHtml) }}
                    />
                  ) : (
                    <p className="rounded-xl border border-status-available/40 bg-status-available/10 px-3 py-2.5 text-sm font-medium text-status-available">
                      Booking submitted. Check your email for confirmation.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <PrimaryButton onClick={() => setBooking(EMPTY_BOOKING)}>Done</PrimaryButton>
                  </div>
                </>
              ) : (
                <>
                  {!booking.showForm && booking.termsHtml ? (
                    <div className="space-y-2">
                      <details className="rounded-xl border border-border bg-secondary/50 px-3 py-2.5 text-xs text-foreground/80">
                        <summary className="cursor-pointer font-medium text-foreground">
                          View terms
                        </summary>
                        <div
                          className="mt-2 leading-relaxed [&_a]:text-umd-red [&_a]:underline"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(booking.termsHtml) }}
                        />
                      </details>
                      <PrimaryButton
                        onClick={() => {
                          playSelectionHaptic();
                          setBooking((prev) => ({ ...prev, showForm: true }));
                        }}
                      >
                        Open Form
                      </PrimaryButton>
                    </div>
                  ) : null}

                  {booking.showForm ? (
                    <div className="space-y-3">
                      {booking.fields.map((field) => (
                        <label key={field.name} className="block">
                          <span className="mb-1 block text-xs font-medium text-muted-foreground">
                            {field.label}
                            {field.required ? ' *' : ''}
                          </span>
                          {field.type === 'select' ? (
                            <select
                              className={inputClass}
                              value={booking.fieldValues[field.name] || ''}
                              onChange={(e) =>
                                setBooking((prev) => ({
                                  ...prev,
                                  fieldValues: {
                                    ...prev.fieldValues,
                                    [field.name]: e.target.value,
                                  },
                                }))
                              }
                            >
                              {(field.options || []).map((option) => (
                                <option
                                  key={`${field.name}-${option.value}-${option.label}`}
                                  value={option.value}
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className={inputClass}
                              type={field.type === 'email' ? 'email' : 'text'}
                              placeholder={field.placeholder || ''}
                              value={booking.fieldValues[field.name] || ''}
                              onChange={(e) =>
                                setBooking((prev) => ({
                                  ...prev,
                                  fieldValues: {
                                    ...prev.fieldValues,
                                    [field.name]: e.target.value,
                                  },
                                }))
                              }
                            />
                          )}
                          {field.helpText ? (
                            <span className="mt-1 block text-[11px] text-muted-foreground">
                              {field.helpText}
                            </span>
                          ) : null}
                        </label>
                      ))}

                      <div className="flex gap-2 pt-1">
                        <PrimaryButton
                          onClick={() => void submitBooking()}
                          disabled={booking.status === 'submitting'}
                        >
                          {booking.status === 'submitting' ? 'Submitting…' : booking.submitLabel}
                        </PrimaryButton>
                        <GhostButton
                          onClick={() => setBooking(EMPTY_BOOKING)}
                          disabled={booking.status === 'submitting'}
                        >
                          Cancel
                        </GhostButton>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </PanelFrame>
  );
}

export default LibraryBookingSheet;
