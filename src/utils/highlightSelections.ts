import vscode from 'vscode'
import { config } from '../config'

export const highlightSelections = () => {
  if (!vscode.window.activeTextEditor) return

  const decoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: config().get('selectionHighlightBackgroundColor'),
    color: config().get('selectionHighlightForegroundColor'),
  })

  vscode.window.activeTextEditor.setDecorations(
    decoration,
    vscode.window.activeTextEditor.selections
  )

  setTimeout(
    () => decoration.dispose(),
    config().get('selectionHighlightDuration')
  )
}
