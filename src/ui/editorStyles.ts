import vscode from 'vscode';
import { config, editorConfig } from '../config';
import { get, Store, subscribe } from '../store';
import { setCursorStyle, setLineNumbers } from '../utils/vscodeStyles';
import { disposable } from '../utils/vscodeSubscriptionManager';

export const updateEditorStyles = () => {
  const mode = get('mode');

  if (mode === 'insert') {
    setCursorStyle(editorConfig().get('cursorStyle'));
    setLineNumbers(editorConfig().get('lineNumbers'));
  }

  if (mode === 'normal') {
    // if (opType) {
    //   setCursorStyle(config().get('normalMode.operatorPendingCursorStyle'));
    // } else {
    setCursorStyle(config().get('normalMode.cursorStyleOperator'));
    // }
    setCursorStyle(config().get('normalMode.cursorStyle'));
    setLineNumbers(config().get('normalMode.lineNumbers'));
  }

  if (mode === 'replace') {
    setCursorStyle(config().get('normalMode.operatorPendingCursorStyle'));
    setLineNumbers(config().get('normalMode.lineNumbers'));
  }

  if (mode === 'visual') {
    setLineNumbers(config().get('visualMode.lineNumbers'));

    const _selections = vscode.window.activeTextEditor?.selections;

    // if (selections?.some((s) => length(s) > 1 || !s.isReversed)) {
    //   setCursorStyle(config().get('visualMode.cursorStyleSelection'))
    // } else {
    setCursorStyle(config().get('visualMode.cursorStyleEmpty'));
    // }
  }
};

subscribe(['mode'], updateEditorStyles);

disposable(vscode.window.onDidChangeActiveTextEditor(updateEditorStyles));
