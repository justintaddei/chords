import vscode from 'vscode'
import { updateSelections } from '../utils/updateSelections'

export const collapseSelections = (
  direction: 'start' | 'end' | 'anchor' | 'active'
) => {
  updateSelections((selection) => {
    return new vscode.Selection(selection[direction], selection[direction])
  })
}
