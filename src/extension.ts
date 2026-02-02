import * as vscode from 'vscode';
import './extension-commands';
import './context';
import { input } from './input';
import { get, set, subscribe } from './store';
import './ui/editorStyles';
import './ui/statusBar';
import { registerCmd } from './utils/registerCmd';

let typeCmdHandler: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('[chords] activated');

  set('extContext', context);

  const overrideTypeHandler = () => {
    return vscode.commands.registerCommand('type', async (args) => {
      input(args.text);
    });
  };

  subscribe(['mode'], ({ mode, recording }) => {
    if (mode === 'insert' && !recording) {
      if (typeCmdHandler) typeCmdHandler.dispose();
      typeCmdHandler = undefined;
      vscode.commands.executeCommand('setContext', 'chords.bypass', true);
    } else {
      if (!typeCmdHandler) typeCmdHandler = overrideTypeHandler();
      vscode.commands.executeCommand('setContext', 'chords.bypass', false);
    }
  });

  registerCmd<string>('chords.input', (char) => {
    input(char);
  });
}

export function deactivate() {
  if (typeCmdHandler) typeCmdHandler.dispose();
  // destroy()

  console.log('[chords] deactivated');
}
