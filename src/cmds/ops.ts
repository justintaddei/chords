

const OPF_LINES = 1  // operator works on lines
const OPF_CHANGE = 2 // operator changes text

/// The names of operators.
/// IMPORTANT: Index must correspond with defines in ops_defs.ts!!!
/// The third field indicates whether the operator always works on lines.
export const opchars = [
  [null, null, 0],                     // OP.NOP
  ['d', null, OPF_CHANGE],             // OP.DELETE
  ['y', null, 0],                      // OP.YANK
  ['c', null, OPF_CHANGE],             // OP.CHANGE
  ['<', null, OPF_LINES | OPF_CHANGE], // OP.LSHIFT
  ['>', null, OPF_LINES | OPF_CHANGE], // OP.RSHIFT
  ['!', null, OPF_LINES | OPF_CHANGE], // OP.FILTER
  ['g', '~', OPF_CHANGE],              // OP.TILDE
  ['=', null, OPF_LINES | OPF_CHANGE], // OP.INDENT
  ['g', 'q', OPF_LINES | OPF_CHANGE],  // OP.FORMAT
  [':', null, OPF_LINES],              // OP.COLON
  ['g', 'U', OPF_CHANGE],              // OP.UPPER
  ['g', 'u', OPF_CHANGE],              // OP.LOWER
  ['J', null, OPF_LINES | OPF_CHANGE], // OP.DO_JOIN
  ['g', 'J', OPF_LINES | OPF_CHANGE],  // OP.DO_JOIN_NS
  ['g', '?', OPF_CHANGE],              // OP.ROT13
  ['r', null, OPF_CHANGE],             // OP.REPLACE
  ['I', null, OPF_CHANGE],             // OP.INSERT
  ['A', null, OPF_CHANGE],             // OP.APPEND
  ['z', 'f', 0],                       // OP.FOLD
  ['z', 'o', OPF_LINES],               // OP.FOLDOPEN
  ['z', 'O', OPF_LINES],               // OP.FOLDOPENREC
  ['z', 'c', OPF_LINES],               // OP.FOLDCLOSE
  ['z', 'C', OPF_LINES],               // OP.FOLDCLOSEREC
  ['z', 'd', OPF_LINES],               // OP.FOLDDEL
  ['z', 'D', OPF_LINES],               // OP.FOLDDELREC
  ['g', 'w', OPF_LINES | OPF_CHANGE],  // OP.FORMAT2
  ['g', '@', OPF_CHANGE],              // OP.FUNCTION
  ['<C-a>', null, OPF_CHANGE],         // OP.NR_ADD
  ['<C-x>', null, OPF_CHANGE],         // OP.NR_SUB
];