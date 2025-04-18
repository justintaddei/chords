import { debug } from './debug'

export const isWord = (char: string) => /\w/.test(char)
export const isPunctuation = (char: string) => /[^\w\s]/.test(char)
export const isWhitespace = (char: string) => /\s/.test(char)
export const isNewLine = (char: string) => /\n/.test(char)
export const isEOF = (char: string | undefined) => typeof char === 'undefined'
export const getCharType = (char: string) => {
  if (isEOF(char)) return 'eof'
  if (isNewLine(char)) return 'newline'
  if (isWord(char)) return 'word'
  if (isWhitespace(char)) return 'whitespace'
  if (isPunctuation(char)) return 'punctuation'

  debug(`Unknown character type for "${char}"`)
  return 'word'
}

export type CharType = ReturnType<typeof getCharType>
