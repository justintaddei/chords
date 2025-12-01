import { readNextChar } from "../input";
import { prepareCursors, transposeCursors } from "../selection/transposition";
import { get, reset, set } from "../store";
import { blink, showWarning } from "../ui/statusBar";
import { oneDown, oneLeft, oneRight, oneUp } from "./edit";
import { cmd_arg_T, cmd_T, MotionType, NormalState, nv_func_T } from "./normal_defs";
import { OP } from "./ops_defs";

// Directions
const FORWARD = 1;
const BACKWARD = -1;

// Values for cmd_flags.
const NV_NCH = 0x01 // may need to get a second char
const NV_NCH_NOP = 0x02 | NV_NCH // get second char when no operator pending
const NV_NCH_ALW = 0x04 | NV_NCH // always get a second char

const NV_RL = 0x80 // 'rightleft' modifies command
const NV_KEEPREG = 0x100 // don't clear regname
const BL_WHITE = 1
const BL_FIX = 2

const SEARCH_REV = 1

// This nv_cmd in the neovim codebase.
// I've defined it as an array of tuples here so that it
// looks the same as the C struct.
const nv_cmd_actual: [string, nv_func_T, number, cmd_arg_T][] = [
  [' ', nv_right, 0, 0],
  ['!', nv_operator, 0, 0],
  ['"', nv_regname, NV_NCH_NOP | NV_KEEPREG, 0],
  ['#', nv_ident, 0, 0],
  ['$', nv_dollar, 0, 0],
  ['%', nv_percent, 0, 0],
  ['&', nv_optrans, 0, 0],
  ['\'', nv_gomark, NV_NCH_ALW, true],
  ['(', nv_brace, 0, BACKWARD],
  [')', nv_brace, 0, FORWARD],
  ['*', nv_ident, 0, 0],
  ['+', nv_down, 0, true],
  [',', nv_csearch, 0, true],
  ['-', nv_up, 0, true],
  ['.', nv_dot, NV_KEEPREG, 0],
  ['/', nv_search, 0, false],
  ['0', nv_beginline, 0, 0],
  ['1', nv_ignore, 0, 0],
  ['2', nv_ignore, 0, 0],
  ['3', nv_ignore, 0, 0],
  ['4', nv_ignore, 0, 0],
  ['5', nv_ignore, 0, 0],
  ['6', nv_ignore, 0, 0],
  ['7', nv_ignore, 0, 0],
  ['8', nv_ignore, 0, 0],
  ['9', nv_ignore, 0, 0],
  [':', nv_colon, 0, 0],
  [';', nv_csearch, 0, false],
  ['<', nv_operator, NV_RL, 0],
  ['=', nv_operator, 0, 0],
  ['>', nv_operator, NV_RL, 0],
  ['?', nv_search, 0, false],
  ['@', nv_at, NV_NCH_NOP, false],
  ['A', nv_edit, 0, 0],
  ['B', nv_bck_word, 0, 1],
  ['C', nv_abbrev, NV_KEEPREG, 0],
  ['D', nv_abbrev, NV_KEEPREG, 0],
  ['E', nv_wordcmd, 0, true],
  ['F', nv_csearch, NV_NCH_ALW, BACKWARD],
  ['G', nv_goto, 0, true],
  ['H', nv_scroll, 0, 0],
  ['I', nv_edit, 0, 0],
  ['J', nv_join, 0, 0],
  ['K', nv_ident, 0, 0],
  ['L', nv_scroll, 0, 0],
  ['M', nv_scroll, 0, 0],
  ['N', nv_next, 0, SEARCH_REV],
  ['O', nv_open, 0, 0],
  ['P', nv_put, 0, 0],
  ['Q', nv_regreplay, 0, 0],
  ['R', nv_Replace, 0, false],
  ['S', nv_subst, NV_KEEPREG, 0],
  ['T', nv_csearch, NV_NCH_ALW, BACKWARD],
  ['U', nv_Undo, 0, 0],
  ['W', nv_wordcmd, 0, true],
  ['X', nv_abbrev, NV_KEEPREG, 0],
  ['Y', nv_abbrev, NV_KEEPREG, 0],
  ['Z', nv_Zet, NV_NCH_NOP, 0],
  ['[', nv_brackets, NV_NCH_ALW, BACKWARD],
  ['\\', nv_error, 0, 0],
  [']', nv_brackets, NV_NCH_ALW, FORWARD],
  ['^', nv_beginline, 0, BL_WHITE | BL_FIX],
  ['_', nv_lineop, 0, 0],
  ['`', nv_gomark, NV_NCH_ALW, false],
  ['a', nv_edit, NV_NCH, 0],
  ['b', nv_bck_word, 0, 0],
  ['c', nv_operator, 0, 0],
  ['d', nv_operator, 0, 0],
  ['e', nv_wordcmd, 0, false],
  ['f', nv_csearch, NV_NCH_ALW, FORWARD],
  ['g', nv_g_cmd, NV_NCH_ALW, false],
  ['h', nv_left, NV_RL, 0],
  ['i', nv_edit, NV_NCH, 0],
  ['j', nv_down, 0, false],
  ['k', nv_up, 0, false],
  ['l', nv_right, NV_RL, 0],
  ['m', nv_mark, NV_NCH_NOP, 0],
  ['n', nv_next, 0, 0],
  ['o', nv_open, 0, 0],
  ['p', nv_put, 0, 0],
  ['q', nv_record, NV_NCH, 0],
  ['r', nv_replace, NV_NCH_NOP, 0],
  ['s', nv_subst, NV_KEEPREG, 0],
  ['t', nv_csearch, NV_NCH_ALW, FORWARD],
  ['u', nv_undo, 0, 0],
  ['w', nv_wordcmd, 0, false],
  ['x', nv_abbrev, NV_KEEPREG, 0],
  ['y', nv_operator, 0, 0],
  ['z', nv_zet, NV_NCH_ALW, 0],
  ['{', nv_findpar, 0, BACKWARD],
  ['|', nv_pipe, 0, 0],
  ['}', nv_findpar, 0, FORWARD],
  ['~', nv_tilde, 0, 0],
] as const
// Neovim uses and nv_cmd_idx to map inputs to commands.
// I've opted just to use a Map instead.
const nv_cmd = new Map<string, cmd_T>(nv_cmd_actual.map(([cmd_char, cmd_func, cmd_flags, cmd_arg]) => {
  const cmd = { cmd_char, cmd_func, cmd_flags, cmd_arg } as const
  return [cmd_char, cmd]
}))

