// EditorialComponents.js — Shared primitives for editorial design

import React from 'react';
import './EditorialTheme.css';

/* ═══════════════════════════════════════════════════════════
   Icons (stroke-only, minimal)
   ═══════════════════════════════════════════════════════════ */
export const EditorialIcon = {
  search: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.25"/>
      <path d="m11 11 3.2 3.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  ),
  arrow: (p) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrowL: (p) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M13 8H3M7 4 3 8l4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: (p) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  ),
  check: (p) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="m3 8 3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dot: (p) => (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" {...p}>
      <circle cx="4" cy="4" r="3"/>
    </svg>
  ),
  cal: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1"/>
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  user: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1"/>
      <path d="M3 14c.8-2.5 2.8-4 5-4s4.2 1.5 5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  star: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M8 1l2 4.5 4.5.5-3.5 3 1 4.5L8 11l-4 2.5 1-4.5-3.5-3L6 5.5 8 1z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  starFilled: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" {...p}>
      <path d="M8 1l2 4.5 4.5.5-3.5 3 1 4.5L8 11l-4 2.5 1-4.5-3.5-3L6 5.5 8 1z"/>
    </svg>
  ),
  layers: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="m8 2 6 3-6 3-6-3 6-3Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m2 8 6 3 6-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m2 11 6 3 6-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  toggle: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <rect x="2" y="5" width="12" height="6" rx="3" stroke="currentColor" strokeWidth="1.25"/>
      <circle cx="11" cy="8" r="2" fill="currentColor"/>
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════
   Avatar
   ═══════════════════════════════════════════════════════════ */
export function EditorialAvatar({ initial, size = 'normal' }) {
  const className = `ed-avatar ${size === 'small' ? 'small' : size === 'tiny' ? 'tiny' : ''}`;
  return <div className={className}>{initial}</div>;
}

/* ═══════════════════════════════════════════════════════════
   Pill (Status Chip)
   ═══════════════════════════════════════════════════════════ */
export function EditorialPill({ children, variant = 'muted', ...props }) {
  return (
    <span className={`ed-pill ed-pill--${variant}`} {...props}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Mini Timeline (24-hour occupancy bar)
   ═══════════════════════════════════════════════════════════ */
export function EditorialMiniTimeline({ blocks, nowIdx }) {
  return (
    <div className="ed-mini-timeline" aria-hidden="true">
      {blocks.map((b, i) => (
        <i key={i} data-b={b} data-now={i === nowIdx ? '1' : '0'} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Stat (Big Numeral)
   ═══════════════════════════════════════════════════════════ */
export function EditorialStat({ label, value, sub }) {
  return (
    <div className="ed-stat">
      <div className="label ed-cap">{label}</div>
      <div className="num ed-tnum">{value}</div>
      {sub && <div className="sub ed-mono">{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Kicker (Uppercase Label)
   ═══════════════════════════════════════════════════════════ */
export function EditorialKicker({ children, className = '', ...props }) {
  return (
    <div className={`ed-cap ed-muted ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Hero Numeral (Large Display Number)
   ═══════════════════════════════════════════════════════════ */
export function EditorialHeroNumeral({ children, size = '120px', className = '' }) {
  return (
    <div
      className={`ed-serif ed-tnum ${className}`}
      style={{
        fontSize: size,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        fontWeight: 400,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Room Card
   ═══════════════════════════════════════════════════════════ */
export function EditorialRoomCard({
  buildingCode,
  roomNumber,
  capacity,
  status,
  timeline,
  nowIdx,
  onClick,
  amenities = [],
  isFavorite = false,
}) {
  const getPillVariant = (status) => {
    if (status === 'available') return 'free';
    if (status === 'occupied' || status === 'unavailable') return 'busy';
    if (status === 'tentative') return 'hold';
    return 'muted';
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Room card clicked:', buildingCode, roomNumber);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="ed-room-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="ed-room-card-header">
        <div>
          <h4 className="ed-room-card-title">
            <span style={{ color: 'var(--ed-ink-3)' }}>{buildingCode}</span>{' '}
            <em>{roomNumber}</em>
          </h4>
          <div className="ed-room-card-meta">
            {capacity && <span>{capacity} seats</span>}
            {amenities.length > 0 && (
              <span style={{ color: 'var(--ed-ink-3)' }}>
                · {amenities.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        </div>
        {isFavorite && (
          <div style={{ color: 'var(--ed-accent)' }}>
            {EditorialIcon.starFilled()}
          </div>
        )}
      </div>

      {timeline && <EditorialMiniTimeline blocks={timeline} nowIdx={nowIdx} />}

      <div className="ed-hstack" style={{ justifyContent: 'space-between', marginTop: 'auto' }}>
        <EditorialPill variant={getPillVariant(status)}>
          {status === 'available' ? 'Free now' :
           status === 'unavailable' ? 'Occupied' :
           status === 'tentative' ? 'Tentative' :
           status}
        </EditorialPill>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Building Section
   ═══════════════════════════════════════════════════════════ */
export function EditorialBuildingSection({ building, freeCount, totalCount, children }) {
  const percentage = totalCount > 0 ? Math.round((freeCount / totalCount) * 100) : 0;

  return (
    <div className="ed-building-section">
      <div className="ed-building-header">
        <h3>
          {building.code} · <span style={{ fontStyle: 'italic' }}>{building.name}</span>
        </h3>
        <div className="ed-hstack" style={{ gap: 16 }}>
          <div className="count-badge ed-muted">
            {freeCount}/{totalCount} free · {percentage}%
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Utility Functions
   ═══════════════════════════════════════════════════════════ */

// Format time as 24h clock
export function formatClock(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// Format day
export function formatDay(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Convert occupancy data to timeline blocks (0 = free, 1 = busy, 2 = hold)
// This function is now defined in EditorialMain.js with proper availability integration
export function createTimelineBlocks(room, startTime, endTime) {
  // Placeholder - actual implementation in EditorialMain
  const blocks = new Array(24).fill(0);
  return blocks;
}

// Get current half-hour index (0-47 for 30-min blocks, or 0-23 for hourly)
export function getCurrentTimeIndex(date) {
  const hours = date.getHours();
  return hours; // Simplification for hourly blocks
}
