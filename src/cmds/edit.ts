import { mutateCursors } from "../selection/mutate";
import vscode from 'vscode';

export function oneLeft(): Thenable<boolean> {
  return vscode.commands.executeCommand('cursorLeft');
  // return mutateCursors((cursor) => {
  //   return cursor.left();
  // })
}

export function oneRight(): Thenable<boolean> {
  return vscode.commands.executeCommand('cursorRight');
  // return mutateCursors((cursor) => {
  //   return cursor.right();
  // })
}

export function oneUp(): boolean {
  return mutateCursors((cursor) => {
    return cursor.up();
  })
}

export function oneDown(): boolean {
  return mutateCursors((cursor) => {
    return cursor.down();
  })
}