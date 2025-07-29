import { collapseSelections } from './actions/collapseSelections'
import { highlightSelections } from './actions/highlight'
import { restoreSelections } from './actions/restoreSelections'
import { saveSelections } from './actions/saveSelections'
import {
  motions
} from './motions'
import { operators } from './operations'
import { get, reset, set } from './store'
import { registerCmd } from './utils/registerCmd'
import * as vscode from 'vscode'

type CmdWithArg = {
  arg: 'char' | 'pattern'
  exec: () => void
}
type CmdType = string | CmdWithArg | (() => void)

type CmdMap = Record<string, CmdType>

const cmds = {
  // debug cmds
  'chords.debug': () => set('debug', !get('debug')),
  'chords.debugJump': () => set('debugJump', !get('debugJump')),

  // select modes
  'chords.mode.insert': () => set('mode', 'insert'),
  'chords.mode.normal': () => set('mode', 'normal'),
  'chords.mode.visual': () => set('mode', 'visual'),
  'chords.mode.visual-block': () => set('mode', 'visual block'),
  'chords.mode.visual-line': () => set('mode', 'visual line'),
  'chords.mode.leader': () => set('mode', 'leader'),

  // commands
  'chords.command.undo': 'editor.action.undo',
  'chords.command.redo': 'editor.action.redo',
  'chords.command.deleteLeft': 'deleteLeft',
  'chords.command.deleteRight': 'deleteRight',

  // operations
  'chords.operation.change': operators.change,
  'chords.operation.delete': operators.deleteLeft,
  'chords.operation.yank': operators.yank,
  'chords.operation.cut': operators.cut,
  'chords.operation.swapCase': operators.swapCase,
  'chords.operation.lowerCase': operators.lowerCase,
  'chords.operation.upperCase': operators.upperCase,


  // motions - left-right
  /*
  TODO: "except after the "$" command" is not currently possible
  These commands move to the specified line. They stop when reaching the first
  or the last line. The first two commands put the cursor in the same column
  (if possible) as it was after the last command that changed the column,
  except after the "$" command, then the cursor will be put on the last
  character of the line.
  */
  'chords.motion.left': motions.left,
  'chords.motion.right': motions.right,
  'chords.motion.firstChar': motions.firstChar,
  'chords.motion.lastChar': motions.lastChar,
  'chords.motion.firstNoneBlankChar': motions.firstNoneBlankChar,
  'chords.motion.lastNoneBlankChar': motions.lastNoneBlankChar,
  'chords.motion.findCharRight': {
    arg: 'char',
    exec: motions.findCharRight
  },
  'chords.motion.findCharLeft': {
    arg: 'char',
    exec: motions.findCharLeft
  },
  'chords.motion.tillCharRight': {
    arg: 'char',
    exec: motions.tillCharRight
  },
  'chords.motion.tillCharLeft': {
    arg: 'char',
    exec: motions.tillCharLeft
  },
  'chords.motion.repeatFind': () => { throw new Error('Not implemented') },

  // motions - up-down
  'chords.motion.up': motions.up,
  'chords.motion.down': motions.down,

  // motions - words
  'chords.motion.startOfWordRight': motions.startOfWordRight,
  'chords.motion.startOfWordLeft': motions.startOfWordLeft,
  'chords.motion.endOfWordRight': motions.endOfWordRight,
  'chords.motion.endOfWordLeft': motions.endOfWordLeft,
  'chords.motion.startOfStringRight': motions.startOfStringRight,
  'chords.motion.startOfStringLeft': motions.startOfStringLeft,
  'chords.motion.endOfStringRight': motions.endOfStringRight,
  'chords.motion.endOfStringLeft': motions.endOfStringLeft,

  // special commands
  'chords.highlightSelections': highlightSelections,
  'chords.clearCmd': () => reset('cmdStr'),
  'chords.saveSelections': saveSelections,
  'chords.restoreSelections': restoreSelections,
  'chords.restoreCursors': () => {
    restoreSelections()
    collapseSelections('anchor')
  },

  // motions - text objects
} satisfies CmdMap

export const getArgType = (cmd: string): 'char' | 'pattern' | null => {
  if (!Object.keys(cmds).includes(cmd)) return null

  const command = cmds[cmd as keyof typeof cmds]
  if (typeof command === 'string') return null
  if (typeof command === 'function') return null

  return command.arg
}

for (const [cmd, action] of Object.entries(cmds)) {
  if (typeof action === 'string')
    registerCmd(cmd, () => vscode.commands.executeCommand(action))
  else if (typeof action === 'function')
    registerCmd(cmd, action)
  else
    registerCmd(cmd, action.exec)
}