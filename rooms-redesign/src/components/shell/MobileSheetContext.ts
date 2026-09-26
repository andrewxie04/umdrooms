import { createContext, useContext } from 'react';

interface MobileSheetActions {
  expand(): void;
  showMap(): void;
}

export const MobileSheetContext = createContext<MobileSheetActions | null>(null);

export function useExpandMobileSheet(): () => void {
  return useContext(MobileSheetContext)?.expand ?? (() => undefined);
}

export function useShowMobileMap(): () => void {
  return useContext(MobileSheetContext)?.showMap ?? (() => undefined);
}
