import vscode from 'vscode'
import { config } from '../config'
import { Mode, subscribe } from '../store'
import { disposable } from '../utils/vscodeSubscriptionManager'

let messageTimerId: NodeJS.Timeout | undefined = undefined

const modeColors = {
  insert: 'var(--vscode-charts-blue, blue)',
  normal: 'var(--vscode-charts-green, green)',
  visual: 'var(--vscode-charts-orange, orange)',
  'visual line': 'var(--vscode-charts-orange, orange)',
  'visual block': 'var(--vscode-charts-orange, orange)',
  leader: 'var(--vscode-charts-purple, purple)',
} satisfies Record<Mode, string>

const messageColors = {
  ok: 'var(--vscode-charts-green, green)',
  error: 'var(--vscode-charts-red, red)',
} as const

const modeIndicator = disposable(
  vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    config().get('statusIndicator.priority')
  )
)
modeIndicator.show()

const message = disposable(
  vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    config().get('statusIndicator.priority')
  )
)

export const setMessage = (msg: string, status: 'ok' | 'error' = 'ok') => {
  clearTimeout(messageTimerId)
  messageTimerId = undefined

  message.text = msg
  message.color = messageColors[status]
  message.show()
}

export const clearMessage = (force = false) => {
  if (!force && messageTimerId) return

  message.text = ''
  message.hide()
}

export const showWarning = (msg: string) => {
  setMessage(msg, 'error')

  messageTimerId = setTimeout(() => {
    messageTimerId = undefined
    clearMessage()
  }, 3000)
}

export const showError = (msg: string) => {
  vscode.window.showErrorMessage(msg)
}

subscribe(['mode', 'recording'], ({ mode, recording }) => {
  modeIndicator.text = recording
    ? `🔴 ${mode.toUpperCase()}`
    : mode.toUpperCase()
  modeIndicator.color = modeColors[mode]
})

subscribe(['cmdStr'], ({ cmdStr }) => {
  const cmdText = cmdStr.join('')

  vscode.commands.executeCommand(
    'setContext',
    'chords.cmdVisible',
    !!cmdText
  )

  if (cmdText) setMessage(cmdText)
  else clearMessage()
})
