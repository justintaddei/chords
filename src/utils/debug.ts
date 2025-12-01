import { get } from '../store';

export const debug = (...args: unknown[]) => {
  if (get('debug')) console.log('[chords] debug:', ...args);
};
