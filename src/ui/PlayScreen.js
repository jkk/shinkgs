// @flow
import React, {PureComponent as Component} from 'react';
import {ScreenModal, Button} from './common';
import ChallengeEditor from './game/ChallengeEditor';
import GameList from './game/GameList';
import GameSummaryList from './game/GameSummaryList';
import GameListFilter from './game/GameListFilter';
import GameScreen from './game/GameScreen';
import {InvariantError} from '../util/error';
import {getDefaultRoom} from '../model/room';
import type {
  User,
  GameChannel,
  GameFilter,
  GameSummary,
  Room,
  ChannelMembership,
  Index,
  AppActions
} from '../model';

type Props = {
  currentUser: ?User,
  challenges: Array<GameChannel>,
  playFilter: GameFilter,
  playChallengeId: ?number,
  playGameId: ?number,
  gamesById: Index<GameChannel>,
  unfinishedGames: Array<GameSummary>,
  roomsById: Index<Room>,
  channelMembership: ChannelMembership,
  usersByName: Index<User>,
  actions: AppActions
};

export default class PlayScreen extends Component {

  props: Props;
  state = {
    creatingChallenge: false
  };

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentWillReceiveProps(nextProps: Props) {
    let {playGameId} = this.props;
    let {playGameId: nextPlayGameId} = nextProps;
    let activeGame = playGameId ? this.props.gamesById[playGameId] : null;
    let nextActiveGame = nextPlayGameId ? nextProps.gamesById[nextPlayGameId] : null;
    if (!activeGame && nextActiveGame) {
      // Game started - scroll to top
      window.scrollTo(0, 0);
    }
    let {playChallengeId} = nextProps;
    let {creatingChallenge} = this.state;
    if (creatingChallenge && (nextActiveGame || playChallengeId)) {
      // Challenge creates successfully - don't need UI state to show modal
      this.setState({creatingChallenge: false});
    }
  }

  render() {
    let {
      currentUser,
      challenges,
      playFilter,
      playChallengeId,
      playGameId,
      gamesById,
      unfinishedGames,
      roomsById,
      channelMembership,
      usersByName,
      actions
    } = this.props;
    let {creatingChallenge} = this.state;
    if (!currentUser) {
      throw new InvariantError('currentUser is required');
    }
    let challenge = playChallengeId ? gamesById[playChallengeId] : null;
    let activeGame = playGameId ? gamesById[playGameId] : null;
    let defaultRoom = getDefaultRoom(channelMembership, roomsById);
    return (
      <div className='PlayScreen'>
        {challenge || creatingChallenge ?
          <div className='PlayScreen-challenge'>
            <ScreenModal onClose={this._onCloseChallenge}>
              <ChallengeEditor
                currentUser={currentUser}
                challenge={challenge}
                usersByName={usersByName}
                roomsById={roomsById}
                initialRoomId={defaultRoom.id}
                actions={actions}
                onCancel={this._onCloseChallenge} />
            </ScreenModal>
          </div> : null}
        {activeGame ?
          <div className='PlayScreen-game'>
            <GameScreen
              playing={!activeGame.over}
              game={activeGame}
              usersByName={usersByName}
              roomsById={roomsById}
              currentUser={currentUser}
              actions={actions} />
          </div> :
          <div className='PlayScreen-list'>
            <GameListFilter
              games={challenges}
              roomsById={roomsById}
              filter={playFilter}
              onChange={actions.onShowGames} />
            <div className='PlayScreen-action-buttons'>
              <Button primary icon='plus' onClick={this._onCreateChallenge}>
                Create Challenge
              </Button>
            </div>
            {unfinishedGames.length ?
              <div className='PlayScreen-unfinished-list'>
                <div className='PlayScreen-unfinished-heading'>
                  Unfinished Games
                </div>
                <GameSummaryList
                  games={unfinishedGames}
                  player={currentUser.name}
                  onSelect={this._onSelectGame}/>
              </div> : null}
            <GameList
              games={challenges}
              filter={playFilter}
              roomsById={roomsById}
              onSelect={actions.onSelectChallenge} />
          </div>}
      </div>
    );
  }

  _onCloseChallenge = () => {
    let {playChallengeId} = this.props;
    let {creatingChallenge} = this.state;
    if (playChallengeId) {
      this.props.actions.onCloseChallenge(playChallengeId);
    }
    if (creatingChallenge) {
      this.setState({creatingChallenge: false});
    }
  }

  _onCreateChallenge = () => {
    this.setState({creatingChallenge: true});
  }

  _onSelectGame = (game: GameSummary) => {
    if (game.inPlay) {
      this.props.actions.onJoinGame(game.timestamp);
    } else {
      this.props.actions.onLoadGame(game.timestamp);
    }
  }
}
