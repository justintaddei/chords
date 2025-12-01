import vscode, { DocumentDropEdit, Selection } from 'vscode';
import { config, editorConfig } from '../config';

const document = () => {
  const doc = vscode.window.activeTextEditor?.document;
  if (!doc) throw new Error('Attempted to operate on a document without an active document');
  return doc;
}

const tabOffset = (line: number, col: number) => {
  const text = document().lineAt(line).text.slice(0, col);
  const tabCount = Math.max(0, text.split('\t').length - 1);
  return (tabCount * (editorConfig().get('tabSize') as number)) - tabCount;
}

const getTabDelta = (fromLine: number, toLine: number, col: number) => {
  const fromOffset = tabOffset(fromLine, col);
  const toOffset = tabOffset(toLine, col);

  if (toOffset === 0) return 0;

  return fromOffset - toOffset;
}

export class Cursor {
  static fromVSCodeSelection(selection: Selection): Cursor {
    const maxLine = document().lineCount;

    const line = selection.active.line;
    const col = selection.active.character;

    return new Cursor(line, col, maxLine);
  }

  toVsCodeSelection(): Selection {
    const pos = new vscode.Position(this.line, this.col);
    return new vscode.Selection(pos, pos);
  }

  line: number;
  col: number;
  desiredCol: number;
  maxLine: number;

  constructor(
    line: number,
    col: number,
    maxLine: number,
    desiredCol: number = col,
    adjustCol: boolean = false,
  ) {
    this.line = line;
    this.col = col;
    this.desiredCol = desiredCol;
    this.maxLine = maxLine;

    if (adjustCol) {
      this.adjustCol();
    }

  }

  left(): false | Cursor {
    this.desiredCol = this.col;
    if (this.col <= 0) return false;

    return new Cursor(this.line, this.col - 1, this.maxLine);
  }

  right(): false | Cursor {
    this.desiredCol = this.col;
    // Prevent moving right past the end of the line
    if (this.col >= document().lineAt(this.line).text.length - 1) return false

    return new Cursor(this.line, this.col + 1, this.maxLine);
  }

  up(): false | Cursor {
    if (this.line <= 0) return false;

    const visualColDelta = getTabDelta(this.line, this.line - 1, this.col)
    const adjustCol = Math.max(0, this.col + visualColDelta)
    const adjustDesiredCol = Math.max(0, this.desiredCol + visualColDelta)
    return new Cursor(this.line - 1, adjustCol, this.maxLine, adjustDesiredCol, true);
  }

  down(): false | Cursor {
    if (this.line >= this.maxLine - 1) return false;

    const visualColDelta = getTabDelta(this.line, this.line + 1, this.col)
    const adjustCol = Math.max(0, this.col + visualColDelta)
    const adjustDesiredCol = Math.max(0, this.desiredCol + visualColDelta)
    return new Cursor(this.line + 1, adjustCol, this.maxLine, adjustDesiredCol, true);
  }

  adjustCol(): void {
    const eol = Math.max(0, document().lineAt(this.line).text.length - 1); // don't include CR
    if (this.col > eol || this.desiredCol > eol) {
      this.col = eol;
    } else {
      this.col = this.desiredCol;
    }
  }

  equals(other: Cursor): boolean {
    return this.line === other.line && this.col === other.col;
  }

  static match(before: Cursor[], after: Cursor[]): boolean {
    if (before.length !== after.length) return false;

    for (let i = 0; i < before.length; i++)
      if (!before[i].equals(after[i])) return false;

    return true;
  }
}
