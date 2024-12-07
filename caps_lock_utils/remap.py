import keyboard

caps_lock_down = False

if keyboard.lock_state('caps'):
  keyboard.send('capslock')

keyboard.remap_key('capslock', 'esc')

keyboard.wait()