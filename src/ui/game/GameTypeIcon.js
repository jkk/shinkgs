// @flow
import React, { PureComponent as Component } from 'react';
import { Icon } from '../common';
import type { GameType } from '../../model';

const GAME_TYPE_CODE = {
  challenge: 'C',
  demonstration: 'D',
  review: 'D',
  rengo_review: 'D',
  teaching: 'T',
  simul: 'S',
  rengo: '2',
  free: 'F',
  ranked: 'R',
  tournament: '🏆'
};

export default class GameTypeIcon extends Component<> {
  static defaultProps: {
    type: GameType,
    subscribersOnly?: boolean,
    isPrivate?: boolean
  };

  render() {
    let { type, subscribersOnly, isPrivate } = this.props;
    let typeClassName =
      'GameTypeIcon GameTypeIcon-' + (isPrivate ? 'private' : type);
    let code;
    if (subscribersOnly) {
      code = '🎩';
    } else if (isPrivate) {
      code = <Icon name='lock' />;
    } else if (type === 'tournament') {
      code = <Icon name='trophy' />;
    } else {
      code = GAME_TYPE_CODE[type];
    }
    return (
      <div className={typeClassName}>
        <div className='GameTypeIcon-code'>{code}</div>
      </div>
    );
  }
}
