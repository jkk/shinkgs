// @flow
import type { AppState, KgsMessage } from './types';

export function handlePlaybackMessage(
  prevState: AppState,
  msg: KgsMessage
): AppState {
  if (msg.type === 'PLAYBACK_ADD') {
    return { ...prevState, playbacks: msg.playbacks };
  }
  // TODO - PLAYBACK_DATA
  // TODO - PLAYBACK_SETUP
  // TODO - ALREADY_IN_PLAYBACK
  // TODO - PLAYBACK_ERROR
  // TODO - PLAYBACK_DELETE
  // TODO - PLAYBACK_SEEK_START
  // TODO - PLAYBACK_SEEK_COMPLETE
  return prevState;
}
