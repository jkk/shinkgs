// @flow
import React, {PureComponent as Component} from 'react';
import GameInfo from './GameInfo';
import GamePlayersInfo from './GamePlayersInfo';
import GameChat from './GameChat';
import GameMoreMenu from './GameMoreMenu';
import GamePlayActions from './GamePlayActions';
import GameUndoPrompt from './GameUndoPrompt';
import BoardContainer from '../board/BoardContainer';
import BoardNav from '../board/BoardNav';
import UserList from '../user/UserList';
import ChatMessageBar from '../chat/ChatMessageBar';
import {A, Icon} from '../common';
import {
  formatGameScore,
  getGameLine,
  isPlayerMove,
  isGameScoring,
  getGameChatSections,
  getGamePlayerRole,
  getGameRoleColor
} from '../../model/game';
import { sortUsers } from '../../model/user';
import type {
  GameChannel,
  GameChatSection,
  User,
  Room,
  Index,
  AppActions,
  Point,
  BoardPointMark,
  PlayerColor
} from '../../model';

type Props = {
  playing?: boolean,
  game: GameChannel,
  usersByName: Index<User>,
  roomsById: Index<Room>,
  currentUser: User,
  actions: AppActions
};

type State = {
  tab: 'chat' | 'info' | 'users',
  chatSections: Array<GameChatSection>
};

export default class GameScreen extends Component<> {
  static defaultProps: Props;
  state: State = {
    tab: 'chat',
    chatSections: getGameChatSections(this.props.game)
  };

  _chatScrollRef: ?HTMLElement;

  /*  componentWillReceiveProps(nextProps: Props) {
      this.setState({chatSections: getGameChatSections(nextProps.game)});
    }*/

  _setChatScroll = () => {
    setTimeout(() => {
      if (this._chatScrollRef) {
        this._chatScrollRef.scrollTop = this._chatScrollRef.scrollHeight;
      }
    }, 0);
  }

  componentDidMount() {
    if (document.body) {
      document.body.classList.add('GameScreen-body');
    }
    this._setChatScroll();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    let {chatSections} = this.state;
    let {chatSections: prevChatSections} = prevState;
    let lastSection = chatSections.length ? chatSections[chatSections.length - 1] : null;
    let prevLastSection = prevChatSections.length ? prevChatSections[prevChatSections.length - 1] : null;
    if (
      chatSections.length > prevChatSections.length ||
      (lastSection && prevLastSection && (
        lastSection.messages.length > prevLastSection.messages.length ||
        lastSection.actions.length > prevLastSection.actions.length
      ))
    ) {
      this._setChatScroll();
    }
  }

  componentWillUnmount() {
    if (document.body) {
      document.body.classList.remove('GameScreen-body');
    }
  }

