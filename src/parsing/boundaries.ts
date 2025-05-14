import vscode from 'vscode'
import { CharPosition } from './utils/charPosition'
import {
  isEOF,
  isNewLine,
  isPunctuation,
  isWhitespace,
  isWord,
} from './utils/charTypes'
import { walkLeft, walkRight } from './walk'

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
