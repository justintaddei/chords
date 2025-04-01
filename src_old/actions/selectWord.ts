import { cursorTo } from './cursorTo'

const OUTSIDE_BOUNDARY_LEFT_REGEX = /\n|\S\s|[^\w\s]\w|\w[^\w\s]/
const OUTSIDE_BOUNDARY_RIGHT_REGEX = /\S\s|[^\w\s]\w|\w[^\w\s]/

export const selectAroundWord = () => {
  cursorTo({
    text: OUTSIDE_BOUNDARY_RIGHT_REGEX,
    direction: 'right',
    inclusive: true,
    acceptUnderCursor: true,
  })
  cursorTo({
    text: OUTSIDE_BOUNDARY_LEFT_REGEX,
    direction: 'left',
    select: true,
    acceptUnderCursor: true,
  })
}

const INSIDE_BOUNDARY_REGEX = /\s\S|\S\s|[^\w\s]\w|\w[^\w\s]/

export const selectInsideWord = () => {
  cursorTo({
    text: INSIDE_BOUNDARY_REGEX,
    direction: 'right',
    inclusive: true,
    acceptUnderCursor: true,
  })
  cursorTo({
    text: INSIDE_BOUNDARY_REGEX,
    direction: 'left',
    select: true,
    acceptUnderCursor: true,
  })
}
