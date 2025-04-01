import { get } from '../store'

export const debug = (...args: any[]) => {
  if (get('debug')) console.log('[chords] debug:', ...args)
}
