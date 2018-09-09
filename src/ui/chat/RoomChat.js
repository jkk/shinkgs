// @flow
import React, {PureComponent as Component} from 'react';
import ChatMessages from './ChatMessages';
import ChatMessageBar from './ChatMessageBar';
import RoomGameLinks from './RoomGameLinks';
import {RichContent} from '../common';
import UserList from '../user/UserList';
import {sortUsers} from '../../model/user';
import {isMobileScreen} from '../../util/dom';
import type {
  Room,
  User,
  Conversation,
  Index,
  GameChannel,
  GameFilter
} from '../../model';

export default class RoomChat extends Component<> {
  static defaultProps: {
    currentUser: User,
    room: Room,
    conversation: Conversation,
    usersByName: Index<User>,
    games?: ?Array<GameChannel>,
    onUserDetail: string => any,
    onJoinGame: (gameId: number | string) => any,
    onSelectChallenge: number => any,
    onShowGames: (filter: GameFilter) => any,
    onSendChat: string => any,
    setMessagesDivRef: HTMLElement => any,
    setMessageInputRef: HTMLElement => any
  };

  render() {
    let {
      currentUser,
      room,
      conversation,
      usersByName,
      games,
      onUserDetail,
      onSendChat,
      onJoinGame,
      onSelectChallenge,
      setMessagesDivRef,
      setMessageInputRef
    } = this.props;
    let users;
    if (room.users) {
      users = room.users.map(name => usersByName[name]).filter(u => u);
      sortUsers(users);
    }
    return (
      <div className='RoomChat'>
        <div className='RoomChat-messages-container' ref={setMessagesDivRef}>
          <div className='RoomChat-desc'>
            {room.description ?
              <div className='RoomChat-desc-text'>
                <RichContent
                  content={room.description.replace(/[\r\n]+$/, '')}
                  firstLineHeading />
                {games && games.length ?
                  <RoomGameLinks
                    games={games}
                    onSelect={this._onShowGames}/> : null }
              </div> : null}
          </div>
          <div className='RoomChat-messages'>
            <ChatMessages
              currentUser={currentUser}
              messages={conversation.messages}
              usersByName={usersByName}
              games={games && games.length < 20 ? games : null}
              onUserDetail={onUserDetail}
              onJoinGame={onJoinGame}
              onSelectChallenge={onSelectChallenge} />
          </div>
        </div>
        <div className='RoomChat-message-bar' ref={setMessageInputRef}>
          <ChatMessageBar
            conversation={conversation}
            onSubmit={onSendChat} />
        </div>
        {!isMobileScreen() ?
          <div className='RoomChat-sidebar'>
            <div className='RoomChat-users'>
              {users ?
                <UserList
                  users={users}
                  onSelectUser={this._onUserDetail} /> : null}
            </div>
          </div> : null}
      </div>
    );
  }

  _onUserDetail = (user: User) => {
    this.props.onUserDetail(user.name);
  }

  _onShowGames = (games: Array<GameChannel>) => {
    let filter: GameFilter = {
      roomId: this.props.room.id,
      type: games.length && games[0].type === 'challenge' ? 'challenge' : 'game'
    };
    this.props.onShowGames(filter);
  }
}
