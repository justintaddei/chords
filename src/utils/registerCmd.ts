import vscode from 'vscode';
import { disposable } from './vscodeSubscriptionManager';

export const registerCmd = <T = unknown>(
  cmd: string,
  callback: (...args: T[]) => unknown,
) => {
  disposable(vscode.commands.registerCommand(cmd, callback));
};
