import { Cursor } from '../globals';
import { Direction } from '../globals';
import { document } from '../helpers';

const kernelSlice = (chars: string[], start: number, end: number) => {
  const charsInKernel = [];

  for (let i = start; i < end; i++) charsInKernel.push(chars[i]);

  return charsInKernel;
};

export const walkLine = function* ({
  cursor,
  kernel,
  dir,
  startUnderCursor = false,
}: {
  cursor: Cursor;
  kernel: [number, number];
  startUnderCursor?: boolean;
  dir: Direction;
}) {
  const nudge = startUnderCursor ? 0 : 1;

  const text =
    dir === Direction.FORWARD
      ? document().lineAt(cursor.line).text.slice(cursor.char).split('')
      : document()
          .lineAt(cursor.line)
          .text.slice(0, cursor.char + 1)
          .split('')
          .reverse();

  for (let i = nudge; i < text.length; i++) {
    const chars = kernelSlice(text, i - kernel[0], i + kernel[1] + 1);

    yield {
      chars,
      location: {
        line: cursor.line,
        char: dir === Direction.FORWARD ? cursor.char + i : text.length - i - 1,
      },
    };
  }
};
