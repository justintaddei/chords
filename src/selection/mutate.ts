import vscode from 'vscode';
import { Cursor } from './Cursor';
import { get, set } from '../store';

export function mutateCursors(mutator: (cursor: Cursor) => Cursor | false): boolean {
  const cursors = get('cursors');

  const updatedCursors: Cursor[] = [];

  for (const cursor of cursors) {
    const updatedCursor = mutator(cursor);

    updatedCursor ? updatedCursors.push(updatedCursor) : updatedCursors.push(cursor);
  }

  if (updatedCursors.every((cursor, i) => cursor === cursors[i])) return false;

  set('cursors', updatedCursors);

  return true;
}