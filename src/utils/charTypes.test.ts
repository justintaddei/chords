import * as assert from 'node:assert'
import {
  getCharType,
  isEOF,
  isNewLine,
  isPunctuation,
  isWhitespace,
  isWord,
} from './charTypes'

suite('charTypes', () => {
  suite('isWord', () => {
    test('should return true for alphanumeric characters', () => {
      assert.strictEqual(isWord('a'), true)
      assert.strictEqual(isWord('Z'), true)
      assert.strictEqual(isWord('1'), true)
    })

    test('should return false for non-alphanumeric characters', () => {
      assert.strictEqual(isWord(' '), false)
      assert.strictEqual(isWord('.'), false)
      assert.strictEqual(isWord('\n'), false)
    })
  })

  suite('isPunctuation', () => {
    test('should return true for punctuation characters', () => {
      assert.strictEqual(isPunctuation('.'), true)
      assert.strictEqual(isPunctuation(','), true)
      assert.strictEqual(isPunctuation('!'), true)
    })

    test('should return false for non-punctuation characters', () => {
      assert.strictEqual(isPunctuation('a'), false)
      assert.strictEqual(isPunctuation(' '), false)
      assert.strictEqual(isPunctuation('\n'), false)
    })
  })

  suite('isWhitespace', () => {
    test('should return true for whitespace characters', () => {
      assert.strictEqual(isWhitespace(' '), true)
      assert.strictEqual(isWhitespace('\t'), true)
    })

    test('should return false for non-whitespace characters', () => {
      assert.strictEqual(isWhitespace('a'), false)
      assert.strictEqual(isWhitespace('.'), false)
    })
  })

  suite('isNewLine', () => {
    test('should return true for newline characters', () => {
      assert.strictEqual(isNewLine('\n'), true)
    })

    test('should return false for non-newline characters', () => {
      assert.strictEqual(isNewLine('a'), false)
      assert.strictEqual(isNewLine(' '), false)
    })
  })

  suite('isEOF', () => {
    test('should return true for undefined', () => {
      assert.strictEqual(isEOF(undefined), true)
    })

    test('should return false for defined values', () => {
      assert.strictEqual(isEOF('a'), false)
      assert.strictEqual(isEOF(''), false)
    })
  })

  suite('getCharType', () => {
    test('should return "word" for alphanumeric characters', () => {
      assert.strictEqual(getCharType('a'), 'word')
      assert.strictEqual(getCharType('1'), 'word')
    })

    test('should return "whitespace" for whitespace characters', () => {
      assert.strictEqual(getCharType(' '), 'whitespace')
      assert.strictEqual(getCharType('\t'), 'whitespace')
    })

    test('should return "newline" for newline characters', () => {
      assert.strictEqual(getCharType('\n'), 'newline')
    })

    test('should return "punctuation" for punctuation characters', () => {
      assert.strictEqual(getCharType('.'), 'punctuation')
      assert.strictEqual(getCharType(','), 'punctuation')
    })

    test('should return "eof" for undefined', () => {
      assert.strictEqual(getCharType(undefined as unknown as string), 'eof')
    })
  })
})
