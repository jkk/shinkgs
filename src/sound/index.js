// @flow
// $FlowFixMe: mp3 files not recognized
import playfulHit from './playful_reveal_mute_hit_01.mp3';
// $FlowFixMe: mp3 files not recognized
import twoTone from './two_tone_03b.mp3';

export const SOUNDS = {
  // $FlowFixMe: Audio not recognized
  CHALLENGE_PROPOSAL_RECEIVED: new Audio(playfulHit),
  DIRECT_MESSAGE_RECEIVED: new Audio(twoTone)
};
