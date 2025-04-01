import vscode from 'vscode'
import { config } from '../config'
// import { nearestMatch } from '../matchers/nearestMatch'
// import { updateSelections } from './updateSelections'

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

// export const highlightMatch = (str: string, direction: 'left' | 'right') => {
//   const decorations: vscode.TextEditorDecorationType[] = []
//   updateSelections((selection) => {
//     if (!vscode.window.activeTextEditor) return null

//     const match = nearestMatch(str, selection.active, direction, false)

//     if (!match) return null

//     const decoration = vscode.window.createTextEditorDecorationType({
//       backgroundColor: config().get('selectionHighlightBackgroundColor'),
//       color: config().get('selectionHighlightForegroundColor'),
//     })

//     vscode.window.activeTextEditor.setDecorations(decoration, [
//       new vscode.Range(
//         match,
//         match.with({ character: match.character + str.length })
//       ),
//     ])

//     decorations.push(decoration)

//     return null
//   })

//   return () => {
//     for (const decoration of decorations) decoration.dispose()
//   }
// }
