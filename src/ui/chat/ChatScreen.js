// @flow
import React, {PureComponent as Component} from 'react';
import ChatRoomList from './ChatRoomList';
import ChatUnseenBadge from './ChatUnseenBadge';
import RoomChat from './RoomChat';
import UserChat from './UserChat';
import {A, Icon, Modal} from '../common';
import UserName from '../user/UserName';
import UserList from '../user/UserList';
import {sortUsers, getUserStatusText} from '../../model/user';
import {isMobileScreen} from '../../util/dom';
import type {
  Room,
  User,
  Conversation,
  Index,
  ChannelMembership,
  GameChannel,
  AppActions
} from '../../model';

class ChatTab extends Component {

  props: {
    conversation: Conversation,
    active: boolean,
    room?: ?Room,
    user?: ?User,
    onSelect: number => any,
    onClose: number => any
  };

  render() {
    let {
      conversation,
      user,
      room,
      active
    } = this.props;
    let label;
    if (user) {
      label = (
        <div className='ChatScreen-tab-user-name'>
          <UserName user={user} />
        </div>
      );
    } else if (room) {
      label = (
        <div className='ChatScreen-tab-room-name'>
          {room.name}{room.private ? ' 🔒' : null}
        </div>
      );
    } else {
      label = '[Empty]';
    }
    return (
      <div className={'ChatScreen-tab' + (active ? ' ChatScreen-tab-active' : '')}>
        <A className='ChatScreen-tab-label' onClick={this._onSelect}>
          <div className='ChatScreen-tab-name'>
            {conversation.unseenCount ?
              <div className='ChatScreen-tab-badge'>
                <ChatUnseenBadge
                  conversationsById={{[conversation.id]: conversation}} />
              </div> : null}
            {label}
          </div>
          <div className='ChatScreen-tab-info'>
            {room ?
              (room.users ? <div>{room.users.length} users</div> : '...') :
              (user ? getUserStatusText(user) : null)}
          </div>
        </A>
        <A className='ChatScreen-tab-close' onClick={this._onClose}>
          &times;
        </A>
      </div>
    );
  }

  _onSelect = () => {
    this.props.onSelect(this.props.conversation.id);
  }

  _onClose = () => {
    this.props.onClose(this.props.conversation.id);
  }
}

class ChatScreenBanner extends Component {

  props: {
    conversationsById: Index<Conversation>,
    activeRoom: ?Room,
    showingRoomUsers: ?boolean,
    activeUser: ?User,
    onShowList: Function,
    onShowRoomUsers: Function,
    onShowRoomChat: Function
  };

  render() {
    let {
      conversationsById,
      activeRoom,
      showingRoomUsers,
      activeUser,
      onShowList,
      onShowRoomUsers,
      onShowRoomChat
    } = this.props;
    if (showingRoomUsers) {
      return (
        <div className='ChatScreen-banner'>
          <A className='ChatScreen-banner-title' onClick={onShowRoomChat}>
            {activeRoom && activeRoom.users ?
              `${activeRoom.users.length} users` :
              'Room users'}
          </A>
          <div className='ChatScreen-back'>
            <A onClick={onShowRoomChat}>
              <div className='ChatScreen-back-icon'>
                <Icon name='chevron-left' />
              </div>
              <div className='ChatScreen-back-label'>Back</div>
            </A>
          </div>
        </div>
      );
    }
    return (
      <div className='ChatScreen-banner'>
        <A className='ChatScreen-banner-title' onClick={onShowRoomUsers}>
          {activeRoom ?
            <div className='ChatScreen-banner-title-room'>
              {activeRoom.name} {activeRoom.private ? <Icon name='lock' /> : ''}
            </div> :
            (activeUser ?
              <div className='ChatScreen-banner-title-user'>
                <UserName user={activeUser} extraIcons />
              </div> : null)}
        </A>
        <A className='ChatScreen-banner-info' onClick={activeRoom ? onShowRoomUsers : undefined}>
          {activeRoom ?
            <div className='ChatScreen-banner-info-room'>
              {activeRoom.users ?
                <div>{activeRoom.users.length} users</div> : null}
            </div> :
            (activeUser ?
              <div className='ChatScreen-banner-info-user'>
                {getUserStatusText(activeUser)}
              </div> : null)}
        </A>
        <div className='ChatScreen-back'>
          <A onClick={onShowList}>
            <div className='ChatScreen-back-icon'>
              <Icon name='chevron-left' />
            </div>
            <div className='ChatScreen-back-label'>Chats</div>
            <div className='ChatScreen-back-badge'>
              <ChatUnseenBadge
                conversationsById={conversationsById} />
            </div>
          </A>
        </div>
      </div>
    );
  }
}

