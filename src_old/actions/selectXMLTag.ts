import vscode from 'vscode'
import { getTags } from '../matchers/xmlTags'
import { updateSelections } from '../utils/updateSelections'

function arrayFindLast<T>(arr: T[], p: (item: T) => boolean): T | undefined {
  const filtered = arr.filter(p)

  if (filtered.length === 0) return

  return filtered[filtered.length - 1]
}

export const selectXMLTag = (inside = false) => {
  updateSelections((selection, editor) => {
    const document = editor.document
    const tags = getTags(document)

    if (inside) {
      const closestTag = arrayFindLast(tags, (tag) => {
        // Self-closing tags have no inside
        if (!tag.closing) return false

        return (
          selection.active.isAfterOrEqual(tag.opening.start) &&
          selection.active.isBeforeOrEqual(tag.closing.end)
        )
      })

      if (!closestTag) return null
      if (!closestTag.closing) return null

      return new vscode.Selection(
        closestTag.opening.end.with({
          character: closestTag.opening.end.character + 1,
        }),
        closestTag.closing.start
      )
    }

    const closestTag = arrayFindLast(tags, (tag) => {
      const afterStart = selection.active.isAfterOrEqual(tag.opening.start)

      if (!afterStart) return false

      return selection.active.isBeforeOrEqual(
        tag.closing?.end ?? tag.opening.end
      )
    })

    if (!closestTag) return null

    return new vscode.Selection(
      closestTag.opening.start,
      closestTag.closing?.end.with({
        character: closestTag.closing.end.character + 1,
      }) ??
        closestTag.opening.end.with({
          character: closestTag.opening.end.character + 1,
        })
    )
  })
}
