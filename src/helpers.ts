import vscode from 'vscode';

export const editor = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor)
    throw new Error(
      'Attempted to operate on an editor without an active editor',
    );
  return editor;
};

export const document = () => {
  const doc = editor().document;
  if (!doc)
    throw new Error(
      'Attempted to operate on a document without an active document',
    );
  return doc;
};
