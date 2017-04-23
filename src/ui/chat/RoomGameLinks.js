// @flow
import React, {PureComponent as Component} from 'react';
import {A, Icon, StonesIcon} from '../common';
import type {
  GameChannel
} from '../../model';

class RoomGameLink extends Component {

  props: {
    games: Array<GameChannel>,
    onSelect: (games: Array<GameChannel>) => any
  };

  render() {
    let {games} = this.props;
    let isChallenges = games.length && games[0].type === 'challenge';
    let className = 'RoomGameLink ' + (
      isChallenges ? ' RoomGameLink-challenges' : 'RoomGameLink-games'
    );
    return (
      <div className={className}>
        <A onClick={this._onSelect}>
          <div className='RoomGameLink-icon'>
            {isChallenges ?
              <Icon name='hand-pointer-o' /> :
              <StonesIcon />}
          </div>
          <div className='RoomGameLink-label'>
            {games.length} {(isChallenges ? 'challenge' : 'game') + (games.length > 1 ? 's' : '')}
          </div>
        </A>
      </div>
    );
  }

  _onSelect = () => {
    this.props.onSelect(this.props.games);
  }
}

export default class RoomGameLinks extends Component {

  props: {
    games: Array<GameChannel>,
    onSelect: (games: Array<GameChannel>) => any
  };

  render() {
    let {games, onSelect} = this.props;
    let activeGames = [];
    let challenges = [];
    for (let game of games) {
      if (game.deletedTime) {
        continue;
      }
      if (game.type === 'challenge') {
        challenges.push(game);
      } else {
        activeGames.push(game);
      }
    }
    return (
      <div key='digests' className='RoomGameLinks'>
        {activeGames.length ?
          <RoomGameLink
            games={activeGames}
            onSelect={onSelect} /> : null}
        {challenges.length ?
          <RoomGameLink
            games={challenges}
            onSelect={onSelect} /> : null}
      </div>
    );
  }

}
