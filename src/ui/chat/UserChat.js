// @flow
import React, {PureComponent as Component} from 'react';
import ChatMessages from './ChatMessages';
import ChatMessageBar from './ChatMessageBar';
import {Button} from '../common';
import UserIcons from '../user/UserIcons';
import {getUserStatusText} from '../../model/user';
import type {
  User,
  Conversation,
  Index
} from '../../model';

export default class UserChat extends Component {

  props: {
    currentUser: User,
    user: User,
    conversation: Conversation,
    usersByName: Index<User>,
    onUserDetail: string => any,
    onSendChat: string => any,
    onDraftChat: string => any,
    setMessagesDivRef: HTMLElement => any,
    setMessageInputRef: HTMLElement => any
  };

  render() {
    let {
      currentUser,
      user,
      conversation,
      usersByName,
      onUserDetail,
      onSendChat,
      onDraftChat,
      setMessagesDivRef,
      setMessageInputRef
    } = this.props;
    let info;
    if (conversation.chatsDisabled || (user.flags && !user.flags.connected)) {
      info = '[Chat disabled]';
    } else {
      info = (
        <div>
          <div className='UserChat-icons'>
            <UserIcons user={user} />
          </div>
          <div className='UserChat-info-status'>
            {getUserStatusText(user)}
          </div>
        </div>
      );
    }
    return (
      <div className='UserChat'>
        <div className='UserChat-view-profile'>
          <Button small secondary onClick={this._onViewProfile}>View Profile</Button>
        </div>
        <div className='UserChat-info'>
          {info}
        </div>
        <div className='UserChat-messages' ref={setMessagesDivRef}>
          <ChatMessages
            currentUser={currentUser}
            messages={conversation.messages}
            usersByName={usersByName}
            onUserDetail={onUserDetail} />
        </div>
        <div className='UserChat-message-bar' ref={setMessageInputRef}>
          <ChatMessageBar
            conversation={conversation}
            onDraft={onDraftChat}
            onSubmit={onSendChat} />
        </div>
      </div>
    );
  }

  _onViewProfile = () => {
    this.props.onUserDetail(this.props.user.name);
  }
}
