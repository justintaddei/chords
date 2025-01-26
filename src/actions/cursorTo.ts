import vscode from 'vscode'
import { nearestMatch } from '../matchers/nearestMatch'
import { showWarning } from '../ui/statusBar'
import { updateSelections } from '../utils/updateSelections'

type Options = {
  text: string
  direction: 'left' | 'right'
  select?: boolean
  inclusive?: boolean
  acceptUnderCursor?: boolean
  endOfMatch?: boolean
}

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

    const updatedSelection = endOfMatch
      ? match.with({ character: match.character + text.length })
      : match

    return select
      ? new vscode.Selection(selection.anchor, updatedSelection)
      : new vscode.Selection(updatedSelection, updatedSelection)
  })

  if (!matchFound) showWarning('(no match found)')

  return matchFound
}
