import vscode from 'vscode'

const kernelSlice = (chars: string[], start: number, end: number) => {
  const charsInKernel = []

  for (let i = start; i < end; i++) charsInKernel.push(chars[i])

  return charsInKernel
}

export const walkRight = function* (
  doc: vscode.TextDocument,
  offset: number,
  kernel: [number, number]
) {
  const text = doc
    .getText(
      new vscode.Range(
        doc.positionAt(offset - kernel[0]),
        doc.lineAt(doc.lineCount - 1).range.end
      )
    )
    .split('')

  for (let i = kernel[0]; i < text.length; i++) {
    const chars = kernelSlice(text, i - kernel[0], i + kernel[1] + 1)

    yield { chars, position: doc.positionAt(offset + i - kernel[0]) }
  }
}

export const walkLeft = function* (
  doc: vscode.TextDocument,
  offset: number,
  kernel: [number, number],
  selection: vscode.Selection
) {
  const nudge = !selection.isEmpty && !selection.isReversed ? -1 : 0
  const blockCursorCorrectedOffset = offset + nudge

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
