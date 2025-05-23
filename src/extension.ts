import * as vscode from 'vscode'
import './commands'
import { onInput } from './inputHandler'
import { destroy, set, subscribe } from './store'
import './ui/editorStyles'
// import { initCapsLockRemapper } from './utils/capsLockRemapper'

let typeCmdHandler: vscode.Disposable | undefined = undefined

export function activate(context: vscode.ExtensionContext) {
  console.log('[chords] activated')

  set('context', context)

  const overrideTypeHandler = () => {
    return vscode.commands.registerCommand('type', async (args) => {
      onInput(args.text)
    })
  }

  subscribe(['mode'], ({ mode, recording }) => {
    if (mode === 'insert' && !recording) {
      if (typeCmdHandler) typeCmdHandler.dispose()
      typeCmdHandler = undefined
      vscode.commands.executeCommand('setContext', 'chords.bypass', true)
    } else {
      if (!typeCmdHandler) typeCmdHandler = overrideTypeHandler()
      vscode.commands.executeCommand('setContext', 'chords.bypass', false)
    }
  })

  context.subscriptions.push(
    vscode.commands.registerCommand('chords.input', (char) => {
      onInput(char)
    })
  )

  // initCapsLockRemapper()
}

export function deactivate() {
  if (typeCmdHandler) typeCmdHandler.dispose()
  destroy()

  console.log('[chords] deactivated')
}
