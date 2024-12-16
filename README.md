<div style="text-align:center;">
  <img src="./logo.png" width="150pxs">
  <h1 style="border:none;">Chords</h1>
  <p>Keyboard navigation for VS Code, inspired by Vim.</p>
</div>

---

**Chords** enables keyboard-centric navigation, *heavily* inspired by Vim, built on top of the VS Code API.

> The goal of this extension is not to run Vim inside of VS Code (the Vim and VSCode Neovim extensions already do that). Rather, the aim is to apply Vim's keyboard-first philosophy in a way that is idiomatic to VS Code. Most notably, first-class multi-cursor support all "motions" (which we will call "chords" from here onward). All chords are configurable, and extendable.

## INSERT Mode

**INSERT** mode is the default (configurable) mode. This mode allows you to type text and otherwise use the editor the same way you always have.  
**Chords will never bind anything your modifier keys (ctrl, cmd, alt, etc.) so you are free to use all of your usual keyboard shortcuts. This is true across all modes.**

## NORMAL Mode

> Please note, keybindings are shown as the characters you need to type, rather than the exact keystrokes needed make that character. When you see `h`, you would only type "h," whereas `H` would be "shift + h." Named keys will take the form of `<name>`. For example, `<esc>` in the next paragraph is the Escape key. Sequences of characters will be written together but should be typed individually. For example, the sequence `yiw` is not "y + i + w," but "y" then "i" then "w."

Pressing `<esc>` in **INSERT** mode will bring you to **NORMAL**. In this mode, your keyboard is not used for typing text. Instead, it's used as a controller to move around the document.
> Pressing `i` will return you to **INSERT** mode.

### Basic movement
To get around, `h`, `j`, `k`, and `l` are used to move `left`, `down`, `up`, and `right`, respectfully.  
For larger jumps, `w` will move the cursor forward by one word (as defined by your `editor.wordSeparators` setting) and `b` moves the cursor back by one word.

## VISUAL Mode

**VISUAL** mode is used for making interactive selection by combining chords together. You can enter **VISUAL** mode by pressing `v`, and you can get back to **NORMAL** mode by pressing `<esc>` or `n`.

## LEADER Mode