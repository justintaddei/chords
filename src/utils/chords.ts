import { get } from '../store'

// export const constructChord = (chord: string[] = get('chord')) => {
//   let count = ''
//   let motion = ''

//   for (const char of chord) {
//     if (motion) motion += char
//     else if (char.match(/^\d$/)) count += char
//     else motion += char
//   }

//   return [count ? Number.parseInt(count) : 1, motion] as const
// }

// /**
//  * Validates whether the provided raw chord is valid based on the current mode and chords configuration.
//  *
//  * @param {string[]} [rawChord=get('chord')] - The raw chord to validate. Defaults to the value retrieved from `get('chord')`.
//  * @returns {boolean} - Returns `true` if the raw chord is valid, otherwise `false`.
//  */
// export const isValid = (rawChord: string[] = get('chord')) => {
//   return Object.keys(get('chords')[get('mode')]).some((chord) => {
//     const [, motion] = constructChord(rawChord)
//     return chord.startsWith(motion)
//   })
// }

// export const getChord = (motion: string) => {
//   return get('chords')[get('mode')][motion]
// }
