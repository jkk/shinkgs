// @flow
import React, { PureComponent as Component } from 'react';
import UserName from '../user/UserName';
import type { GamePlayers, PlayerColor } from '../../model';

export default class GamePlayersList extends Component<> {
  static defaultProps: {
    players: ?GamePlayers,
    winner?: ?PlayerColor
  };

  render() {
    let { players, winner } = this.props;
    if (!players) {
      return null;
    }
    let player1 = players.white || players.owner || players.challengeCreator;
    let player2 = players.black;
    let white2 = players.white_2;
    let black2 = players.black_2;
    return (
      <div className='GamePlayersList'>
        {player1 ? (
          <div
            className={
              'GamePlayersList-player GamePlayersList-player1' +
              (winner === 'white' && players.white
                ? ' GamePlayersList-winner'
                : '')
            }>
            <UserName user={player1} />
          </div>
        ) : null}
        {white2 ? (
          <div
            className={
              'GamePlayersList-player GamePlayersList-white2' +
              (winner === 'white' ? ' GamePlayersList-winner' : '')
            }>
            <UserName user={white2} />
          </div>
        ) : null}
        {player2 ? (
          <div
            className={
              'GamePlayersList-player GamePlayersList-player2' +
              (winner === 'black' ? ' GamePlayersList-winner' : '')
            }>
            <UserName user={player2} />
          </div>
        ) : null}
        {black2 ? (
          <div
            className={
              'GamePlayersList-player GamePlayersList-black2' +
              (winner === 'black' ? ' GamePlayersList-winner' : '')
            }>
            <UserName user={black2} />
          </div>
        ) : null}
      </div>
    );
  }
}
