import { type ChordDescriptor, onInput } from './inputHandler'
import { get, set, subscribe } from './store'
import { showWarning } from './ui/statusBar'

export const record = (update = false) => {
  if (!get('recording')) return

  const recordedChords = get('recordedChords')

  if (update) recordedChords.pop()

  recordedChords.push(structuredClone(get('lastChord')))

  set('recordedChords', recordedChords)
}

export const repeatChord = async (
  chord: ChordDescriptor = get('lastChord')
) => {
  set('chord', [])

  set('mode', chord.mode)
  set('lastChord', chord)
  set('replaying', true)

  for (const char of chord.chord) await onInput(char)

  set('replaying', false)
}

export const replay = async () => {
  if (!get('recordedChords').length) return showWarning('(nothing recorded)')

  for (const chord of get('recordedChords')) await repeatChord(chord)
}

subscribe(['recording'], ({ recording }) => {
  if (recording) set('recordedChords', [])
})
