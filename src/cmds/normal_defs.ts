export enum MotionType {
  CharWise,
  LineWise,
  BlockWise,
  Unknown = -1,
}

export type cmd_arg_T = number | boolean;
export type nv_func_T = (args: NormalState['cmdArgs']) => void | Promise<void>;
export type cmd_T = { cmd_char: string; cmd_func: nv_func_T; cmd_flags: number; cmd_arg: cmd_arg_T }

export type oparg_T = {
  /**
   * current pending operator type
   */
  op_type: number;
  /**
   * register to use for the operator
  */
  regName: string;
  /**
   * type of the current cursor motion
   */
  motion_type: MotionType;
  /**
   * force motion type: 'v', 'V' or CTRL-V
   */
  motion_force: MotionType | false;
  /**
   * true if char motion is inclusive (only
   * valid when motion_type is CharWise)
   */
  inclusive: boolean;
  /**
   * start of the operator
   */
  start: pos_T;
  /**
   * end of the operator
   */
  end: pos_T;
  /**
   * number of lines from op_start to op_end (inclusive)
   */
  lineCount: number;
  /**
   * op_start and op_end the same (only used by op_change())
   */
  empty: boolean;
}
export type cmdarg_T = {
  /**
   * Operator arguments
   */
  opArgs: oparg_T;
  /**
   * command character
   */
  cmdChar: string;
  /**
   * next command character (optional)
   */
  nextChar: string;
  /**
   * yet another character (optional)
   * @note used for 'g' commands like 'gr' which need two "next chars"
   */
  extraChar: string;
  /**
   * count before an operator
   */
  opCount: number;
  /**
   * count before command, default 0
   */
  count0: number;
  /**
   * count before command, default 1
   */
  count1: number;
  /**
   * extra argument from nv_cmds
   */
  arg: cmd_arg_T;

}
export type pos_T = {
  line: number;
  column: number;
}

export type NormalState = {
  command_finished: boolean;
  opArgs: oparg_T;
  cmdArgs: cmdarg_T
  char: string;
  // this is `idx` in neovim
  cmd: cmd_T;
  old_col: number;
  old_pos: pos_T;
}