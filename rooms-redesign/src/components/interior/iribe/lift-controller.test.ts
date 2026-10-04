import { describe, expect, it } from 'vitest';
import type { FloorId } from './layout';
import { LiftController, type LiftPhase } from './lift-controller';

const FLOORS = ['G', '1', '2', '3', '4', '5'] as const satisfies readonly FloorId[];
const CARS = [0, 1] as const;
const INITIAL_TRIP = { floor: 'G', car: 0, phase: 'closed', destination: null };

function expectDoors(lift: LiftController, activeProgress: number) {
  const trip = lift.trip;
  for (const floor of [...FLOORS, 'R'] as const) {
    for (const car of CARS) {
      const progress = lift.doorProgress(floor, car);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
      expect(progress).toBeCloseTo(floor === trip.floor && car === trip.car ? activeProgress : 0);
    }
  }
}

function openLift(floor: FloorId = 'G', car: 0 | 1 = 0) {
  const lift = new LiftController();
  expect(lift.call(floor, car)).toBe(true);
  expect(lift.update(0.65)).toEqual({ changed: true, arrival: null });
  expect(lift.trip).toEqual({ floor, car, phase: 'open', destination: null });
  return lift;
}

function expectTravel(lift: LiftController, destination: FloorId) {
  const { floor, car } = lift.trip;
  expect(lift.travel(destination, true)).toBe(true);
  expect(lift.trip).toEqual({ floor, car, phase: 'closing', destination });
  expectDoors(lift, 1);
  expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
  expectDoors(lift, 0.5);
  expect(lift.trip.floor).toBe(floor);
  expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
  expect(lift.trip).toEqual({ floor, car, phase: 'moving', destination });
  expectDoors(lift, 0);
  expect(lift.update(0.4)).toEqual({ changed: true, arrival: null });
  expect(lift.trip).toEqual({ floor, car, phase: 'moving', destination });
  expectDoors(lift, 0);
  expect(lift.update(0.4)).toEqual({ changed: true, arrival: { floor: destination, car } });
  expect(lift.trip).toEqual({ floor: destination, car, phase: 'opening', destination: null });
  expectDoors(lift, 0);
  expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
  expectDoors(lift, 0.5);
  expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
  expect(lift.trip).toEqual({ floor: destination, car, phase: 'open', destination: null });
  expectDoors(lift, 1);
  expect(lift.update(10)).toEqual({ changed: false, arrival: null });
}

function duringPhase(phase: LiftPhase | 'arrival') {
  const lift = new LiftController();
  expect(lift.call('5', 1)).toBe(true);
  if (phase === 'opening') {
    lift.update(0.325);
    return lift;
  }
  lift.update(0.65);
  if (phase === 'closed') {
    lift.close(false);
    lift.update(0.65);
  } else if (phase !== 'open') {
    lift.travel('2', true);
    lift.update(phase === 'closing' ? 0.325 : phase === 'moving' ? 1 : 10);
  }
  return lift;
}

describe('lift landing calls', () => {
  it('starts closed on G in car 0 and stays idle without a request', () => {
    const lift = new LiftController();
    expect(lift.trip).toEqual(INITIAL_TRIP);
    expectDoors(lift, 0);
    expect(lift.update(100)).toEqual({ changed: false, arrival: null });
    expect(lift.travel('1', true)).toBe(false);
    expect(lift.close(false)).toBe(false);
    expect(lift.trip).toEqual(INITIAL_TRIP);
  });

  for (const car of CARS) {
    it.each(FLOORS)(`opens floor %s in car ${car} in .65 seconds`, floor => {
      const lift = new LiftController();
      expect(lift.call(floor, car)).toBe(true);
      expect(lift.trip).toEqual({ floor, car, phase: 'opening', destination: null });
      expectDoors(lift, 0);
      expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
      expect(lift.trip.phase).toBe('opening');
      expectDoors(lift, 0.5);
      expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
      expect(lift.trip).toEqual({ floor, car, phase: 'open', destination: null });
      expectDoors(lift, 1);
      expect(lift.call(floor, car)).toBe(true);
      expect(lift.trip.phase).toBe('open');
      expectDoors(lift, 1);
      expect(lift.update(1)).toEqual({ changed: false, arrival: null });
    });
  }

  it.each([
    { floor: '2', car: 0 },
    { floor: 'G', car: 1 },
    { floor: '3', car: 1 },
  ] as const)('synchronously shuts G/0 when calling $floor/$car', ({ floor, car }) => {
    const lift = openLift();
    const previous = lift.trip;
    expect(lift.call(floor, car)).toBe(true);
    expect(lift.doorProgress('G', 0)).toBe(0);
    expect(lift.trip).toEqual({ floor, car, phase: 'opening', destination: null });
    expect(previous).toEqual({ floor: 'G', car: 0, phase: 'open', destination: null });
    expectDoors(lift, 0);
    expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
    expectDoors(lift, 0.5);
  });

  it.each(['R', '6', '', 'g'])('rejects unsupported floor %s while closed and open', floor => {
    for (const lift of [new LiftController(), openLift('4', 1)]) {
      const previous = lift.trip;
      expect(lift.call(floor as FloorId, 0)).toBe(false);
      expect(lift.travel(floor as FloorId, true)).toBe(false);
      expect(lift.trip).toEqual(previous);
      expect(lift.update(10)).toEqual({ changed: false, arrival: null });
    }
  });

  it.each([-1, 2, NaN])('rejects invalid car %s without closing an open landing', car => {
    const lift = openLift('3', 1);
    const previous = lift.trip;
    expect(lift.call('1', car as 0 | 1)).toBe(false);
    expect(lift.trip).toEqual(previous);
    expectDoors(lift, 1);
    expect(lift.doorProgress('3', car as 0 | 1)).toBe(0);
  });
});

