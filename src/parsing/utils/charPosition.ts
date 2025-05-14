import vscode from 'vscode'
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

  furthestEdge(position: vscode.Position) {
    return this.left.isBefore(position) ? this.left : this.right
  }

  selectFrom(selection: vscode.Selection) {
    const { anchor } = selection

    return new vscode.Selection(anchor, this.furthestEdge(anchor))
  }
}
