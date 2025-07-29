import vscode from 'vscode'
import { moveAbsCol, moveCols, moveRows, moveTo } from './actions/cursorTo'
import { CharPosition } from './parsing/utils/charPosition'
import {
  isEOF,
  isNewLine,
  isPunctuation,
  isWhitespace,
  isWord,
} from './parsing/utils/charTypes'
import { walkLeft, walkRight } from './parsing/walk'
import { get } from './store'

export const motion = <F extends (...args: any[]) => void>(moveFn: F, ...args: Parameters<F>) => () => moveFn(...args)

export const endOfWordRight = ({
  doc,
  offset,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  startUnderCursor?: boolean
}) => {
  for (const { chars, position } of walkRight({
    doc,
    offset,
    kernel: [0, 1],
    startUnderCursor,
  })) {
    const [char, nextChar] = chars

    if (isEOF(nextChar)) return new CharPosition(position)

    if (!isWhitespace(char) && isNewLine(nextChar))
      return new CharPosition(position)

    if (isWord(char) && !isWord(nextChar)) return new CharPosition(position)

    if (isPunctuation(char) && !isPunctuation(nextChar))
      return new CharPosition(position)
  }

  return null
}

export const startOfWordRight = ({
  doc,
  offset,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  startUnderCursor?: boolean
}) => {
  for (const { chars, position } of walkRight({
    doc,
    offset,
    kernel: [1, 1],
    startUnderCursor,
  })) {
    const [prevChar, char, nextChar] = chars

    if (isEOF(nextChar)) return new CharPosition(position)

    if (isNewLine(prevChar) && !isWhitespace(char))
      return new CharPosition(position)

    if (!isWord(prevChar) && isWord(char)) return new CharPosition(position)

    if (!isPunctuation(prevChar) && isPunctuation(char))
      return new CharPosition(position)
  }

  return null
}

export const endOfWordLeft = ({
  doc,
  offset,
  selection,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  selection: vscode.Selection
  startUnderCursor?: boolean
}) => {
  for (const { chars, position } of walkLeft({
    doc,
    offset,
    kernel: [1, 1],
    selection,
    startUnderCursor,
  })) {
    const [prevChar, char, nextChar] = chars

    if (isEOF(prevChar)) return new CharPosition(position)

    if (!isWhitespace(char) && isNewLine(nextChar))
      return new CharPosition(position)

    if (isWord(char) && !isWord(nextChar)) return new CharPosition(position)

    if (isPunctuation(char) && !isPunctuation(nextChar))
      return new CharPosition(position)
  }

  return null
}

export const startOfWordLeft = ({
  doc,
  offset,
  selection,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  selection: vscode.Selection
  startUnderCursor?: boolean
}) => {
  for (const { chars, position } of walkLeft({
    doc,
    offset,
    kernel: [1, 0],
    selection,
    startUnderCursor,
  })) {
    const [prevChar, char] = chars

    if (isEOF(prevChar)) return new CharPosition(position)

    if (isNewLine(prevChar) && !isWhitespace(char))
      return new CharPosition(position)

    if (!isWord(prevChar) && isWord(char)) return new CharPosition(position)

    if (!isPunctuation(prevChar) && isPunctuation(char))
      return new CharPosition(position)
  }

  return null
}

export const endOfStringLeft = ({
  doc,
  offset,
  selection,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  selection: vscode.Selection
  startUnderCursor?: boolean
}) => {
  for (const { chars, position } of walkLeft({
    doc,
    offset,
    selection,
    kernel: [1, 1],
    startUnderCursor,
  })) {
    const [nextChar, char, prevChar] = chars

    if (isEOF(nextChar)) return new CharPosition(position)

    if (!isWhitespace(char) && (isWhitespace(prevChar) || isNewLine(prevChar)))
      return new CharPosition(position)
  }

  return null
}

export const endOfStringRight = ({
  doc,
  offset,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  startUnderCursor?: boolean
}) => {
  for (const { chars, position } of walkRight({
    doc,
    offset,
    kernel: [0, 1],
    startUnderCursor,
  })) {
    const [char, nextChar] = chars

    if (isEOF(nextChar)) return new CharPosition(position)

    if (!isWhitespace(char) && (isWhitespace(nextChar) || isNewLine(nextChar)))
      return new CharPosition(position)
  }

  return null
}


export const startOfStringLeft = ({
  doc,
  offset,
  selection,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  selection: vscode.Selection
  startUnderCursor?: boolean
}) => {
  for (const { chars, position } of walkLeft({
    doc,
    offset,
    kernel: [1, 1],
    selection,
    startUnderCursor,
  })) {
    const [nextChar, char] = chars

    if (isEOF(nextChar)) return new CharPosition(position)

    if (!isWhitespace(char) && (isWhitespace(nextChar) || isNewLine(nextChar)))
      return new CharPosition(position)
  }

  return null
}

export const startOfStringRight = ({
  doc,
  offset,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  startUnderCursor?: boolean
}) => {
  for (const { chars, position } of walkRight({
    doc,
    offset,
    kernel: [1, 1],
    startUnderCursor,
  })) {
    const [prevChar, char, nextChar] = chars

    if (isEOF(nextChar)) return new CharPosition(position)

    if (!isWhitespace(char) && (isWhitespace(prevChar) || isNewLine(prevChar)))
      return new CharPosition(position)
  }

  return null
}



