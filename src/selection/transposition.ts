import { Selection } from 'vscode';
import { fromVSCodeSelection, toVSCodeSelection } from '../cmds/edit';
import { editor } from '../helpers';
import { computed } from '../store';

export function prepareCursors(): void {
  const cursors = editor().selections.map(fromVSCodeSelection);

  computed.cursors = cursors;
}

export function transposeCursors(): void {
  const updatedCursors = computed.cursors;

  const selections: Selection[] = updatedCursors.map(toVSCodeSelection);

  editor().selections = selections;

  editor().revealRange(editor().selections[0]);
}
