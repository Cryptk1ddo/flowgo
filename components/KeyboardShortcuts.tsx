'use client'
import { useEffect } from 'react';

// This is a basic implementation. A real-world version would be more robust,
// likely using a state machine to manage focus between lists (tasks, habits).
export default function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // console.log(`Key pressed: ${event.key}`);
      // Implement j/k navigation, Enter, etc. here
      // For example:
      if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        // Open quick log modal - logic would go in Zustand store
        console.log('Trigger Quick Log');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
'use client'
import { useEffect } from 'react';

export default function KeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        console.log('Trigger Quick Log');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
