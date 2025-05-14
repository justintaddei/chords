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

export const endOfWordRight = (doc: vscode.TextDocument, offset: number) => {
  for (const { chars, position } of walkRight(doc, offset, [0, 1])) {
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

export const startOfWordRight = (doc: vscode.TextDocument, offset: number) => {
  for (const { chars, position } of walkRight(doc, offset, [1, 1])) {
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

export const endOfWordLeft = (
  doc: vscode.TextDocument,
  offset: number,
  selection: vscode.Selection
) => {
  for (const { chars, position } of walkLeft(doc, offset, [1, 1], selection)) {
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

export const startOfWordLeft = (
  doc: vscode.TextDocument,
  offset: number,
  selection: vscode.Selection
) => {
  for (const { chars, position } of walkLeft(doc, offset, [1, 0], selection)) {
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
