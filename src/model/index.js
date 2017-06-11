// @flow
import type {AppState, KgsMessage} from './types';
import {handleSessionMessage} from './session';
import {handleRoomMessage} from './room';
import {handleGameMessage} from './game';
import {handleUserMessage} from './user';
import {handleChannelMessage} from './channel';
import {handleConversationMessage} from './conversation';
import {handlePlaybackMessage} from './playback';

export * from './types';
export * from './appState';
export * from './AppStore';
export * from './AppActions';
export * from './KgsClient';

// Message types we at least sometimes ignore
const IGNORED_MESSAGE_TYPES = {
  'GAME_CONTAINER_REMOVE_GAME': true,
  'GAME_OVER': true,
  'GAME_TIME_EXPIRED': true,
  'CHALLENGE_CREATED': true,
  'SYNC': true
};

export function handleMessage(prevState: AppState, msg: KgsMessage): AppState {
  // console.log(msg.type, msg);
  let nextState;
  nextState = handleSessionMessage(prevState, msg);
  nextState = handleRoomMessage(nextState, msg);
  nextState = handleGameMessage(nextState, msg);
  nextState = handleUserMessage(nextState, msg);
  nextState = handleChannelMessage(nextState, msg);
  nextState = handleConversationMessage(nextState, msg);
  nextState = handlePlaybackMessage(nextState, msg);
  if (process.env.NODE_ENV === 'development') {
    if (prevState === nextState && !IGNORED_MESSAGE_TYPES[msg.type]) {
      console.log('No change', msg.type, msg);
    }
  }
  return nextState;
}

export function isValidNav(nav: string) {
  return (
    nav === 'watch' ||
    nav === 'play' ||
    nav === 'chat' ||
    nav === 'search' ||
    nav === 'more'
  );
}
