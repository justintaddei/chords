import { editor } from '../helpers';
import { computed, get, set } from '../store';
import { fromVSCodeSelection } from './edit';

// fixme: needs to be called anytime the users clicks to set the cursor or otherwise changes the selection outside of Chords
export function update_curswant_force() {
  // we don't use computed.cursors here because it might not be set yet
  const cursors = editor().selections.map(fromVSCodeSelection);
  const wants = cursors.map((cursor) => cursor.char);
  computed.curswant = wants;
  set('set_curswant', false);
}

function clear_unused_curswant() {
  const cursors = editor().selections.map(fromVSCodeSelection);
  const wants = computed.curswant.slice(0, cursors.length);
  computed.curswant = wants;
}

export function update_curswant() {
  if (computed.cursors.length < computed.curswant.length) {
    clear_unused_curswant();
  }

  if (get('set_curswant')) {
    update_curswant_force();
  }
}
