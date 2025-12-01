import vscode from 'vscode';
import { get, set } from './store';
import { registerCmd } from './utils/registerCmd';

type CmdType = string | (() => void);
type CmdMap = Record<string, CmdType>;

const cmds = {
  'chords.debug': () => set('debug', !get('debug')),
  'chords.mode.insert': () => set('mode', 'insert'),
  'chords.mode.normal': () => set('mode', 'normal'),
  'chords.mode.visual': () => set('mode', 'visual'),
  'chords.mode.visual-line': () => set('mode', 'visual line'),
  'chords.mode.visual-block': () => set('mode', 'visual block'),
} satisfies CmdMap;

for (const [cmd, action] of Object.entries(cmds)) {
  if (typeof action === 'string')
    registerCmd(cmd, () => vscode.commands.executeCommand(action));
  else if (typeof action === 'function') registerCmd(cmd, action);
  else throw new Error(`Invalid command action for ${cmd}: ${action}`);
}
