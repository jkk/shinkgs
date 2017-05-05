// @flow
import React, {PureComponent as Component} from 'react';
import {Modal, Button} from './common';
import ChallengeEditor from './game/ChallengeEditor';
import GameList from './game/GameList';
import GameSummaryList from './game/GameSummaryList';
import GameListFilter from './game/GameListFilter';
import GameScreen from './game/GameScreen';
import {InvariantError} from '../util/error';
import type {
  User,
  GameChannel,
  GameFilter,
  GameProposal,
  GameSummary,
  Room,
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
  usersByName: Index<User>,
  actions: AppActions
};

export default class PlayScreen extends Component {

  props: Props;

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentWillReceiveProps(nextProps: Props) {
    let {playGameId} = this.props;
    let {playGameId: nextPlayGameId} = nextProps;
    let activeGame = playGameId ? this.props.gamesById[playGameId] : null;
    let nextActiveGame = nextPlayGameId ? nextProps.gamesById[nextPlayGameId] : null;
    if (!activeGame && nextActiveGame) {
      window.scrollTo(0, 0);
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
      usersByName,
      actions
    } = this.props;
    if (!currentUser) {
      throw new InvariantError('currentUser is required');
    }
    let challenge = playChallengeId ? gamesById[playChallengeId] : null;
    let activeGame = playGameId ? gamesById[playGameId] : null;
    return (
      <div className='PlayScreen'>
        {challenge ?
          <Modal onClose={this._onCloseChallenge}>
            <ChallengeEditor
              currentUser={currentUser}
              challenge={challenge}
              usersByName={usersByName}
              roomsById={roomsById}
              onUserDetail={actions.onUserDetail}
              onSubmit={this._onSubmitChallenge}
              onCancel={this._onCloseChallenge} />
          </Modal> : null}
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
    if (playChallengeId) {
      this.props.actions.onCloseChallenge(playChallengeId);
    }
  }

  _onCreateChallenge = () => {
    this.props.actions.onShowUnderConstruction();
  }

  _onSubmitChallenge = (proposal: GameProposal) => {
    let {playChallengeId} = this.props;
    if (playChallengeId) {
      this.props.actions.onSubmitChallengeProposal(playChallengeId, proposal);
    }
  }

  _onSelectGame = (game: GameSummary) => {
    if (game.inPlay) {
      this.props.actions.onJoinGame(game.timestamp);
    } else {
      this.props.actions.onLoadGame(game.timestamp);
    }
  }
}
