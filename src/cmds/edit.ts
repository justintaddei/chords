import vscode from 'vscode';
import { Cursor, FAIL, RESULT } from '../globals';
import { document } from '../helpers';
import { move } from '../selection/mutate';
import { computed, set } from '../store';

const clamp = (num: number, min: number, max: number): number => {
  return Math.max(min, Math.min(num, max));
};

export const cursorEquals = (a: Cursor, b: Cursor): boolean => {
  return a.line === b.line && a.char === b.char;
};

const validateCursor = (line: number, char: number): Cursor => {
  const doc = document();
  const maxLine = doc.lineCount - 1;
  const clampedLine = clamp(line, 0, maxLine);
  const lineLength = Math.max(0, doc.lineAt(clampedLine).text.length - 1);

  return {
    line: clampedLine,
    char: clamp(char, 0, lineLength),
  };
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

export const toVSCodeSelection = (cursor: Cursor): vscode.Selection => {
  const position = new vscode.Position(cursor.line, cursor.char);
  return new vscode.Selection(position, position);
};

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

export function oneUp(): RESULT {
  const curswant = computed.curswant;
  return move((cursor, i) => {
    return validateCursor(cursor.line - 1, curswant[i] ?? cursor.char);
  });
}

export function oneDown(): RESULT {
  const curswant = computed.curswant;
  return move((cursor, i) => {
    return validateCursor(cursor.line + 1, curswant[i] ?? cursor.char);
  });
}
