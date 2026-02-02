import { cursorsMatch } from '../cmds/edit';
import { Cursor } from '../globals';
import { FAIL, OK, RESULT } from '../globals';
import { computed } from '../store';

export function move(
  mutator: (
    cursor: Cursor,
    index: number,
    cursorCount: number,
  ) => Cursor | FAIL,
): RESULT {
  const cursors = computed.cursors;

  const updatedCursors: Cursor[] = [];

  for (let i = 0; i < cursors.length; i++) {
    const cursor = cursors[i];
    const updatedCursor = mutator(cursor, i, cursors.length);

    if (updatedCursor === FAIL) return FAIL;

    updatedCursor
      ? updatedCursors.push(updatedCursor)
      : updatedCursors.push(cursor);
  }

  if (cursorsMatch(cursors, updatedCursors)) return FAIL;

  computed.cursors = updatedCursors;

  return OK;
}
