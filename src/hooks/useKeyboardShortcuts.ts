'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape key to close modals even in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : true;
        const metaMatch = shortcut.meta ? event.metaKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : true;
        const altMatch = shortcut.alt ? event.altKey : true;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        // Check if ctrl OR meta is required (for cross-platform compatibility)
        const modifierMatch =
          (shortcut.ctrl || shortcut.meta
            ? event.ctrlKey || event.metaKey
            : true) &&
          shiftMatch &&
          altMatch;

        if (keyMatch && modifierMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined common shortcuts
export const commonShortcuts = {
  search: (action: () => void): KeyboardShortcut => ({
    key: 'k',
    meta: true,
    ctrl: true,
    description: 'Global search',
    action,
  }),
  newApplication: (action: () => void): KeyboardShortcut => ({
    key: 'n',
    meta: true,
    ctrl: true,
    description: 'New application',
    action,
  }),
  findContacts: (action: () => void): KeyboardShortcut => ({
    key: 'f',
    meta: true,
    ctrl: true,
    description: 'Find contacts',
    action,
  }),
  export: (action: () => void): KeyboardShortcut => ({
    key: 'e',
    meta: true,
    ctrl: true,
    description: 'Export data',
    action,
  }),
  selectAll: (action: () => void): KeyboardShortcut => ({
    key: 'a',
    meta: true,
    ctrl: true,
    description: 'Select all',
    action,
  }),
  escape: (action: () => void): KeyboardShortcut => ({
    key: 'Escape',
    description: 'Close modal',
    action,
  }),
  help: (action: () => void): KeyboardShortcut => ({
    key: '?',
    shift: true,
    description: 'Show shortcuts',
    action,
  }),
};
