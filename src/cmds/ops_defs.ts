/**
 * Operator IDs
 * @note The order must correspond to opchars in ops.ts!!!
 */
export enum OP {
  /**
   * no pending operation
   */
  NOP = 0,
  /**
   * "d" delete operator
   */
  DELETE = 1,
  /**
   * "y" yank operator
   */
  YANK = 2,
  /**
   * "c" change operator
   */
  CHANGE = 3,
  /**
   * "<" left shift operator
   */
  LSHIFT = 4,
  /**
   * ">" right shift operator
   */
  RSHIFT = 5,
  /**
   * "!" filter operator
   */
  FILTER = 6,
  /**
   * "g~" switch case operator
   */
  TILDE = 7,
  /**
   * "=" indent operator
   */
  INDENT = 8,
  /**
   * "gq" format operator
   */
  FORMAT = 9,
  /**
   * ":" colon operator
   */
  COLON = 10,
  /**
   * "gU" make upper case operator
   */
  UPPER = 11,
  /**
   * "gu" make lower case operator
   */
  LOWER = 12,
  /**
   * "J" join operator, only for Visual mode
   */
  JOIN = 13,
  /**
   * "gJ" join operator, only for Visual mode
   */
  JOIN_NS = 14,
  /**
   * "g?" rot-13 encoding
   */
  ROT13 = 15,
  /**
   * "r" replace chars, only for Visual mode
   */
  REPLACE = 16,
  /**
   * "I" Insert column, only for Visual mode
   */
  INSERT = 17,
  /**
   * "A" Append column, only for Visual mode
   */
  APPEND = 18,
  /**
   * "zf" define a fold
   */
  FOLD = 19,
  /**
   * "zo" open folds
   */
  FOLDOPEN = 20,
  /**
   * "zO" open folds recursively
   */
  FOLDOPENREC = 21,
  /**
   * "zc" close folds
   */
  FOLDCLOSE = 22,
  /**
   * "zC" close folds recursively
   */
  FOLDCLOSEREC = 23,
  /**
   * "zd" delete folds
   */
  FOLDDEL = 24,
  /**
   * "zD" delete folds recursively
   */
  FOLDDELREC = 25,
  /**
   * "gw" format operator, keeps cursor pos
   */
  FORMAT2 = 26,
  /**
   * "g@" call 'operatorfunc'
   */
  FUNCTION = 27,
  /**
   * "<C-A>" Add to the number or alphabetic character
   */
  NR_ADD = 28,
  /**
   * "<C-X>" Subtract from the number or alphabetic character
   */
  NR_SUB = 29,
};