describe('lift travel', () => {
  // Every distinct served pair travels both ways in each car, including G <-> 5.
  for (const car of CARS) {
    for (const [index, floor] of FLOORS.entries()) {
      for (const destination of FLOORS.slice(index + 1)) {
        it(`travels ${floor} -> ${destination} -> ${floor} in car ${car}`, () => {
          const lift = openLift(floor, car);
          expectTravel(lift, destination);
          expectTravel(lift, floor);
        });
      }
    }
  }

  it('rejects same-floor and outside-car travel while preserving the open door', () => {
    const lift = openLift('3', 1);
    const previous = lift.trip;
    expect(lift.travel('3', true)).toBe(false);
    expect(lift.travel('4', false)).toBe(false);
    expect(lift.trip).toEqual(previous);
    expectDoors(lift, 1);
    expect(lift.update(10)).toEqual({ changed: false, arrival: null });
    expect(lift.travel('4', true)).toBe(true);
  });

  it.each(['opening', 'closing', 'moving'] as const)(
    'rejects racing call, travel, and close requests during %s', phase => {
      const lift = duringPhase(phase);
      expect(lift.trip.phase).toBe(phase);
      const previous = lift.trip;
      const progress = lift.doorProgress('5', 1);
      expect(lift.call('G', 0)).toBe(false);
      expect(lift.call('5', 1)).toBe(false);
      expect(lift.travel('4', true)).toBe(false);
      expect(lift.close(false)).toBe(false);
      expect(lift.close(true)).toBe(false);
      expect(lift.trip).toEqual(previous);
      expect(lift.doorProgress('5', 1)).toBe(progress);
      if (phase === 'opening') {
        expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
        expect(lift.trip).toEqual({ floor: '5', car: 1, phase: 'open', destination: null });
      } else {
        expect(lift.update(10)).toEqual({ changed: true, arrival: { floor: '2', car: 1 } });
        expect(lift.trip).toEqual({ floor: '2', car: 1, phase: 'opening', destination: null });
        expectDoors(lift, 0);
      }
    },
  );
});

describe('lift door closure', () => {
  it('rejects an occupied doorway, then closes without moving after it clears', () => {
    const lift = openLift('4', 1);
    const previous = lift.trip;
    expect(lift.close(true)).toBe(false);
    expect(lift.close(true)).toBe(false);
    expect(lift.trip).toEqual(previous);
    expectDoors(lift, 1);
    expect(lift.update(10)).toEqual({ changed: false, arrival: null });
    expect(lift.close(false)).toBe(true);
    expect(lift.trip).toEqual({ floor: '4', car: 1, phase: 'closing', destination: null });
    expectDoors(lift, 1);
    expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
    expectDoors(lift, 0.5);
    expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
    expect(lift.trip).toEqual({ floor: '4', car: 1, phase: 'closed', destination: null });
    expectDoors(lift, 0);
    expect(lift.update(10)).toEqual({ changed: false, arrival: null });
    expect(lift.call('4', 1)).toBe(true);
    expectDoors(lift, 0);
    expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
    expectDoors(lift, 0.5);
  });

  it('clamps door progress when a large step finishes an opening or ordinary closure', () => {
    const lift = new LiftController();
    lift.call('2', 1);
    expect(lift.update(100)).toEqual({ changed: true, arrival: null });
    expectDoors(lift, 1);
    expect(lift.close(false)).toBe(true);
    expect(lift.update(100)).toEqual({ changed: true, arrival: null });
    expect(lift.trip).toEqual({ floor: '2', car: 1, phase: 'closed', destination: null });
    expectDoors(lift, 0);
  });
});

