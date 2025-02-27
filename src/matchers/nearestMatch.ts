import vscode from 'vscode'

function regexIndexOf(str: string, regex: RegExp, startIdx?: number) {
  const indexOf = str.substring(startIdx ?? 0).search(regex)
  return indexOf >= 0 ? indexOf + (startIdx ?? 0) : indexOf
}

function regexLastIndexOf(str: string, regex: RegExp, endPos?: number) {
  let activeIdx = -1
  let lastMatchIdx = -1

  while (true) {
    const matchIdx = str.substring(activeIdx + 1).search(regex)

    if (matchIdx < 0) break

    activeIdx = matchIdx + activeIdx + 1

    if (!endPos || activeIdx >= endPos) break

    lastMatchIdx = activeIdx
  }

  return lastMatchIdx
}

export const nearestMatch = (
  str: string | RegExp,
  position: vscode.Position,
  direction: 'left' | 'right',
  inclusive = false,
  acceptUnderCursor = false
) => {
  if (!vscode.window.activeTextEditor) return null

  const editor = vscode.window.activeTextEditor
  const startIndex = editor.document.offsetAt(position)
  const text = editor.document.getText()

  let index: number

  const initialOffset = acceptUnderCursor ? 0 : 1

  if (direction === 'left')
    index =
      str instanceof RegExp
        ? regexLastIndexOf(text, str, startIndex - 1)
        : text.lastIndexOf(str, startIndex - initialOffset)
  else
    index =
      str instanceof RegExp
        ? regexIndexOf(text, str, startIndex + initialOffset)
        : text.indexOf(str, startIndex + initialOffset)

  if (index === -1) return null

  let offset: number

  if (str instanceof RegExp) offset = 1
  else offset = direction === 'left' ? -1 : 1

  return editor.document.positionAt(index + (inclusive ? offset : 0))
}
