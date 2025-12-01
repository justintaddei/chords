import { handledBindings, makeWhenSafe } from './generators/keybindings';
import { computed, subscribe } from './store';
import vscode from 'vscode';

subscribe(['keymaps'], ({ keymaps }) => {
  for (const binding of handledBindings) {
    vscode.commands.executeCommand(
      'setContext',
      `chords.listen.${makeWhenSafe(binding)}.normal`,
      false,
    );
    vscode.commands.executeCommand(
      'setContext',
      `chords.listen.${makeWhenSafe(binding)}.visual`,
      false,
    );
  }

  // todo: loop over default key bindings and enable them

  for (const [modes, before] of keymaps) {
    const keys = handledBindings.filter((binding) => before.includes(binding));
    if (keys.length === 0) continue;

    for (const mode of modes) {
      for (const key of keys) {
        vscode.commands.executeCommand(
          'setContext',
          `chords.listen.${makeWhenSafe(key)}.${mode}`,
          true,
        );
      }
    }
  }
});

subscribe(['mode'], ({ mode }) => {
  vscode.commands.executeCommand('setContext', 'chords.mode', mode);

  if (computed.isInsertMode)
    vscode.commands.executeCommand(
      'setContext',
      'chords.effectiveMode',
      'insert',
    );
  else if (computed.isNormalMode)
    vscode.commands.executeCommand(
      'setContext',
      'chords.effectiveMode',
      'normal',
    );
  else if (computed.isVisualMode)
    vscode.commands.executeCommand(
      'setContext',
      'chords.effectiveMode',
      'visual',
    );
  else
    vscode.commands.executeCommand(
      'setContext',
      'chords.effectiveMode',
      'unknown',
    );
});
