import vscode from 'vscode'
import { charAt } from '../parsing/utils/charAt'
import {
  CharType,
  getCharType,
  isEOF,
  isNewLine,
} from '../parsing/utils/charTypes'
import { walkRight } from '../parsing/walk'
import { updateSelections } from '../selections/updateSelections'
const searchRightIntoWhitespace = (
  doc: vscode.TextDocument,
  offset: number,
  originalCharType: CharType
) => {
  let acceptedType = originalCharType

  for (const { chars, position } of walkRight(doc, offset, [0, 1])) {
    const [nextChar] = chars

    if (isEOF(nextChar)) return { position, includesWhitespace: false }
    if (isNewLine(nextChar)) return { position, includesWhitespace: false }

    if (
      getCharType(nextChar) === 'whitespace' &&
      originalCharType !== 'whitespace'
    )
      acceptedType = 'whitespace'

    if (getCharType(nextChar) !== acceptedType)
      return { position, includesWhitespace: acceptedType === 'whitespace' }
  }

  return { position: null, includesWhitespace: false }
}

const searchLeft = (
  doc: vscode.TextDocument,
  offset: number,
  originalCharType: CharType
) => {
  for (const { chars, position } of walkRight(doc, offset, [1, 0])) {
    const [prevChar] = chars

    if (isEOF(prevChar)) return { position }
    if (isNewLine(prevChar)) return { position }
    if (getCharType(prevChar) !== originalCharType) return { position }
  }

  return { position: null }
}

const searchLeftIntoWhitespace = (
  doc: vscode.TextDocument,
  offset: number,
  originalCharType: CharType
) => {
  // let acceptedType = originalCharType
  // for (const { chars, position } of walkLeft(doc, offset, [1, 0])) {
  //   const [prevChar] = chars

  //   if (isEOF(prevChar))
  //     return { position, includesWhitespace: acceptedType === 'whitespace' }
  //   if (isNewLine(prevChar))
  //     return { position, includesWhitespace: acceptedType === 'whitespace' }

  //   if (
  //     originalCharType !== 'whitespace' &&
  //     getCharType(prevChar) === 'whitespace'
  //   )
  //     acceptedType = 'whitespace'

  //   if (originalCharType === 'whitespace' && acceptedType === 'whitespace')
  //     acceptedType = getCharType(prevChar)

  //   if (acceptedType !== getCharType(prevChar))
  //     return { position, includesWhitespace: acceptedType === 'whitespace' }
  // }

  return { position: null, includesWhitespace: false }
}

export const selectAroundWord = () => {
  updateSelections((selection, editor) => {
    const doc = editor.document

    const offset = doc.offsetAt(selection.active)

    const charAtCursor = charAt(editor, selection.active)

    let originalCharType: CharType = getCharType(charAtCursor)

    if (selection.isEmpty && selection.active.isBefore(selection.anchor)) {
      const { position } = searchLeftIntoWhitespace(
        doc,
        offset,
        originalCharType
      )

      return new vscode.Selection(
        selection.anchor,
        position ?? selection.active
      )
    }

    const { position, includesWhitespace } = searchRightIntoWhitespace(
      doc,
      offset,
      originalCharType
    )

    const { position: anchorPosition } = includesWhitespace
      ? searchLeft(doc, offset, originalCharType)
      : searchLeftIntoWhitespace(doc, offset, originalCharType)

    return new vscode.Selection(
      anchorPosition ?? selection.anchor,
      position ?? selection.active
    )
  })
}
