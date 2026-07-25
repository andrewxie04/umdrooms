// src/components/features/EasterEggs.tsx
//
// React side of the map easter eggs (scene logic lives in
// map3d/scene/eastereggs.ts). Two jobs:
//
//   1. TURTLE MODE trigger — typing "testudo" anywhere (ignored while typing
//      in inputs/textareas/contenteditable) activates turtle mode on the
//      scene handle for 60s (the scene auto-restores) and toasts.
//   2. TESTUDO nose-rub toast — the scene dispatches a window CustomEvent
//      ('umd-easteregg', detail.kind = 'testudo') when the statue is clicked;
//      we toast here.
//
// Toasts use the project's sonner wrapper; the <Toaster/> is mounted here so
// this component stays self-contained.

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '../ui/sonner';

const TRIGGER_WORD = 'testudo';

interface CampusSceneWindowHandle {
  setTurtleMode?: (active: boolean) => void;
}

function sceneHandle(): CampusSceneWindowHandle | null {
  const h = (window as unknown as Record<string, unknown>).__campusScene;
  return (h as CampusSceneWindowHandle) ?? null;
}

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export default function EasterEggs() {
  useEffect(() => {
    let buffer = '';

    const onKeyDown = (e: KeyboardEvent): void => {
      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key.length !== 1 || !/[a-z]/.test(key)) {
        if (key !== 'shift') buffer = '';
        return;
      }
      buffer = (buffer + key).slice(-TRIGGER_WORD.length);
      if (buffer === TRIGGER_WORD) {
        buffer = '';
        sceneHandle()?.setTurtleMode?.(true);
        toast('🐢 TURTLE MODE — the fleet crawls for 60s!', {
          description: 'You typed the secret word. Fear the turtle.',
        });
      }
    };

    const onEgg = (e: Event): void => {
      const kind = (e as CustomEvent<{ kind?: string }>).detail?.kind;
      if (kind === 'testudo') {
        toast('🐢 You rubbed Testudo’s nose — good luck!');
      }
      if (kind === 'fountain') {
        toast('💦 Into the ODK fountain you go!', {
          description: 'A time-honored end-of-semester tradition.',
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('umd-easteregg', onEgg);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('umd-easteregg', onEgg);
    };
  }, []);

  return <Toaster position="bottom-center" richColors={false} />;
}
