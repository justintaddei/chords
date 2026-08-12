import { Cursor } from '../globals';
import { computed } from '../store';
import { NormalState } from './normal_defs';
import { OP } from './ops_defs';

const OPF_LINES = 1; // operator works on lines
const OPF_CHANGE = 2; // operator changes text

/// The names of operators.
/// IMPORTANT: Index must correspond with defines in ops_defs.ts!!!
/// The third field indicates whether the operator always works on lines.
export const opchars = [
  [null, null, 0], // OP.NOP
  ['d', null, OPF_CHANGE], // OP.DELETE
  ['y', null, 0], // OP.YANK
  ['c', null, OPF_CHANGE], // OP.CHANGE
  ['<', null, OPF_LINES | OPF_CHANGE], // OP.LSHIFT
  ['>', null, OPF_LINES | OPF_CHANGE], // OP.RSHIFT
  ['!', null, OPF_LINES | OPF_CHANGE], // OP.FILTER
  ['g', '~', OPF_CHANGE], // OP.TILDE
  ['=', null, OPF_LINES | OPF_CHANGE], // OP.INDENT
  ['g', 'q', OPF_LINES | OPF_CHANGE], // OP.FORMAT
  [':', null, OPF_LINES], // OP.COLON
  ['g', 'U', OPF_CHANGE], // OP.UPPER
  ['g', 'u', OPF_CHANGE], // OP.LOWER
  ['J', null, OPF_LINES | OPF_CHANGE], // OP.DO_JOIN
  ['g', 'J', OPF_LINES | OPF_CHANGE], // OP.DO_JOIN_NS
  ['g', '?', OPF_CHANGE], // OP.ROT13
  ['r', null, OPF_CHANGE], // OP.REPLACE
  ['I', null, OPF_CHANGE], // OP.INSERT
  ['A', null, OPF_CHANGE], // OP.APPEND
  ['z', 'f', 0], // OP.FOLD
  ['z', 'o', OPF_LINES], // OP.FOLDOPEN
  ['z', 'O', OPF_LINES], // OP.FOLDOPENREC
  ['z', 'c', OPF_LINES], // OP.FOLDCLOSE
  ['z', 'C', OPF_LINES], // OP.FOLDCLOSEREC
  ['z', 'd', OPF_LINES], // OP.FOLDDEL
  ['z', 'D', OPF_LINES], // OP.FOLDDELREC
  ['g', 'w', OPF_LINES | OPF_CHANGE], // OP.FORMAT2
  ['g', '@', OPF_CHANGE], // OP.FUNCTION
  ['<C-a>', null, OPF_CHANGE], // OP.NR_ADD
  ['<C-x>', null, OPF_CHANGE], // OP.NR_SUB
] as const;

export function get_op_type(char1: string, char2: string) {
  if (char1 === 'r') {
    // ignore second character
    return OP.REPLACE;
  }
  if (char1 === '~') {
    // when tilde is an operator
    return OP.TILDE;
  }
  if (char1 === 'g' && char2 === '<C-a>') {
    // add
    return OP.NR_ADD;
  }
  if (char1 === 'g' && char2 === '<C-x>') {
    // subtract
    return OP.NR_SUB;
  }
  if (char1 === 'z' && char2 === 'y') {
    // OP_YANK
    return OP.YANK;
  }

  const i = opchars.findIndex(
    (op) =>
      op[0] === char1 &&
      (op[1] === char2 || /* char2 === null */ (!op[1] && !char2)),
  );

  if (i === -1) throw Error(`Cannot get_op_type() for "${char1}""${char2}"`);

  return i;
}

/**
 *
 * @param op the index of an operator in `opchars[]`
 * @returns true if operator "op" changes text.
 */
export function op_is_change(op: number) {
  return opchars[op][2] & OPF_CHANGE;
}

export function do_pending_operator(
  ca: NormalState['cmdArgs'],
  old_col: number,
  gui_yank: boolean,
) {
  const old_cursors: Cursor[] = computed.cursors;

  
}