/**
 * Finds the command corresponding to the given character.
 *
 * @param char - The character to look up.
 * @returns The command object if found; otherwise, -1.
*/
function find_command(char: string): cmd_T | -1 {
  return nv_cmd.get(char) ?? -1
}

export async function normal_execute(key: string) {
  const state = get('vimState') as NormalState;

  state.command_finished = false;
  state.char = key;
  // old_col

  // TODO: neovim uses a loop here to handle
  // Ctrl-W commands. I'm not sure we'll need that.
  while (await normal_get_command_count(state)) { }

  if (state.cmdArgs.opCount !== 0) {
    // If we're in the middle of an operator (including after entering a
    // yank buffer with '"') AND we had a count before the operator, then
    // that count overrides the current value of ca.count0.
    // What this means effectively, is that commands like "3dw" get turned
    // into "d3w" which makes things fall into place pretty neatly.
    // If you give a count before AND after the operator, they are
    // multiplied.
    if (state.cmdArgs.count0) {
      if (state.cmdArgs.opCount >= 99999999 / state.cmdArgs.count0) {
        state.cmdArgs.count0 = 999999999;
      } else {
        state.cmdArgs.count0 *= state.cmdArgs.opCount;
      }
    } else {
      state.cmdArgs.count0 = state.cmdArgs.opCount;
    }
  }

  // Always remember the count.  It will be set to zero (on the next call,
  // above) when there is no pending operator.
  // When called from main(), save the count for use by the "count" built-in
  // variable.
  state.cmdArgs.opCount = state.cmdArgs.count0;
  state.cmdArgs.count1 = (state.cmdArgs.count0 === 0 ? 1 : state.cmdArgs.count0);

  state.cmdArgs.cmdChar = state.char;

  const cmd = find_command(state.char);

  if (cmd === -1) {
    clearOpNotify()
    return
  }

  state.cmd = cmd;

  if (normal_need_additional_char(state)) {
    await normal_get_additional_char(state);
  }

  if (state.cmdArgs.nextChar === '<escape>' || state.cmdArgs.extraChar === '<escape>') {
    clearOp();
    return;
  }

  // Execute the command!
  // Call the command function found in the commands table.
  state.cmdArgs.arg = state.cmd.cmd_arg;

  prepareCursors();

  try {
    await Promise.resolve(state.cmd.cmd_func(state.cmdArgs));
  } catch (e) {
    console.error(`Error executing command "${get('input').join('')}":\n${e}`);
    clearOp();
    return;
  }

  transposeCursors();
  clearOp();
}

async function normal_get_command_count(s: NormalState) {
  while ((s.char >= '0' && s.char <= '9') || (
    s.cmdArgs.count0 !== 0 && (s.char === '<delete>' || s.char === '0')
  )) {
    if (s.char === '<delete>') {
      s.cmdArgs.count0 = Math.floor(s.cmdArgs.count0 / 10);
      del_from_input(2) // delete the digit and "<delete>"
    } else if (s.cmdArgs.count0 > 99999999) {
      s.cmdArgs.count0 = 999999999;
    } else {
      s.cmdArgs.count0 = s.cmdArgs.count0 * 10 + (+s.char);
    }
    s.char = await readNextChar();
  }
  return false;
}

