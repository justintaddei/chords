import { cursorTo } from './cursorTo'

const WORD_START_REGEX = /\s\S|\w[^\w\s]|[^\w\s]\w/
const WORD_END_REGEX = /\S\s|[^\w\s]\w|\w[^\w\s]/

export const startOfWordRight = async () =>
  cursorTo({
    text: WORD_START_REGEX,
    direction: 'right',
    inclusive: true,
    acceptUnderCursor: true,
  })

export const endOfWordRight = async () =>
  cursorTo({
    text: WORD_END_REGEX,
    direction: 'right',
  })

export const startOfWordRightSelect = async () =>
  cursorTo({
    text: WORD_START_REGEX,
    direction: 'right',
    select: true,
    inclusive: true,
    acceptUnderCursor: true,
  })

export const endOfWordRightSelect = async () =>
  cursorTo({
    text: WORD_END_REGEX,
    direction: 'right',
    select: true,
  })

export const startOfWordLeft = async () =>
  cursorTo({
    text: WORD_START_REGEX,
    direction: 'left',
    inclusive: true,
  })

export const endOfWordLeft = async () =>
  cursorTo({
    text: WORD_END_REGEX,
    direction: 'left',
    acceptUnderCursor: true,
  })

export const startOfWordLeftSelect = async () =>
  cursorTo({
    text: WORD_START_REGEX,
    direction: 'left',
    select: true,
    inclusive: true,
  })

export const endOfWordLeftSelect = async () =>
  cursorTo({
    text: WORD_END_REGEX,
    direction: 'left',
    select: true,
    inclusive: false,
    acceptUnderCursor: true,
  })
