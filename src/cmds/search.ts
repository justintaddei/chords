import { FAIL, OK, RESULT } from '../globals';
import { walkLine } from '../parsing/walk';
import { move } from '../selection/mutate';
import { get, set } from '../store';
import { Direction } from '../globals';
import { NormalState } from './normal_defs';

/**
 * Search for a character in a line.
 *
 * If `t_cmd` is false, move to the position of the character; otherwise move to just before the character.
 * Repeat the search according to the command count (cap->count1).
 *
 * @param cmdArgs - Command arguments (contains the target character and count information).
 * @param t_cmd - When true, position just before the found character; when false, position on the character.
 * @returns OK if the search succeeded, or FAIL if it did not.
 */
export function searchc(
  cmdArgs: NormalState['cmdArgs'],
  t_cmd: boolean,
): RESULT {
  let char = cmdArgs.nextChar;
  let dir = cmdArgs.arg as Direction;
  let count = cmdArgs.count1;

  if (char) {
    // Normal search: remember args for repeat
    set('csearch_lastc', char);
    set('csearch_lastcdir', dir);
    set('csearch_until', t_cmd);
  } else {
    // repeat previous search
    char = get('csearch_lastc');
    dir = dir
      ? (-get('csearch_lastcdir') as Direction)
      : get('csearch_lastcdir');
    t_cmd = get('csearch_until');
  }

  cmdArgs.opArgs.inclusive = dir !== Direction.BACKWARD;

  while (count--) {
    const foundChar = move((cursor) => {
      for (const { chars, location } of walkLine({
        cursor,
        kernel: [0, 1],
        dir,
      })) {
        console.log('chars[1] :>>', chars[1]);
        if (chars[1] !== char) continue;

        // This is opposite of neovim's behavior
        // because the way I've chose to iterate over
        // text is different.
        if (!t_cmd) location.char += dir;

        return location;
      }

      return FAIL;
    });

    if (foundChar === FAIL) return FAIL;
  }

  return OK;
}
