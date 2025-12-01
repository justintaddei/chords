import type vscode from 'vscode';
import { get, subscribe } from '../store';

let buffer: vscode.Disposable[] = [];

subscribe(['extContext'], ({ extContext }) => {
  if (extContext) {
    extContext.subscriptions.push(...buffer);
    buffer = [];
  }
});

export const disposable = <T extends vscode.Disposable>(obj: T): T => {
  const extContext = get('extContext');

  if (extContext) extContext.subscriptions.push(obj);
  else buffer.push(obj);

  return obj;
};
