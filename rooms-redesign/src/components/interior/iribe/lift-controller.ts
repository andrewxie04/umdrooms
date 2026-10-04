import type { FloorId } from './layout';

export type LiftPhase = 'closed' | 'opening' | 'open' | 'closing' | 'moving';

export interface LiftTrip {
  floor: FloorId;
  car: 0 | 1;
  phase: LiftPhase;
  destination: FloorId | null;
}

// Published Ground, Level 1, 2, 4 and 5 plans locate the central lift core.
// Continuity through the undocumented Level 3 is inferred; rooftop service is
// not established by those references.
const SERVED_FLOORS: readonly FloorId[] = ['G', '1', '2', '3', '4', '5'];
const DOOR_SECONDS = 0.65;
const MOVE_SECONDS = 0.8;

/** One active landing/car, driven entirely by elapsed seconds from the parent. */
export class LiftController {
  private state: LiftTrip = { floor: 'G', car: 0, phase: 'closed', destination: null };
  private elapsed = 0;

  /** Return a snapshot so callers cannot bypass the transition guards. */
  get trip(): LiftTrip {
    return { ...this.state };
  }

  call(floor: FloorId, car: 0 | 1): boolean {
    if (!SERVED_FLOORS.includes(floor) || (car !== 0 && car !== 1)) return false;
    if (this.state.phase !== 'closed' && this.state.phase !== 'open') return false;
    if (this.state.phase === 'open' && this.state.floor === floor && this.state.car === car) return true;

    // Replacing the active landing synchronously closes any previously open door.
    this.state = { floor, car, phase: 'opening', destination: null };
    this.elapsed = 0;
    return true;
  }

  travel(destination: FloorId, insideCar: boolean): boolean {
    if (this.state.phase !== 'open' || !insideCar
      || !SERVED_FLOORS.includes(destination) || destination === this.state.floor) return false;

    this.state = { ...this.state, phase: 'closing', destination };
    this.elapsed = 0;
    return true;
  }

  close(doorwayOccupied: boolean): boolean {
    if (this.state.phase !== 'open' || doorwayOccupied) return false;
    this.state = { ...this.state, phase: 'closing', destination: null };
    this.elapsed = 0;
    return true;
  }

  /**
   * Consume time across closing/moving phases, but stop at arrival with doors shut.
   * Surplus time at arrival is discarded: opening starts on the next update, after
   * the parent has relocated the camera. Each trip reports that arrival once.
   * `changed` includes animation progress even when the phase stays the same.
   */
  update(dt: number): { changed: boolean; arrival: { floor: FloorId; car: 0 | 1 } | null } {
    // Negative and NaN time steps make no progress; positive infinity is a large step.
    let remaining = dt > 0 ? dt : 0;
    let changed = false;

    while (remaining > 0) {
      const phase = this.state.phase;
      if (phase === 'closed' || phase === 'open') break;

      const duration = phase === 'moving' ? MOVE_SECONDS : DOOR_SECONDS;
      const step = Math.min(remaining, duration - this.elapsed);
      this.elapsed += step;
      remaining = Math.max(0, remaining - step);
      changed = changed || step > 0;

      // Nominal boundaries such as 1.45 - .65 can fall a few ulps short.
      if (duration - this.elapsed > Number.EPSILON * 4) break;
      this.elapsed = 0;
      changed = true;

      if (phase === 'opening') {
        this.state = { ...this.state, phase: 'open' };
      } else if (phase === 'closing') {
        this.state = { ...this.state, phase: this.state.destination === null ? 'closed' : 'moving' };
      } else {
        // Only travel() can enter moving, and it always supplies a destination.
        const floor = this.state.destination!;
        const car = this.state.car;
        this.state = { floor, car, phase: 'opening', destination: null };
        return { changed: true, arrival: { floor, car } };
      }
    }

    return { changed, arrival: null };
  }

  doorProgress(floor: FloorId, car: 0 | 1): number {
    if (floor !== this.state.floor || car !== this.state.car) return 0;
    const progress = Math.max(0, Math.min(1, this.elapsed / DOOR_SECONDS));
    switch (this.state.phase) {
      case 'opening': return progress;
      case 'closing': return 1 - progress;
      case 'open': return 1;
      default: return 0;
    }
  }

  reset(): void {
    this.state = { floor: 'G', car: 0, phase: 'closed', destination: null };
    this.elapsed = 0;
  }
}
