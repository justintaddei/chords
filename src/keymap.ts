

type KeyMap = Record<string, (| string & {})>

const commands = {
  'i': 'chords.mode.insert',
  'v': 'chords.mode.visual',
  'p': 'chords.command.paste',
  'P': 'chords.command.pasteBefore',
  'J': 'chords.command.joinLines',
  'x': 'chords.command.deleteRight',
  'X': 'chords.command.deleteLeft',
  'r': 'chords.command.replaceChar',
  '~': 'chords.command.swapCase',
  '/': 'chords.command.search',
  '?': 'chords.command.searchBackward',
  'n': 'chords.command.searchNext',
  'N': 'chords.command.searchPrevious',
  'u': 'chords.command.undo',
  '<C-r>': 'chords.command.redo',
  'gv': 'chords.command.visualLastSelection',
}

const operators = {
  'c': 'chords.operation.change',
  'd': 'chords.operation.delete',
  'y': 'chords.operation.yank',
  'g~': 'chords.operation.swapCase',
  'gu': 'chords.operation.lowerCase',
  'gU': 'chords.operation.upperCase',
} satisfies KeyMap

const motions = {
  // left-right
  'h': 'chords.motion.left',
  'l': 'chords.motion.right',
  '0': 'chords.motion.startOfLine',
  '^': 'chords.motion.firstNoneBlankChar',
  '$': 'chords.motion.endOfLine',
  'g_': 'chords.motion.lastNoneBlankChar',
  'f': 'chords.motion.findCharRight',
  'F': 'chords.motion.findCharLeft',
  't': 'chords.motion.tillCharRight',
  'T': 'chords.motion.tillCharLeft',

  // up-down
  'j': 'chords.motion.down',
  'k': 'chords.motion.up',

  // words
  'w': 'chords.motion.startOfWordRight',
  'b': 'chords.motion.startOfWordLeft',
  'e': 'chords.motion.endOfWordRight',
  'ge': 'chords.motion.endOfWordLeft',
  'W': 'chords.motion.startOfStringRight',
  'B': 'chords.motion.startOfStringLeft',
  'E': 'chords.motion.endOfStringRight',
  'gE': 'chords.motion.endOfStringLeft',
} satisfies KeyMap

export const keyMap = {
  operators,
  motions,
  commands,
}