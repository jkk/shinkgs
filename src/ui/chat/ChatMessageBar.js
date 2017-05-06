// @flow
import React, {PureComponent as Component} from 'react';
import {isTouchDevice} from '../../util/dom';
import type {Conversation} from '../../model';

type Props = {
  conversation: ?Conversation,
  onSubmit: string => any;
  onDraft?: string => any;
};

export default class ChatMessageBar extends Component {

  props: Props;

  _input: ?HTMLInputElement;

  componentDidUpdate(prevProps: Props) {
    let prevConvoId = prevProps.conversation && prevProps.conversation.id;
    let convoId = this.props.conversation && this.props.conversation.id;
    if (convoId !== prevConvoId && this._input && !isTouchDevice()) {
      this._input.focus();
    }
  }

  _onChange = (event: SyntheticEvent) => {
    let target: EventTarget = event.target;
    if (target instanceof HTMLInputElement && this.props.onDraft) {
      this.props.onDraft(target.value);
    }
  }

  render() {
    let {conversation} = this.props;
    let placeholder;
    if (!conversation || conversation.chatsDisabled) {
      placeholder = '[Chats disabled]';
    } else {
      placeholder = 'Type a message...';
    }
    // FIXME: This draft handling is a workaround for game chat
    // storing conversation state differently from user and room chat.
    // Ideally they'd work the same way and game chat drafts would be
    // saved as well.
    let draft = conversation ? conversation.draft : '';
    return (
      <div className='ChatMessageBar'>
        <div className='ChatMessageBar-inner'>
          <form action='#' method='post' onSubmit={this._onSubmit}>
            <input
              ref={this._setInputRef}
              className='ChatMessageBar-input'
              type='text'
              placeholder={placeholder}
              value={draft === '' ? null : draft}
              onChange={this._onChange}
              autoFocus={!isTouchDevice()} />
          </form>
        </div>
      </div>
    );
  }

  _setInputRef = (ref: HTMLInputElement) => {
    this._input = ref;
  }

  _onSubmit = (e: Object) => {
    e.preventDefault();
    let {conversation} = this.props;
    if (!conversation || conversation.chatsDisabled || conversation.status !== 'created') {
      return;
    }
    let input = this._input;
    if (!input) {
      return;
    }
    let body = input.value.trim();
    if (!body) {
      return;
    }
    input.value = '';
    this.props.onSubmit(body);
  }
}
