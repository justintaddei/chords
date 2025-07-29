import vscode from 'vscode';

const change = async () => {
  await deleteLeft()
  return vscode.commands.executeCommand('chords.setMode.insert')
}

const deleteLeft = () => vscode.commands.executeCommand('deleteLeft')
const deleteRight = () => vscode.commands.executeCommand('deleteRight')


const yank = async () => {
  await vscode.commands.executeCommand('chords.highlightSelections')
  await vscode.commands.executeCommand('editor.action.clipboardCopyAction')
}

const cut = async () => {
  await vscode.commands.executeCommand('editor.action.clipboardCutAction')
}

const swapCase = async () => {
  console.log("Swap case operation");
}

const lowerCase = async () => {
  console.log("Make lower case operation");
}

const upperCase = async () => {
  console.log("Make upper case operation");
}

export const operators = {
  change,
  deleteLeft,
  deleteRight,
  yank,
  cut,
  swapCase,
  lowerCase,
  upperCase
}