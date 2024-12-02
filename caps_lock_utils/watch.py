import keyboard
import sys

caps_lock = keyboard.lock_state("caps")
caps_lock_down = False

print(1 if caps_lock else 0)
sys.stdout.flush()

def on_caps_lock_pressed(_event):
  global caps_lock, caps_lock_down
  
  if not caps_lock_down:
    caps_lock = not caps_lock
    print(1 if caps_lock else 0)
    sys.stdout.flush()

  caps_lock_down = True

def on_caps_lock_released(_event):
  global caps_lock_down
  
  caps_lock_down = False

keyboard.on_press_key('capslock', on_caps_lock_pressed)
keyboard.on_release_key('capslock', on_caps_lock_released)
keyboard.wait()