export const isBracketPair = (left: string, right: string) => {
  const pairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>',
  }

  return left in pairs && pairs[left as keyof typeof pairs] === right
}

export const isQuotePair = (left: string, right: string) =>
  left === right && ['"', "'", '`'].includes(left)
