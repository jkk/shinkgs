// @flow
import React, {PureComponent as Component} from 'react';
import {A} from '../common';
import GameTypeIcon from './GameTypeIcon';
import GamePlayersList from './GamePlayersList';
import GameRulesDisplay from './GameRulesDisplay';
import {
  formatGameScore,
  getWinningColor
} from '../../model/game';
import type {
  GameChannel,
  GameFilter,
  Room,
  Index
} from '../../model';

class GameListItem extends Component {

  props: {
    game: GameChannel,
    room: ?Room,
    onSelect: number => any
  };

  render() {
    let {game, room} = this.props;
    let type;
    let rules;
    if (game.initialProposal) {
      rules = game.initialProposal.rules;
      type = game.initialProposal.gameType;
    } else {
      rules = game.rules;
      type = game.type;
    }
    let className = 'GameList-item' + (
      (game.adjourned ? ' GameList-item-adjourned' : '') +
      (game.event ? ' GameList-item-event' : '') +
      (game.type === 'challenge' ? ' GameList-item-challenge' : ' GameList-item-active')
    );
    return (
      <A className={className} onClick={this._onSelect}>
        <div className='GameList-item-type'>
          <GameTypeIcon
            type={type}
            subscribersOnly={game.subscribers}
            isPrivate={game.private} />
        </div>
        <div className='GameList-item-players'>
          <GamePlayersList
            players={game.players}
            winner={getWinningColor(game.score)} />
        </div>
        <div className='GameList-item-info'>
          {game.over && game.score ?
            <div className='GameList-item-result'>
              {formatGameScore(game.score)}
            </div> :
            (game.type !== 'challenge' ?
              <div className='GameList-item-move'>
                {game.moveNum ? `Mv ${game.moveNum}` : null}
              </div> : null)}
          {game.type !== 'challenge' ?
            <div className='GameList-item-observers'>
              {game.observers ? `Ob ${game.observers}` : null}
            </div> : null}
          {rules ?
            <div className='GameList-item-rules'>
              <GameRulesDisplay rules={rules} />
            </div> : null}
          {game.name ?
            <div className='GameList-item-name'>
              {game.name}
            </div> : null}
        </div>
        {room ?
          <div className='GameList-item-room'>
            {room.name || 'Automatch'}
          </div> : null}
      </A>
    );
  }

  _onSelect = () => {
    this.props.onSelect(this.props.game.id);
  }
}

export default class GameList extends Component {

  props: {
    games: Array<GameChannel>,
    filter: GameFilter,
    roomsById: Index<Room>,
    onSelect: number => any
  };

  state = {
    fullRender: false
  };

  componentDidMount() {
    let {games} = this.props;
    if (games.length > 20) {
      setTimeout(() => {
        this.setState({fullRender: true});
      }, 32);
    }
  }

  render() {
    let {games, filter, roomsById, onSelect} = this.props;
    let {fullRender} = this.state;
    let displayGames;
    if (Object.keys(filter).length) {
      displayGames = games.filter(game => {
        if (filter.roomId && game.roomId !== filter.roomId) {
          return false;
        }
        if (filter.excludeBots) {
          let hasBot = Object.keys(game.players)
            .map((role: any) => game.players[role])
            .find(user => user && user.flags && user.flags.robot);
          return !hasBot;
        }
        return true;
      });
    } else {
      displayGames = games;
    }

    if (!fullRender) {
      displayGames = displayGames.slice(0, 20);
    }

    return (
      <div className='GameList'>
        {displayGames.length ?
          displayGames.map(game =>
            <GameListItem
              key={game.id}
              game={game}
              room={roomsById[game.roomId]}
              onSelect={onSelect} />
          ) :
          <div className='GameList-empty'>
            None
          </div>}
      </div>
    );
  }

}
