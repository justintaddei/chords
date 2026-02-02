import { update_curswant_force } from './cmds/move';
import { normal_execute } from './cmds/normal';
import { config } from './config';
import { computed, get, push, reset, set } from './store';
import { disposable } from './utils/vscodeSubscriptionManager';
import vscode from 'vscode';

let forwardChar: null | ((char: string) => void) = null;

export const input = (char: string) => {
  console.log('[chords] input:', char);
  push('input', char);

  if (forwardChar) {
    console.log('forwarding char:', char);
    forwardChar(char);
    forwardChar = null;
    return;
  }

  if (char === config().get('escape')) {
    set('input', []);
    set('mode', 'normal');
    reset('vimState');
    return;
  }

  set('executing', true);

  if (computed.isNormalMode) normal_execute(char);

  set('executing', false);
};

export const readNextChar = (): Promise<string> =>
  new Promise((resolve) => {
    forwardChar = resolve;
  });

disposable(
  vscode.window.onDidChangeTextEditorSelection(({ selections, kind }) => {
    if (get('executing')) return;
    if (kind === vscode.TextEditorSelectionChangeKind.Command) return;

    const hasSelections = selections.some((s) => !s.isEmpty);

    if (computed.isNormalMode && hasSelections) return set('mode', 'visual');

    if (computed.isVisualMode && !hasSelections) return set('mode', 'normal');

    update_curswant_force();
  }),
);
