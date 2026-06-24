import { Position, Selection } from 'vscode';
import { editor } from '../helpers';
import { toVSCodeSelection } from './edit';
import { move } from '../selection/mutate';
import { FAIL, OK } from '../globals';
import { validateCursor } from './cursor';

export function ins_text(
  text: string,
  mode: 'insert' | 'replace',
  undoStop = true,
) {
  let moved = FAIL;

  editor().edit(
    (editBuilder) => {
      if (mode === 'replace') {
        moved = move((cursor) => {
          const destination = validateCursor(
            cursor.line,
            cursor.char + text.length,
          );

          const range = toVSCodeSelection(cursor, destination);

          editBuilder.replace(range, text);

          return destination;
        });
      }
    },
    { undoStopAfter: true, undoStopBefore: true },
  );

  return moved;
}
