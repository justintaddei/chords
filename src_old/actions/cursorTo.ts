import vscode from 'vscode'
import { nearestMatch } from '../matchers/nearestMatch'
import { showWarning } from '../ui/statusBar'
import { updateSelections } from '../utils/updateSelections'

type Options = {
  direction: 'left' | 'right'
  select?: boolean
  inclusive?: boolean
  acceptUnderCursor?: boolean
} & (
  | {
      text: string
      endOfMatch?: boolean
    }
  | {
      text: RegExp
      endOfMatch?: false
    }
)

export const cursorTo = ({
  text,
  direction,
  select = false,
  inclusive = select,
  acceptUnderCursor = false,
  endOfMatch = false,
}: Options) => {
  const matchFound = updateSelections((selection) => {
    const match = nearestMatch(
      text,
      selection.active,
      direction,
      inclusive,
      acceptUnderCursor
    )

    if (!match) return null

    const updatedSelection =
      endOfMatch && !(text instanceof RegExp)
        ? match.with({ character: match.character + text.length })
        : match

    return select
      ? new vscode.Selection(selection.anchor, updatedSelection)
      : new vscode.Selection(updatedSelection, updatedSelection)
  })

  if (!matchFound) showWarning('(no match found)')

  return matchFound
}
