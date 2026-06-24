import { Cursor, FAIL, RESULT } from '../globals';
import { document } from '../helpers';
import { move } from '../selection/mutate';
import { computed } from '../store';
import { clamp } from './edit';

export function coladvance(): RESULT {
  const cols = computed.curswant;

  return move((cursor, i) => {
    if (i >= cols.length) return FAIL;

    return validateCursor(cursor.line, cols[i]);
  });
}

// Not neovim related
export const validateCursor = (line: number, char: number): Cursor => {
  const doc = document();
  const maxLine = doc.lineCount - 1;
  const clampedLine = clamp(line, 0, maxLine);
  const lineLength = Math.max(0, doc.lineAt(clampedLine).text.length - 1);

  return {
    line: clampedLine,
    char: clamp(char, 0, lineLength),
  };
};

export function get_cursor_pos_lengths() {
  return computed.cursors.map(
    (cursor) => document().lineAt(cursor.line).text.length - cursor.char,
  );
}
