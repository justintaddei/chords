export type Action =
  | {
    type: 'move';
    selections: AbstractRange[];
  }
  | {
    type: 'delete';
  }
  | {
    type: 'insert';
    position: 'before' | 'after' | 'over';
    text: string;
  };

export type AbstractRange = {
  start: number;
  end: number;
  type: 'char' | 'line' | 'block';
};

// this should be an array of functions that return actions or `false`
export type AtomicTransaction = Action[];