function normal_need_additional_char(s: NormalState): boolean {
  const flags = s.cmd.cmd_flags;
  const pending_op = (s.opArgs.op_type !== OP.NOP);
  const cmd_char = s.cmdArgs.cmdChar;

  // without NV_NCH we never need to check for an additional char
  if (!(flags & NV_NCH)) return false;
  // NV_NCH_ALW is set, always get a second char
  if (flags & NV_NCH_ALW) return true;
  // NV_NCH_NOP is set and no operator is pending, get a second char
  if ((flags & NV_NCH_NOP) === NV_NCH_NOP && !pending_op) return true;
  // 'q' without a pending operator, recording or executing a register,
  // needs to be followed by a second char, examples:
  // - qc => record using register c
  // - q: => open command-line window
  // TODO: add reg checks
  if (cmd_char === 'q' && !pending_op) return true;
  // 'a' or 'i' after an operator is a text object, examples:
  // - ciw => change inside word
  // - da( => delete parenthesis and everything inside.
  // Also, don't do anything when these keys are received in visual mode
  // so just get another char.
  if ((cmd_char === 'a' || cmd_char === 'i') && (pending_op /* || VIsual_active */)) return true;

  return false;
}

async function normal_get_additional_char(s: NormalState) {
  let char: 'nextChar' | 'extraChar';

  if (s.cmdArgs.cmdChar === 'g') {
    // For 'g' get the next character now, so that we can check for
    // "gr", "g'" and "g`".
    s.cmdArgs.nextChar = await readNextChar();

    if (s.cmdArgs.nextChar === 'r' || s.cmdArgs.nextChar === '\'' || s.cmdArgs.nextChar === '`' || s.cmdArgs.nextChar === '<C-\\>') {
      char = 'extraChar';
    } else {
      // neovim sets nchar to NULL in this case,
      // then checks that (*cp != NULL).
      // It seems simpler to just return here. 
      return;
    }
  } else {
    char = 'nextChar';
  }

  if (s.cmdArgs.cmdChar === 'r') set('mode', 'replace');

  s.cmdArgs[char] = await readNextChar();

  // TODO: handle special extra char cases
}

function del_from_input(n: number) {
  set('input', get('input').slice(0, -n));
}

function clearOp() {
  set('input', []);
  set('mode', 'normal');
  reset('vimState')
}

function clearOpNotify() {
  clearOp();
  showWarning('(invalid command)');
}

function nv_right(ca: NormalState['cmdArgs']) {
  ca.opArgs.motion_type = MotionType.CharWise;
  ca.opArgs.inclusive = false;

  for (let n = ca.count1; n > 0; n--) {
    if (!oneRight()) {
      if (ca.opArgs.op_type === OP.NOP && n === ca.count1) {
        blink()
      }
      break;
    }
  }
}

function nv_left(ca: NormalState['cmdArgs']) {
  ca.opArgs.motion_type = MotionType.CharWise;
  ca.opArgs.inclusive = false;

  for (let n = ca.count1; n > 0; n--) {
    if (!oneLeft()) {
      if (ca.opArgs.op_type === OP.NOP && n === ca.count1) {
        blink()
      }
      break;
    }
  }
}

function nv_up(ca: NormalState['cmdArgs']): void {
  ca.opArgs.motion_type = MotionType.LineWise;

  for (let n = ca.count1; n > 0; n--) {
    if (!oneUp()) {
      if (ca.opArgs.op_type === OP.NOP && n === ca.count1) {
        blink()
      }
      break;
    }
  }
}

function nv_down(ca: NormalState['cmdArgs']): void {
  ca.opArgs.motion_type = MotionType.LineWise;

  for (let n = ca.count1; n > 0; n--) {
    if (!oneDown()) {
      if (ca.opArgs.op_type === OP.NOP && n === ca.count1) {
        blink()
      }
      break;
    }
  }
}

function nv_csearch(ca: NormalState['cmdArgs']) {
  throw new Error("Function not implemented.");
}

function nv_replace(ca: NormalState['cmdArgs']) {
  throw new Error("Function not implemented.");
}

function nv_operator(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_regname(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_ident(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_dollar(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_percent(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_optrans(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_gomark(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_brace(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_dot(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_search(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_beginline(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_ignore(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_colon(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_at(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_edit(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_bck_word(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_abbrev(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_wordcmd(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_goto(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_scroll(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_join(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_next(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_open(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_put(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_regreplay(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_Replace(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_subst(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_Undo(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_Zet(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_brackets(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_error(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_lineop(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_g_cmd(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_mark(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_record(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_undo(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_zet(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_findpar(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_pipe(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}

function nv_tilde(ca: NormalState['cmdArgs']): void {
  throw new Error("Function not implemented.");
}
