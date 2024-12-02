import keyboard

caps_lock = keyboard.lock_state("caps")

if caps_lock:
  keyboard.send('capslock')