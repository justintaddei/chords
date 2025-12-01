import vscode from 'vscode';
import { get, set } from '../store';
import { Cursor } from './Cursor';
import { debug } from '../utils/debug';

export function prepareCursors(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const cursors = editor.selections.map(Cursor.fromVSCodeSelection)

  const previousCursors = get('cursors');

  if (!Cursor.match(previousCursors, cursors)) {
    debug('Updating Vim cursors because they don\'t match the actual editor selections');
    set('cursors', cursors);
  } else {
    debug('Vim cursors match the actual editor selections; no update needed');
  }
}

export function transposeCursors(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const cursors = get('cursors');

  editor.selections = cursors.map(cursor => cursor.toVsCodeSelection());

  editor.revealRange(editor.selections[0]);
}