import { endOfWordRight, startOfWordLeft } from '../parsing/boundaries'
import { isEmpty } from '../selections/selections'
import { cursorTo } from './cursorTo'

export const selectInsideWord = () => {
  cursorTo(
    ({ doc, offset, selection }) => {
      const start = startOfWordLeft({
        doc,
        offset,
        selection,
        startUnderCursor: true,
      })
      const end = endOfWordRight({ doc, offset, startUnderCursor: true })

      if (!isEmpty(selection)) return selection.isReversed ? start : end

      if (!start || !end) return null

      return [start, end] as const
    },
    { select: true }
  )
}
