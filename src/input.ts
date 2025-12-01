import { normal_execute } from './cmds/normal';
import { config } from './config';
import { computed, push, reset, set, subscribe } from './store';

let forwardChar: null | ((char: string) => void) = null;

export const input = (char: string) => {
  console.log('[chords] input:', char);
  push('input', char);

  if (forwardChar) {
    console.log('forwarding char:', char)
    forwardChar(char);
    forwardChar = null;
    return;
  }

  if (char === config().get('escape')) {
    set('input', []);
    set('mode', 'normal');
    reset('vimState')
    return;
  }


  if (computed.isNormalMode)
    normal_execute(char);
};

export const readNextChar = (): Promise<string> => new Promise((resolve) => {
  forwardChar = resolve;
});
