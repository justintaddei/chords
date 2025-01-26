import vscode from 'vscode'
import { collapseSelections } from './actions/collapseSelections'
import { cursorTo } from './actions/cursorTo'
import { cursorToParagraph } from './actions/cursorToParagraph'
import { restoreSelections } from './actions/restoreSelections'
import { saveSelections } from './actions/saveSelections'
import { selectPair } from './actions/selectPair'
import { selectSymbolAtCursor } from './actions/selectSymbolAtCursor'
import { selectXMLTag } from './actions/selectXMLTag'
import { shrinkSelections } from './actions/shrinkSelection'
import { awaitCapture, clearCapture } from './inputHandler'
import { repeatChord, replay } from './recorder'
import { get, set } from './store'
import { killCapsLockRemapper } from './utils/capsLockRemapper'
import { highlightSelections } from './utils/highlight'
import { registerCmd } from './utils/registerCmd'

// todo: args validation for all commands. Using zod?

registerCmd('chords.repeatLastChord', repeatChord)

registerCmd('chords.toggleRecording', () => set('recording', !get('recording')))

registerCmd('chords.replay', replay)

registerCmd('chords.setInsertMode', () => set('mode', 'insert'))

registerCmd('chords.setNormalMode', () => set('mode', 'normal'))

registerCmd('chords.setVisualMode', () => set('mode', 'visual'))

registerCmd('chords.setLeaderMode', () => set('mode', 'leader'))

registerCmd('chords.highlightSelections', highlightSelections)

registerCmd('chords.clearCapture', clearCapture)

registerCmd('chords.clearChord', () => set('chord', []))

registerCmd('chords.saveSelections', saveSelections)

registerCmd('chords.restoreSelections', restoreSelections)

registerCmd('chords.restoreCursors', () => {
  restoreSelections()
  collapseSelections('anchor')
})

registerCmd('chords.cursorToCharRight', () =>
  awaitCapture((text) => {
    cursorTo({
      text,
      direction: 'right',
    })
  })
)

registerCmd('chords.cursorToCharLeft', () =>
  awaitCapture((text) => {
    cursorTo({
      text,
      direction: 'left',
    })
  })
)

registerCmd('chords.cursorToCharRightSelect', () =>
  awaitCapture((text) => {
    cursorTo({
      text,
      direction: 'right',
      select: true,
    })
  })
)

registerCmd('chords.cursorToCharLeftSelect', () =>
  awaitCapture((text) => {
    cursorTo({
      text,
      direction: 'left',
      select: true,
      inclusive: false,
    })
  })
)

registerCmd('chords.cursorToMatchRight', () => {
  set('highlightCapture', 'right')
  return awaitCapture((text) => {
    cursorTo({
      text,
      direction: 'right',
      inclusive: false,
      endOfMatch: get('captureCommittedWithShift'),
    })
  }, false)
})

registerCmd('chords.cursorToMatchLeft', () => {
  set('highlightCapture', 'left')
  return awaitCapture((text) => {
    cursorTo({
      text,
      direction: 'left',
      inclusive: false,
      endOfMatch: get('captureCommittedWithShift'),
    })
  }, false)
})

registerCmd('chords.cursorToMatchRightSelect', () => {
  set('highlightCapture', 'right')
  return awaitCapture((text) => {
    cursorTo({
      text,
      direction: 'right',
      select: true,
      inclusive: false,
      endOfMatch: get('captureCommittedWithShift'),
    })
  }, false)
})

registerCmd('chords.cursorToMatchLeftSelect', () => {
  set('highlightCapture', 'left')
  return awaitCapture((text) => {
    cursorTo({
      text,
      direction: 'left',
      select: true,
      inclusive: false,
      endOfMatch: get('captureCommittedWithShift'),
    })
  }, false)
})

registerCmd('chords.selectAroundLeft', (...ends: [string, string]) =>
  selectPair(ends, 'left')
)

registerCmd('chords.selectAroundRight', (...ends: [string, string]) =>
  selectPair(ends, 'right')
)

registerCmd('chords.selectAroundXMLTag', selectXMLTag)

registerCmd('chords.selectInsideLeft', (...ends: [string, string]) =>
  selectPair(ends, 'left', true)
)

registerCmd('chords.selectInsideRight', (...ends: [string, string]) =>
  selectPair(ends, 'right', true)
)

registerCmd('chords.selectInsideXMLTag', () => selectXMLTag(true))

registerCmd('chords.shrinkSelections', shrinkSelections)

registerCmd('chords.selectSymbolAtCursor', selectSymbolAtCursor)

registerCmd('chords.paragraphUp', () => cursorToParagraph('up'))

registerCmd('chords.paragraphDown', () => cursorToParagraph('down'))

registerCmd('chords.paragraphUpSelect', () => cursorToParagraph('up', true))

registerCmd('chords.paragraphDownSelect', () => cursorToParagraph('down', true))

registerCmd('chords.replaceCharUnderCursor', () =>
  awaitCapture(async (char) => {
    await vscode.commands.executeCommand('deleteRight')
    await vscode.commands.executeCommand('default:type', { text: char })
    await vscode.commands.executeCommand('cursorLeft')
  })
)

registerCmd('chords.killCapsLockRemapper', killCapsLockRemapper)
