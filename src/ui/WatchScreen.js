// @flow
import React, {PureComponent as Component} from 'react';
import GameList from './game/GameList';
import GameListFilter from './game/GameListFilter';
import GameScreen from './game/GameScreen';
import type {
  GameChannel,
  GameFilter,
  Room,
  User,
  Index,
  AppActions
} from '../model';

type Props = {
  currentUser: ?User,
  activeGames: Array<GameChannel>,
  gamesById: Index<GameChannel>,
  watchFilter: GameFilter,
  watchGameId: ?(number | string),
  roomsById: Index<Room>,
  usersByName: Index<User>,
  actions: AppActions
};

export default class WatchScreen extends Component {

  props: Props;

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentWillReceiveProps(nextProps: Props) {
    let {watchGameId} = this.props;
    let {watchGameId: nextWatchGameId} = nextProps;
    let activeGame = watchGameId ? this.props.gamesById[watchGameId] : null;
    let nextActiveGame = nextWatchGameId ? nextProps.gamesById[nextWatchGameId] : null;
    if (!activeGame && nextActiveGame) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    let {
      currentUser,
      activeGames,
      gamesById,
      watchFilter,
      watchGameId,
      roomsById,
      usersByName,
      actions
    } = this.props;
    if (!currentUser) {
      throw Error('currentUser is required');
    }
    let activeGame = watchGameId ? gamesById[watchGameId] : null;
    return (
      <div className='WatchScreen'>
        {activeGame ?
          <div className='WatchScreen-game'>
            <GameScreen
              game={activeGame}
              usersByName={usersByName}
              roomsById={roomsById}
              currentUser={currentUser}
              actions={actions} />
          </div> :
          <div className='WatchScreen-list'>
            <GameListFilter
              games={activeGames}
              roomsById={roomsById}
              filter={watchFilter}
              onChange={actions.onShowGames} />
            <GameList
              games={activeGames}
              filter={watchFilter}
              roomsById={roomsById}
              onSelect={actions.onJoinGame} />
          </div>}
      </div>
    );
  }
}
