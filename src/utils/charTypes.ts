export const isWord = (char: string) => /\w/.test(char)
export const isPunctuation = (char: string) => /[^\w\s]/.test(char)
export const isWhitespace = (char: string) => /\s/.test(char)
export const isNewLine = (char: string) => /\n/.test(char)
export const isEOF = (char: string) => typeof char === 'undefined'
export const getCharType = (char: string) => {
  if (isWord(char)) return 'word'
  if (isWhitespace(char)) return 'whitespace'
  if (isNewLine(char)) return 'newline'
  if (isPunctuation(char)) return 'punctuation'
  return 'eof'
}

export type CharType = ReturnType<typeof getCharType>
