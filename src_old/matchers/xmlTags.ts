// based on https://github.com/jpotterm/vscode-simple-vim/blob/520356a51f75a4b1e55d55717624fdbe8296594d/src/tag_utils.ts
import * as vscode from 'vscode'

type SimpleRange = {
  start: number
  end: number
}

type PartialTagOpening = {
  kind: 'opening'
  name: string
  range: SimpleRange
}

type PartialTagClosing = {
  kind: 'closing'
  name: string
  range: SimpleRange
}

type PartialTagSelfClosing = {
  kind: 'self_closing'
  name: string
  range: SimpleRange
}

type PartialTag = PartialTagOpening | PartialTagClosing | PartialTagSelfClosing

type OffsetTag = {
  name: string
  opening: SimpleRange
  closing?: SimpleRange // Doesn't exist for self-closing tags
}

type PositionTag = {
  name: string
  opening: vscode.Range
  closing?: vscode.Range // Doesn't exist for self-closing tags
}

const OPEN_SLASH_GROUP = 1
const TAG_NAME_GROUP = 2
const CLOSE_SLASH_GROUP = 3

export function getTags(document: vscode.TextDocument): PositionTag[] {
  return positionTags(document, matchTags(getPartialTags(document.getText())))
}

function positionTags(
  document: vscode.TextDocument,
  offsetTags: OffsetTag[]
): PositionTag[] {
  return offsetTags.map((tag) => {
    const openingRange = new vscode.Range(
      document.positionAt(tag.opening.start),
      document.positionAt(tag.opening.end)
    )

    if (tag.closing) {
      return {
        name: tag.name,
        opening: openingRange,
        closing: new vscode.Range(
          document.positionAt(tag.closing.start),
          document.positionAt(tag.closing.end)
        ),
      }
    }

    return {
      name: tag.name,
      opening: openingRange,
    }
  })
}

function matchTags(partialTags: PartialTag[]): OffsetTag[] {
  const tags: OffsetTag[] = []
  const openingStack: PartialTagOpening[] = []

  for (const partialTag of partialTags) {
    if (partialTag.kind === 'opening') {
      openingStack.push(partialTag)
    } else if (partialTag.kind === 'self_closing') {
      tags.push({
        name: partialTag.name,
        opening: partialTag.range,
      })
    } else if (partialTag.kind === 'closing') {
      let stackTag = openingStack.pop()

      while (stackTag) {
        if (stackTag.name === partialTag.name) {
          tags.push({
            name: stackTag.name,
            opening: stackTag.range,
            closing: partialTag.range,
          })

          break
        }
        // Treat unclosed tags as self-closing because that's often the case in HTML
        tags.push({
          name: stackTag.name,
          opening: stackTag.range,
        })

        stackTag = openingStack.pop()
      }
    }
  }

  return tags.sort((a, b) => a.opening.start - b.opening.start)
}

/**
 * todo: generates incorrect ranges in jsx when an attribute has an arrow function.
 * @example ```jsx
 * <button onClick={() => console.log('clicked')}>Click me</button>
 * ```
 */
function getPartialTags(text: string): PartialTag[] {
  const regex = /\<(\/)?([^\>\<\s]+)[^\>\<]*?(\/?)\>/g
  const tagRanges: PartialTag[] = []
  let match = regex.exec(text)

  while (match) {
    const name = match[TAG_NAME_GROUP]
    const range = { start: match.index, end: regex.lastIndex - 1 }

    if (match[CLOSE_SLASH_GROUP]) {
      tagRanges.push({ kind: 'self_closing', name: name, range: range })
    } else if (match[OPEN_SLASH_GROUP]) {
      tagRanges.push({ kind: 'closing', name: name, range: range })
    } else {
      tagRanges.push({ kind: 'opening', name: name, range: range })
    }

    match = regex.exec(text)
  }

  return tagRanges
}