type Props = {
  currentUser: ?User,
  channelMembership: ChannelMembership,
  roomsById: Index<Room>,
  usersByName: Index<User>,
  conversationsById: Index<Conversation>,
  gamesById: Index<GameChannel>,
  activeConversationId: ?number,
  actions: AppActions
};

type State = {
  roomConvs: Array<Conversation>,
  userConvs: Array<Conversation>,
  activeConv: ?Conversation,
  activeRoom: ?Room,
  activeRoomGames: Array<GameChannel>,
  activeUser: ?User,
  activeConversationId: ?number,
  showingList?: ?boolean,
  showingRoomUsers?: ?boolean,
  showingRoomList?: ?boolean
};

export default class ChatScreen extends Component {

  props: Props;
  state: State = this._getState(this.props);

  _messagesDiv: ?HTMLElement;
  _messageInput: ?HTMLElement;

  _getState(props: Props) {
    let {
      channelMembership,
      activeConversationId,
      conversationsById,
      roomsById,
      usersByName,
      gamesById
    } = props;
    let roomConvs = [];
    let userConvs = [];
    let activeRoomGames = [];
    let activeConv;
    let activeRoom;
    let activeUser;
    for (let chanId of Object.keys(channelMembership)) {
      let chan = channelMembership[chanId];
      let conv = conversationsById[chanId];
      if (!conv || conv.status === 'closed') {
        continue;
      }
      if (chan.type === 'room') {
        if (!activeConversationId) {
          activeConversationId = conv.id;
        }
        if (activeConversationId === conv.id) {
          activeConv = conv;
          activeRoom = roomsById[conv.id];
          for (let gid of Object.keys(gamesById)) {
            if (gamesById[gid].roomId === conv.id) {
              activeRoomGames.push(gamesById[gid]);
            }
          }
        }
        roomConvs.push(conv);
      } else if (chan.type === 'conversation') {
        userConvs.push(conv);
        if (activeConversationId === conv.id && conv.user) {
          activeConv = conv;
          activeUser = usersByName[conv.user];
        }
      }
    }
    return {
      roomConvs,
      userConvs,
      activeConv,
      activeRoom,
      activeRoomGames,
      activeUser,
      activeConversationId
    };
  }

