// browse/useUserLocation.ts — exposes the user's coords ONLY when the
// geolocation permission has already been granted (e.g. the user toggled the
// map's geolocate control). It never triggers a permission prompt: when the
// Permissions API reports 'prompt'/'denied' (or is unavailable), it stays
// null. Used for the building detail "N min walk" chip.

import { useEffect, useState } from 'react';

export interface UserCoords {
  lat: number;
  lng: number;
}

function validCoord(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export function useUserLocation(): UserCoords | null {
  const [coords, setCoords] = useState<UserCoords | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    let watchId: number | null = null;
    let cancelled = false;

    const onPos = (pos: GeolocationPosition) => {
      if (cancelled) return;
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      if (validCoord(lat, lng)) setCoords({ lat, lng });
    };

    const start = () => {
      navigator.geolocation.getCurrentPosition(onPos, undefined, {
        enableHighAccuracy: true,
      });
      watchId = navigator.geolocation.watchPosition(onPos);
    };

    // Gate on the Permissions API so we never cause a prompt. If the query
    // is unsupported or rejects, we simply don't show walk times.
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          if (!cancelled && status.state === 'granted') start();
        })
        .catch(() => {
          /* unsupported — leave coords null */
        });
    }

    return () => {
      cancelled = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return coords;
}