  render() {
    let {
      playing,
      currentUser,
      game,
      usersByName,
      roomsById,
      actions
    } = this.props;
    let {tab, chatSections} = this.state;
    let users = game.users ? game.users.map(name => usersByName[name]) : [];
    sortUsers(users);
    let tree = game.tree;
    let moveNum;
    let isOurMove;
    if (playing && tree) {
      let line = getGameLine(tree, tree.activeNode);
      moveNum = line.length - 1;
      isOurMove = isPlayerMove(game, currentUser.name);
    } else {
      isOurMove = false;
    }
    let scoring = isGameScoring(game);
    let isRengo = !!game.players.white_2;
    let className = (
      'GameScreen GameScreen-' +
      (playing ? 'playing' : 'watching') +
      (isRengo ? ' GameScreen-rengo' : '')
    );
    return (
      <div className={className}>
        <div className='GameScreen-header'>
          {playing ? null : (
            <div className='GameScreen-back'>
              <A onClick={this._onLeave}>
                <div className='GameScreen-back-icon'>
                  <Icon name='chevron-left' />
                </div>
                <div className='GameScreen-back-label'>{playing ? 'Leave' : 'Back'}</div>
              </A>
            </div>
          )}
          <div className='GameScreen-title'>
            {game.over || game.score ?
              <div className='GameScreen-title-score'>
                {game.over ? 'Game Over' : ''}
                {game.score ? ': ' + formatGameScore(game.score) : ''}
              </div> :
              <div className='GameScreen-title-name'>
                {game.name || (moveNum ? `Move ${moveNum}` : null)}
              </div>}
          </div>
          {playing ? null :
            <GameMoreMenu
              game={game}
              actions={actions}
              roomsById={roomsById} />}
        </div>
        <div className='GameScreen-main'>
          <BoardContainer
            game={game}
            playing={playing}
            onChangeCurrentNode={actions.onChangeCurrentNode}
            onClickPoint={isOurMove || scoring ? this._onClickPoint : undefined} />
          {game.accessDenied ?
            <div className='GameScreen-access-denied'>
              <div className='GameScreen-access-denied-text'>
                {game.accessDenied}
              </div>
            </div> : null}
          <div className='GameScreen-side-container'>
            {playing ?
              <GamePlayActions
                currentUser={currentUser}
                game={game}
                isOurMove={isOurMove}
                scoring={scoring}
                onPass={actions.onPass}
                onUndo={actions.onUndo}
                onResign={actions.onResign}
                onLeaveGame={this._onLeave}
                onAddTime={actions.onAddGameTime}
                onDoneScoring={actions.onDoneScoring} /> :
              <div className='GameScreen-nav'>
                {tree ?
                  <BoardNav
                    nodeId={tree.currentNode}
                    currentLine={tree.currentLine}
                    onChangeCurrentNode={this._onChangeCurrentNode} /> : null}
              </div>}
            <div className='GameScreen-players-users'>
              <div className='GameScreen-players'>
                <GamePlayersInfo
                  game={game}
                  onUserDetail={this._onUserDetail} />
              </div>
              <div className='GameScreen-tabs'>
                <div className='GameScreen-tabs-inner'>
                  <A
                    className={'GameScreen-tab' + (tab === 'chat' ? ' GameScreen-tab-active' : '')}
                    onClick={this._onShowChat}>
                    Chat
                  </A>
                  <A
                    className={'GameScreen-tab' + (tab === 'info' ? ' GameScreen-tab-active' : '')}
                    onClick={this._onShowInfo}>
                    Info
                  </A>
                  <A
                    className={'GameScreen-tab' + (tab === 'users' ? ' GameScreen-tab-active' : '')}
                    onClick={this._onShowUsers}>
                    {users.length} Observers
                  </A>
                </div>
              </div>
              <div className={'GameScreen-users' + (tab === 'users' ? ' GameScreen-tab-content' : '')}>
                <UserList
                  users={users}
                  onSelectUser={this._onUserDetail} />
              </div>
            </div>
            <div
              className={'GameScreen-chat' + (
                tab === 'chat' || tab === 'info' ?
                  ' GameScreen-tab-content GameScreen-tab-content-' + tab : ''
              )}>
              <div className='GameScreen-chat-scroll' ref={this._setChatScrollRef}>
                {game.tree ?
                  <div className='GameScreen-chat-info'>
                    <GameInfo
                      game={game}
                      roomsById={roomsById} />
                  </div> : null}
                {tab === 'chat' ?
                  <GameChat
                    currentUser={currentUser}
                    chatSections={chatSections}
                    usersByName={usersByName}
                    onUserDetail={actions.onUserDetail} /> : null}
              </div>
            </div>
            <div className={'GameScreen-chat-message-bar' + (tab === 'chat' ? ' GameScreen-tab-content' : '')}>
              <ChatMessageBar
                conversation={{
                  id: 0,
                  messages: [],
                  status: 'created',
                  chatsDisabled: !game.tree
                }}
                onSubmit={this._onChat} />
            </div>
          </div>
        </div>
        {game.undoRequest ?
          <div className='GameScreen-undo-prompt'>
            <GameUndoPrompt
              role={game.undoRequest}
              onAccept={this._onAcceptUndo}
              onDecline={this._onDeclineUndo} />
          </div> : null}
      </div>
    );
  }

  _setChatScrollRef = (ref: HTMLElement) => {
    this._chatScrollRef = ref;
  }

  _onLeave = () => {
    this.props.actions.onLeaveGame(this.props.game);
  }

  _onUserDetail = (user: User) => {
    this.props.actions.onUserDetail(user.name);
  }

  _onChat = (body: string) => {
    this.props.actions.onSendGameChat(body, this.props.game.id);
  }

  _onShowChat = () => {
    this.setState({tab: 'chat'});
  }

  _onShowInfo = () => {
    this.setState({tab: 'info'});
  }

  _onShowUsers = () => {
    this.setState({tab: 'users'});
  }

  _onChangeCurrentNode = (nodeId: number) => {
    this.props.actions.onChangeCurrentNode(this.props.game, nodeId);
  }

  _onClickPoint = (
    game: GameChannel,
    loc: Point,
    locColor?: ?PlayerColor,
    locMark?: ?BoardPointMark
  ) => {
    let scoring = isGameScoring(game);
    if (scoring) {
      let alive = (
        locMark === 'blackTerritory' ||
        locMark === 'whiteTerritory' ||
        locMark === 'dead'
      );
      this.props.actions.onMarkLife(game, loc, alive);
    } else if (!locColor) {
      let role = getGamePlayerRole(this.props.currentUser.name, game.players);
      let playerColor = role && getGameRoleColor(role);
      this.props.actions.onPlayMove(game, loc, playerColor);
    }
  }

  _onAcceptUndo = () => {
    let {game} = this.props;
    if (game.undoRequest) {
      this.props.actions.onAcceptUndo(game, game.undoRequest);
    }
  }

  _onDeclineUndo = () => {
    let {game} = this.props;
    if (game.undoRequest) {
      this.props.actions.onDeclineUndo(game, game.undoRequest);
    }
  }
}
