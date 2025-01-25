import vscode from 'vscode'
import { disposable } from './vscodeSubscriptionManager'

export const registerCmd = (cmd: string, callback: (...args: any[]) => any) => {
  disposable(vscode.commands.registerCommand(cmd, callback))
}
