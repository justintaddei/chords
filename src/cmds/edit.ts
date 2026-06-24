import vscode from 'vscode';
import { Cursor, FAIL, RESULT } from '../globals';
import { document } from '../helpers';
import { move } from '../selection/mutate';
import { computed, set } from '../store';
import { BL_SOL, BL_WHITE } from './normal';
import { coladvance, validateCursor } from './cursor';

export const clamp = (num: number, min: number, max: number): number => {
  return Math.max(min, Math.min(num, max));
};

export const cursorEquals = (a: Cursor, b: Cursor): boolean => {
  return a.line === b.line && a.char === b.char;
};

export const cursorsMatch = (a: Cursor[], b: Cursor[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((cursor, i) => cursorEquals(cursor, b[i]));
};

export const fromVSCodeSelection = (selection: vscode.Selection): Cursor => {
  const line = selection.active.line;
  const char = selection.active.character;

  return {
    line,
    char,
  };
};

export function toVSCodeSelection(
  anchor: Cursor,
  active: Cursor,
): vscode.Selection;
export function toVSCodeSelection(cursor: Cursor): vscode.Selection;
export function toVSCodeSelection(
  start: Cursor,
  end?: Cursor,
): vscode.Selection {
  const anchor = new vscode.Position(start.line, start.char);
  const active = end ? new vscode.Position(end.line, end.char) : anchor;
  return new vscode.Selection(anchor, active);
}

export function oneLeft(): RESULT {
  set('set_curswant', true);

  return move((cursor) => {
    if (cursor.char === 0) return FAIL;

    return validateCursor(cursor.line, cursor.char - 1);
  });
}

export function oneRight(): RESULT {
  set('set_curswant', true);

  return move((cursor) => {
    return validateCursor(cursor.line, cursor.char + 1);
  });
}

export function cursor_up(n: number): RESULT {
  const curswant = computed.curswant;

  return move((cursor, i) => {
    if (n > 0 && cursor.line <= 1) return FAIL;

    // in neovim they call cursor_up_inner to handle folded regions, etc.
    // neovim also calls `coladvance` after to cursor is moved. I'm using validateCursor
    // to do the same thing.
    return validateCursor(cursor.line - n, curswant[i] ?? cursor.char);
  });
}

export function cursor_down(n: number): RESULT {
  const curswant = computed.curswant;

  return move((cursor, i) => {
    if (n > 0 && cursor.line >= document().lineCount - 1) return FAIL;

    // in neovim they call cursor_down_inner to handle folded regions, etc.
    // neovim also calls `coladvance` after to cursor is moved. I'm using validateCursor
    // to do the same thing.
    return validateCursor(cursor.line + n, curswant[i] ?? cursor.char);
  });
}

/**
 * move cursor to start of line
 * if flags & BL_WHITE  move to first non-white
 * if flags & BL_SOL    move to first non-white if startofline is set,
 *                          otherwise keep "curswant" column
 */
export function beginline(flags: number) {
  if (flags & BL_SOL) {
    return coladvance();
  }

  set('set_curswant', true);

  return move((cursor) => {
    return validateCursor(
      cursor.line,
      flags & BL_WHITE
        ? document().lineAt(cursor.line).firstNonWhitespaceCharacterIndex
        : 0,
    );
  });
}
