import vscode from 'vscode'

const kernelSlice = (chars: string[], start: number, end: number) => {
  const charsInKernel = []

  for (let i = start; i < end; i++) charsInKernel.push(chars[i])

  return charsInKernel
}

export const walkRight = function* ({
  doc,
  offset,
  kernel,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  kernel: [number, number]
  startUnderCursor?: boolean
}) {
  const nudge = startUnderCursor ? 0 : 1

  const text = doc
    .getText(
      new vscode.Range(
        doc.positionAt(offset + nudge - kernel[0]),
        doc.lineAt(doc.lineCount - 1).range.end
      )
    )
    .split('')

  for (let i = kernel[0]; i < text.length; i++) {
    const chars = kernelSlice(text, i - kernel[0], i + kernel[1] + 1)

    yield { chars, position: doc.positionAt(offset + nudge + i - kernel[0]) }
  }
}

export const walkLeft = function* ({
  doc,
  offset,
  kernel,
  selection,
  startUnderCursor = false,
}: {
  doc: vscode.TextDocument
  offset: number
  kernel: [number, number]
  selection: vscode.Selection
  startUnderCursor?: boolean
}) {
  const nudge = !selection.isEmpty && !selection.isReversed ? -1 : -0
  const cursorOffset = startUnderCursor ? 0 : -1
  const blockCursorCorrectedOffset = offset + nudge + cursorOffset

  const text = doc
    .getText(
      new vscode.Range(
        doc.positionAt(0),
        doc.positionAt(Math.max(0, blockCursorCorrectedOffset + kernel[1] + 1))
      )
    )
    .split('')

  for (let i = blockCursorCorrectedOffset; i >= 0; i--) {
    const chars = kernelSlice(text, i - kernel[0], i + kernel[1] + 1)

    yield { chars, position: doc.positionAt(i) }
  }
}
