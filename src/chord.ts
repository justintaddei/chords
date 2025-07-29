import vscode from 'vscode';
import { collapseSelections } from './actions/collapseSelections';
import { getArgType } from "./commands";
import { computed, get, merge, Store } from "./store";

type OpType = 'linewise' | 'charwise' | 'blockwise'

export type Command = {
  immediate: string,
  operator: string,
  motion: string,
  forceType: OpType | null,
  arg: string,
  count1: number,
  count2: number,
}

const couldBeCommand = (str: string) => {
  return Object.keys(get('keyMap').commands).some((cmd) => cmd.startsWith(str))
}

const couldBeOperator = (str: string) => {
  return Object.keys(get('keyMap').operators).some((op) => op.startsWith(str))
}

const couldBeMotion = (str: string) => {
  return Object.keys(get('keyMap').motions).some((motion) => motion.startsWith(str))
}

const isCommand = (cmd: string) => {
  return Object.keys(get('keyMap').commands).includes(cmd)
}

const isOperator = (op: string) => {
  return Object.keys(get('keyMap').operators).includes(op)
}

const isMotion = (motion: string) => {
  return Object.keys(get('keyMap').motions).includes(motion)
}

const getPendingArgType = (cmd: Command) => {
  if (isCommand(cmd.immediate)) {
    const commandCmd = get('keyMap').commands[cmd.immediate as keyof Store['keyMap']['commands']]
    return getArgType(commandCmd) ?? null;
  }

  if (!isMotion(cmd.motion)) return null

  const motionCmd = get('keyMap').motions[cmd.motion as keyof Store['keyMap']['motions']]

  return getArgType(motionCmd)
}


const isCmdExecutable = (cmd: Command) => {
  if (get('cmd').pending) return false

  if (computed.isVisualMode && cmd.operator) return true
  if (cmd.immediate && isCommand(cmd.immediate)) return true

  if (cmd.operator && !isOperator(cmd.operator)) return false
  if (!isMotion(cmd.motion)) return false

  return true
}

export const parseCmd = (): { cmd: Command, exec: boolean } | null => {
  const cmd = get('cmdStr')
  if (!cmd.length) return null

  const remainingChars = [...cmd]

  const parsedCmd: Command = {
    immediate: '',
    operator: '',
    motion: '',
    forceType: null,
    arg: '',
    count1: 1,
    count2: 1,
  }

  let count = 'count1' as 'count1' | 'count2' | 'unexpected';

  while (remainingChars.length) {
    const char = remainingChars.shift()!;

    const argType = getPendingArgType(parsedCmd)

    if (argType) {
      parsedCmd.arg += char;
      if (argType === 'char') merge('cmd', { pending: false })
    }
    else if (char.match(/\d/)) {
      if (count === 'unexpected')
        return null

      let countStr = char;
      while (remainingChars.length && remainingChars[0].match(/\d/)) {
        countStr += remainingChars.shift()!;
      }

      parsedCmd[count] = parseInt(countStr, 10);
    }
    else if (couldBeCommand(parsedCmd.immediate + char)) {
      parsedCmd.immediate += char;
    }
    else if (couldBeOperator(parsedCmd.operator + char)) {
      parsedCmd.operator += char;
      count = 'count2';
    }
    else if (couldBeMotion(parsedCmd.motion + char)) {
      parsedCmd.motion += char;
      count = 'unexpected'
    }
    else return null
  }

  if (!parsedCmd.arg)
    merge('cmd', { pending: !!getPendingArgType(parsedCmd) })


  return {
    cmd: parsedCmd,
    exec: isCmdExecutable(parsedCmd)
  }
}

const commandToVSCodeCommand = (cmd: string): string =>
  get('keyMap').commands[cmd as keyof Store['keyMap']['commands']] ?? '';

const operatorToVSCodeCommand = (operator: string): string =>
  get('keyMap').operators[operator as keyof Store['keyMap']['operators']] ?? '';

const motionToVSCodeCommand = (motion: string): string =>
  get('keyMap').motions[motion as keyof Store['keyMap']['motions']] ?? '';




export const executeCmd = async (cmd: Command) => {
  console.dir(cmd)
  const { operator, motion, arg, count1, count2 } = cmd;

  merge('cmd', { arg, select: !!operator || computed.isVisualMode })

  if (cmd.immediate) {
    await vscode.commands.executeCommand(commandToVSCodeCommand(cmd.immediate))
    collapseSelections('left')
    return;
  }

  if (motion)
    for (let i = 0; i < count1 * count2; i++) {
      await vscode.commands.executeCommand(motionToVSCodeCommand(motion))
    }

  if (operator) await vscode.commands.executeCommand(operatorToVSCodeCommand(operator))

  if (!computed.isVisualMode)
    collapseSelections('left')
}