  _setScroll() {
    let {activeConv} = this.state;
    if (activeConv && activeConv.messages.length && document.documentElement) {
      // Hack to scroll div or window depending on if we're on mobile or not
      if (this._messagesDiv && !isMobileScreen()) {
        this._messagesDiv.scrollTop = this._messagesDiv.scrollHeight;
      } else {
        if (this._messageInput) {
          this._messageInput.scrollIntoView(false);
        }
        // window.scrollTo(0, document.documentElement.scrollHeight);
      }
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    let nextState = this._getState(nextProps);
    let nextConvId = nextState.activeConversationId;
    let thisConvId = this.state.activeConversationId;
    let nextLen = nextState.activeConv && nextState.activeConv.messages.length;
    let thisLen = this.state.activeConv && this.state.activeConv.messages.length;
    // TODO - check games
    this.setState(nextState, () => {
      if (nextConvId !== thisConvId || (nextLen || 0) > (thisLen || 0)) {
        this._setScroll();
      }
    });
  }

  componentDidMount() {
    this._setScroll();
    if (this.state.activeConversationId) {
      this.props.actions.markConversationSeen(this.state.activeConversationId);
    }
  }

  componentWillUnmount() {
    if (this.state.activeConversationId) {
      this.props.actions.markConversationSeen(this.state.activeConversationId);
    }
  }

  render() {
    let {
      conversationsById,
      currentUser,
      roomsById,
      usersByName,
      actions
    } = this.props;
    let {
      roomConvs,
      userConvs,
      activeConv,
      activeRoom,
      activeRoomGames,
      activeUser,
      activeConversationId,
      showingList,
      showingRoomUsers,
      showingRoomList
    } = this.state;

    if (!currentUser) {
      throw Error('currentUser is required');
    }

    let users;
    if (showingRoomUsers && activeRoom && activeRoom.users) {
      users = activeRoom.users.map(name => usersByName[name]).filter(u => u);
      sortUsers(users);
    }

    let tabs = roomConvs.map(conv =>
      <ChatTab
        key={conv.id}
        conversation={conv}
        active={activeConversationId === conv.id}
        room={roomsById[conv.id]}
        onSelect={this._onSelectConversation}
        onClose={this._onCloseConversation} />
    ).concat(userConvs.map(conv =>
      <ChatTab
        key={conv.id}
        conversation={conv}
        active={activeConversationId === conv.id}
        user={conv.user ? usersByName[conv.user] : null}
        onSelect={this._onSelectConversation}
        onClose={this._onCloseConversation} />
    ));

    let modal = showingRoomList ? (
      <div className='ChatScreen-rooms-list'>
        <Modal title='Rooms' onClose={this._onCloseRoomList}>
          <ChatRoomList
            roomsById={roomsById}
            onJoinRoom={this._onJoinRoom} />
        </Modal>
      </div>
    ) : null;

    if (showingList) {
      return (
        <div className='ChatScreen'>
          <div className='ChatScreen-list'>
            {tabs}
            <div className='ChatScreen-tab ChatScreen-tab-join'>
              <A className='ChatScreen-tab-label' onClick={this._onShowRoomList}>
                Join Room...
              </A>
            </div>
          </div>
          {modal}
        </div>
      );
    }

    return (
      <div className='ChatScreen'>
        <ChatScreenBanner
          conversationsById={conversationsById}
          activeRoom={activeRoom}
          showingRoomUsers={showingRoomUsers}
          activeUser={activeUser}
          onShowList={this._onShowList}
          onShowRoomUsers={this._onShowRoomUsers}
          onShowRoomChat={this._onShowRoomChat} />
        <div className='ChatScreen-tabs'>
          <div className='ChatScreen-tabs-inner'>
            {tabs}
            <div className='ChatScreen-tab ChatScreen-tab-join'>
              <A className='ChatScreen-tab-label' onClick={this._onShowRoomList}>
                Join Room...
              </A>
            </div>
          </div>
        </div>
        <div className='ChatScreen-active-chat'>
          {activeConv && activeUser ?
            <UserChat
              currentUser={currentUser}
              user={activeUser}
              conversation={activeConv}
              usersByName={usersByName}
              onUserDetail={actions.onUserDetail}
              onSendChat={this._onSendChat}
              setMessagesDivRef={this._setMessagesDivRef}
              setMessageInputRef={this._setMessageInputRef} /> : null}
          {activeConv && activeRoom ?
            (showingRoomUsers ?
              <div className='ChatScreen-room-users'>
                <UserList
                  users={users}
                  onSelectUser={this._onUserDetail} />
              </div> :
              <RoomChat
                currentUser={currentUser}
                room={activeRoom}
                conversation={activeConv}
                usersByName={usersByName}
                games={activeRoomGames}
                onUserDetail={actions.onUserDetail}
                onShowGames={actions.onShowGames}
                onJoinGame={actions.onJoinGame}
                onSelectChallenge={actions.onSelectChallenge}
                onSendChat={this._onSendChat}
                setMessagesDivRef={this._setMessagesDivRef}
                setMessageInputRef={this._setMessageInputRef} />) : null}
        </div>
        {modal}
      </div>
    );
  }

  _setMessagesDivRef = (ref: HTMLElement) => {
    this._messagesDiv = ref;
  }

  _setMessageInputRef = (ref: HTMLElement) => {
    this._messageInput = ref;
  }

  _onSelectConversation = (conversationId: number) => {
    this.setState({showingList: false});
    this.props.actions.onSelectConversation(conversationId);
  }

  _onCloseConversation = (conversationId: number) => {
    this.props.actions.onCloseConversation(conversationId);
  }

  _onSendChat = (body: string) => {
    let {activeConversationId, activeUser} = this.state;
    if (!activeConversationId) {
      return;
    }
    if (activeUser && (!activeUser.flags || !activeUser.flags.connected)) {
      return;
    }
    this.props.actions.onSendChat(body, activeConversationId);
  }

  _onShowList = () => {
    this.setState({showingList: true}, () => {
      window.scrollTo(0, 0);
    });
  }

  _onShowRoomUsers = () => {
    this.setState({showingRoomUsers: true}, () => {
      window.scrollTo(0, 0);
    });
  }

  _onShowRoomChat = () => {
    this.setState({showingRoomUsers: false}, () => {
      this._setScroll();
    });
  }

  _onShowRoomList = () => {
    this.props.actions.onFetchRoomList();
    this.setState({showingRoomList: true});
  }

  _onCloseRoomList = () => {
    this.setState({showingRoomList: false});
  }

  _onJoinRoom = (room: Room) => {
    this._onCloseRoomList();
    this.props.actions.onJoinRoom(room);
  }

  _onUserDetail = (user: User) => {
    this.props.actions.onUserDetail(user.name);
  }

}