describe('lift time steps and arrival delivery', () => {
  it.each([1.45, 0.65 + 0.8, 10, Number.MAX_VALUE, Infinity])(
    'reports one arrival behind shut doors with a %s second step', dt => {
      const lift = openLift('G', 1);
      expect(lift.travel('5', true)).toBe(true);
      expect(lift.update(dt)).toEqual({ changed: true, arrival: { floor: '5', car: 1 } });
      expect(lift.trip).toEqual({ floor: '5', car: 1, phase: 'opening', destination: null });
      expectDoors(lift, 0);
      expect(lift.update(0)).toEqual({ changed: false, arrival: null });
      expectDoors(lift, 0);
      // Surplus time cannot skip visible opening on the following frame either.
      expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
      expect(lift.trip.phase).toBe('opening');
      expectDoors(lift, 0.5);
      expect(lift.update(10)).toEqual({ changed: true, arrival: null });
      expect(lift.trip.phase).toBe('open');
      expectDoors(lift, 1);
      expect(lift.update(10)).toEqual({ changed: false, arrival: null });
    },
  );

  it('carries surplus closing time into movement without changing floor early', () => {
    const lift = openLift('5', 0);
    lift.travel('G', true);
    expect(lift.update(1)).toEqual({ changed: true, arrival: null });
    expect(lift.trip).toEqual({ floor: '5', car: 0, phase: 'moving', destination: 'G' });
    expectDoors(lift, 0);
    expect(lift.update(0.44)).toEqual({ changed: true, arrival: null });
    expect(lift.trip.floor).toBe('5');
    expect(lift.update(0.01)).toEqual({ changed: true, arrival: { floor: 'G', car: 0 } });
    expect(lift.trip).toEqual({ floor: 'G', car: 0, phase: 'opening', destination: null });
    expectDoors(lift, 0);
  });

  it('reaches nominal phase boundaries with repeated decimal frame steps', () => {
    const lift = new LiftController();
    lift.call('1', 0);
    for (let frame = 0; frame < 65; frame++) {
      expect(lift.update(0.01)).toEqual({ changed: true, arrival: null });
    }
    expect(lift.trip.phase).toBe('open');
    lift.travel('4', true);
    for (let frame = 0; frame < 65; frame++) {
      expect(lift.update(0.01)).toEqual({ changed: true, arrival: null });
    }
    expect(lift.trip.phase).toBe('moving');
    for (let frame = 0; frame < 80; frame++) {
      expect(lift.update(0.01)).toEqual({
        changed: true,
        arrival: frame === 79 ? { floor: '4', car: 0 } : null,
      });
      expect(lift.trip.floor).toBe(frame === 79 ? '4' : '1');
    }
    expect(lift.trip.phase).toBe('opening');
    expectDoors(lift, 0);
  });

  for (const phase of ['opening', 'closing', 'moving'] as const) {
    it.each([0, -1, -Infinity, NaN])(`makes no progress for dt=%s during ${phase}`, dt => {
      const lift = duringPhase(phase);
      const previous = lift.trip;
      const progress = lift.doorProgress('5', 1);
      expect(lift.update(dt)).toEqual({ changed: false, arrival: null });
      expect(lift.trip).toEqual(previous);
      expect(lift.doorProgress('5', 1)).toBe(progress);
      if (phase === 'opening') {
        expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
        expect(lift.trip.phase).toBe('open');
      } else {
        expect(lift.update(10)).toEqual({ changed: true, arrival: { floor: '2', car: 1 } });
      }
    });
  }
});

describe('lift reset and snapshots', () => {
  it.each(['closed', 'opening', 'open', 'closing', 'moving', 'arrival'] as const)(
    'resets from %s, clearing destination, animation progress, and any pending arrival', phase => {
      const lift = duringPhase(phase);
      expect(lift.trip.phase).toBe(phase === 'arrival' ? 'opening' : phase);
      lift.reset();
      expect(lift.trip).toEqual(INITIAL_TRIP);
      expectDoors(lift, 0);
      expect(lift.update(100)).toEqual({ changed: false, arrival: null });
      lift.reset();
      expect(lift.trip).toEqual(INITIAL_TRIP);
      expect(lift.call('3', 0)).toBe(true);
      expectDoors(lift, 0);
      expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
      expectDoors(lift, 0.5);
      expect(lift.update(0.325)).toEqual({ changed: true, arrival: null });
      expectTravel(lift, 'G');
    },
  );

  it('keeps external snapshot edits from bypassing the state machine', () => {
    const lift = new LiftController();
    const snapshot = lift.trip;
    snapshot.floor = 'R';
    snapshot.car = 1;
    snapshot.phase = 'moving';
    snapshot.destination = '5';
    expect(lift.trip).toEqual(INITIAL_TRIP);
    expectDoors(lift, 0);
    expect(lift.update(10)).toEqual({ changed: false, arrival: null });
    expect(lift.call('G', 0)).toBe(true);
  });
});
