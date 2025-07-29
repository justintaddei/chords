import { endOfWordRight, startOfWordLeft } from '../motions'
import { isEmpty } from '../selections/selections'
import { moveTo } from './cursorTo'

export const selectInsideWord = () => {
  moveTo(
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
