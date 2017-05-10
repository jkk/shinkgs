// @flow
import React, {PureComponent as Component} from 'react';
import {isTouchDevice} from '../../util/dom';
import type {Conversation} from '../../model';

type Props = {
  conversation: ?Conversation,
  onSubmit: string => any;
  onDraft?: string => any;
};

type State = {
  draft: string
};

export default class ChatMessageBar extends Component {

  props: Props;
  state: State = {draft: ''};

  _input: ?HTMLInputElement;

  componentDidUpdate(prevProps: Props) {
    let prevConvoId = prevProps.conversation && prevProps.conversation.id;
    let convoId = this.props.conversation && this.props.conversation.id;
    let newDraft = this.props.conversation && this.props.conversation.draft;
    if (convoId !== prevConvoId && this._input && !isTouchDevice()) {
      this._input.focus();
      this.setState({draft: newDraft || ''});
    }
  }

  _onChange = (event: SyntheticEvent) => {
    let target: EventTarget = event.target;
    if (target instanceof HTMLInputElement) {
      this.setState({draft: target.value});
      if (this.props.onDraft) {
        this.props.onDraft(target.value);
      }
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
    return (
      <div className='ChatMessageBar'>
        <div className='ChatMessageBar-inner'>
          <form action='#' method='post' onSubmit={this._onSubmit}>
            <input
              ref={this._setInputRef}
              className='ChatMessageBar-input'
              type='text'
              placeholder={placeholder}
              value={this.state.draft}
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
