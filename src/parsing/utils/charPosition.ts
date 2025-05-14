import vscode from 'vscode'
import { highlightSelections } from '../../actions/highlight'
import { safeTranslate } from '../../selections/utils/safeTranslate'

export class CharPosition {
  left: vscode.Position
  right: vscode.Position

  constructor(position: vscode.Position, editor?: vscode.TextEditor) {
    this.left = position
    this.right = safeTranslate(position, 0, 1, editor)
  }

  get line() {
    return this.left.line
  }

  get cursor() {
    return new vscode.Selection(this.left, this.left)
  }

  get selection() {
    return new vscode.Selection(this.left, this.right)
  }

  isEqual(position: CharPosition) {
    return (
      this.left.isEqual(position.left) && this.right.isEqual(position.right)
    )
  }

  furthestEdge(position: vscode.Position) {
    return this.left.isBefore(position) ? this.left : this.right
  }

  selectFrom(selection: vscode.Selection | CharPosition) {
    if (selection instanceof CharPosition) {
      if (this.isEqual(selection)) return this.selection

      const anchor = selection.furthestEdge(this.left)
      const active = this.furthestEdge(selection.left)

      return new vscode.Selection(anchor, active)
    }

    const { anchor } = selection

    return new vscode.Selection(anchor, this.furthestEdge(anchor))
  }

  highlight() {
    highlightSelections([new vscode.Selection(this.left, this.right)], 3000)
  }
}
