export const FAIL = Symbol('FAIL');
export const OK = Symbol('PASS');

export type RESULT = typeof FAIL | typeof OK;
export type FAIL = typeof FAIL;
export type OK = typeof OK;

// Directions
export const Direction = {
  DirectionNotSet: 0,
  FORWARD: 1,
  BACKWARD: -1,
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

export type Cursor = {
  line: number;
  char: number;
};
