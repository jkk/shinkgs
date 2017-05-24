// @flow
import React, {PureComponent as Component} from 'react';
import {A} from '../common';
import UserName from '../user/UserName';
import {formatGameRole} from '../../model/game';
import type {
  GameProposalPlayer,
  GameType,
  User,
  Index
} from '../../model';

class ChallengePlayersItem extends Component {

  props: {
    player: GameProposalPlayer,
    index: number,
    user: User | string,
    nigiri: boolean,
    onUserDetail: string => any
  };

  render() {
    let {player, index, user, nigiri} = this.props;
    return (
      <div className='ChallengePlayers-item'>
        <div className='ChallengePlayers-role'>
          {nigiri ? `Player ${index + 1}` : formatGameRole(player.role)}
        </div>
        <div className='ChallengePlayers-player'>
          <A button onClick={this._onUserDetail}>
            {typeof user === 'string' ?
              user :
              <UserName user={user} extraIcons />}
          </A>
        </div>
      </div>
    );
  }

  _onUserDetail = () => {
    let {user, onUserDetail} = this.props;
    onUserDetail(typeof user === 'string' ? user : user.name);
  }
}

type Props = {
  players: Array<GameProposalPlayer>,
  nigiri: boolean,
  gameType: GameType,
  usersByName: Index<User>,
  onUserDetail: string => any
};

export default class ChallengePlayers extends Component {

  props: Props;

  render() {
    let {players, nigiri, usersByName, onUserDetail} = this.props;
    return (
      <div className='ChallengePlayers'>
        {players.map((player, i) => {
          if (player.name) {
            return (
              <ChallengePlayersItem
                key={i + '-' + player.name}
                player={player}
                index={i}
                user={usersByName[player.name] || player.name}
                nigiri={nigiri}
                onUserDetail={onUserDetail} />
            );
          }
          return null;
        })}
      </div>
    );
  }
}