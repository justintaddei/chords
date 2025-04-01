import * as vscode from 'vscode'
import './commands'
import { onInput } from './inputHandler'
import { destroy, set, subscribe } from './store'
import './ui/editorStyles'
import { initCapsLockRemapper } from './utils/capsLockRemapper'

let typeHandler: vscode.Disposable | undefined = undefined

export function activate(context: vscode.ExtensionContext) {
  console.log('[chords] activated')

  set('context', context)

  const overrideTypeHandler = () => {
    return vscode.commands.registerCommand('type', async (args) => {
      onInput(args.text)
    })
  }

  subscribe(['mode'], ({ mode }) => {
    if (mode === 'insert') {
      if (typeHandler) typeHandler.dispose()
      typeHandler = undefined
    } else {
      if (!typeHandler) typeHandler = overrideTypeHandler()
    }
  })

  context.subscriptions.push(
    vscode.commands.registerCommand('chords.input', (char) => {
      onInput(char)
    })
  )

  initCapsLockRemapper()
}

export function deactivate() {
  if (typeHandler) typeHandler.dispose()
  destroy()

  console.log('[chords] deactivated')
}