export const firstNoneBlankChar = ({
  doc,
  offset,
  selection,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  selection: vscode.Selection
  startUnderCursor?: boolean
}) => {
  let lastCharPos = null;

  for (const { chars, position } of walkLeft({
    doc,
    offset,
    kernel: [0, 0],
    selection,
    startUnderCursor,
  })) {
    const [char] = chars

    if (isNewLine(char)) return lastCharPos

    if (!isWhitespace(char)) {
      lastCharPos = new CharPosition(position)
    }
  }

  return lastCharPos
}

export const lastNoneBlankChar = ({
  doc,
  offset,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  startUnderCursor?: boolean
}) => {
  let lastCharPos = null;

  for (const { chars, position } of walkRight({
    doc,
    offset,
    kernel: [0, 0],
    startUnderCursor,
  })) {
    const [char] = chars

    if (isNewLine(char)) return lastCharPos

    if (!isWhitespace(char)) {
      lastCharPos = new CharPosition(position)
    }
  }

  return lastCharPos
}

export const endOfLine = ({
  doc,
  offset,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  startUnderCursor?: boolean
}) => {
  for (const { chars, position } of walkRight({
    doc,
    offset,
    kernel: [0, 1],
    startUnderCursor,
  })) {
    const [, nextChar] = chars

    if (isEOF(nextChar)) return new CharPosition(position)

    if (isNewLine(nextChar)) return new CharPosition(position)
  }

  return null
}

export const findCharRight = (
  {
    doc,
    offset,
    startUnderCursor = false,
  }: {
    doc: vscode.TextDocument
    offset: number
    startUnderCursor?: boolean
  }
) => {
  const { arg } = get('cmd')

  if (arg.length === 0) throw new Error('[chords] findCharRight motion was called without an arg')

  for (const { chars, position } of walkRight({
    doc,
    offset,
    kernel: [0, 0],
    startUnderCursor,
  })) {
    const [char] = chars

    if (isEOF(char)) return null
    if (isNewLine(char)) return null

    if (char === arg)
      return new CharPosition(position)
  }

  return null
}

export const findCharLeft = (
  {
    doc,
    offset,
    selection,
    startUnderCursor = false,
  }: {
    doc: vscode.TextDocument
    offset: number
    selection: vscode.Selection
    startUnderCursor?: boolean
  }
) => {
  const { arg } = get('cmd')

  if (arg.length === 0) throw new Error('[chords] findCharLeft motion was called without an arg')

  for (const { chars, position } of walkLeft({
    doc,
    offset,
    selection,
    kernel: [0, 0],
    startUnderCursor,
  })) {
    const [char] = chars

    if (isEOF(char)) return null
    if (isNewLine(char)) return null

    if (char === arg)
      return new CharPosition(position)
  }

  return null
}

export const tillCharRight = (
  {
    doc,
    offset,
    startUnderCursor = false,
  }: {
    doc: vscode.TextDocument
    offset: number
    startUnderCursor?: boolean
  }
) => {
  const { arg } = get('cmd')

  if (arg.length === 0) throw new Error('[chords] tillCharRight motion was called without an arg')

  for (const { chars, position } of walkRight({
    doc,
    offset,
    kernel: [0, 1],
    startUnderCursor,
  })) {
    const [_, nextChar] = chars

    if (isEOF(nextChar)) return null
    if (isNewLine(nextChar)) return null

    if (nextChar === arg)
      return new CharPosition(position)
  }

  return null
}


export const tillCharLeft = (
  {
    doc,
    offset,
    selection,
    startUnderCursor = false,
  }: {
    doc: vscode.TextDocument
    offset: number
    selection: vscode.Selection
    startUnderCursor?: boolean
  }
) => {
  const { arg } = get('cmd')

  if (arg.length === 0) throw new Error('[chords] tillCharLeft motion was called without an arg')

  for (const { chars, position } of walkLeft({
    doc,
    offset,
    selection,
    kernel: [1, 0],
    startUnderCursor,
  })) {
    const [prevChar, _] = chars

    if (isEOF(prevChar)) return null
    if (isNewLine(prevChar)) return null

    if (prevChar === arg)
      return new CharPosition(position)
  }

  return null
}


export const motions = {
  left: motion(moveCols, -1),
  right: motion(moveCols, 1),
  firstChar: motion(moveAbsCol, 0),
  lastChar: motion(moveTo, endOfLine),

  firstNoneBlankChar: motion(moveTo, firstNoneBlankChar),
  lastNoneBlankChar: motion(moveTo, lastNoneBlankChar),

  findCharRight: motion(moveTo, findCharRight),
  findCharLeft: motion(moveTo, findCharLeft),
  tillCharRight: motion(moveTo, tillCharRight),
  tillCharLeft: motion(moveTo, tillCharLeft),

  up: motion(moveRows, -1),
  down: motion(moveRows, 1),

  startOfWordRight: motion(moveTo, startOfWordRight),
  startOfWordLeft: motion(moveTo, startOfWordLeft),
  endOfWordRight: motion(moveTo, endOfWordRight),
  endOfWordLeft: motion(moveTo, endOfWordLeft),

  startOfStringRight: motion(moveTo, startOfStringRight),
  startOfStringLeft: motion(moveTo, startOfStringLeft),
  endOfStringRight: motion(moveTo, endOfStringRight),
  endOfStringLeft: motion(moveTo, endOfStringLeft),

  rows: (count: number) => motion(moveRows, count),
  cols: (count: number) => motion(moveCols, count),
  absCols: (count: number) => motion(moveAbsCol, count),
}