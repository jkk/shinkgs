// @flow
import React, { PureComponent as Component } from "react";
import { isTouchDevice } from "../../util/dom";
import type { Conversation } from "../../model";

type Props = {
  conversation: ?Conversation,
  onSubmit: (string) => any,
};

export default class ChatMessageBar extends Component<Props> {
  static defaultProps: Props;
  _input: ?HTMLInputElement;

  componentDidUpdate(prevProps: Props) {
    let prevConvoId = prevProps.conversation && prevProps.conversation.id;
    let convoId = this.props.conversation && this.props.conversation.id;
    if (convoId !== prevConvoId && this._input && !isTouchDevice()) {
      this._input.focus();
    }
  }

  render() {
    let { conversation } = this.props;
    let placeholder;
    if (!conversation || conversation.chatsDisabled) {
      placeholder = "[Chats disabled]";
    } else {
      placeholder = "Type a message...";
    }
    return (
      <div className="ChatMessageBar">
        <div className="ChatMessageBar-inner">
          <form action="#" method="post" onSubmit={this._onSubmit}>
            <input
              ref={this._setInputRef}
              className="ChatMessageBar-input"
              type="text"
              placeholder={placeholder}
              autoFocus={!isTouchDevice()}
            />
          </form>
        </div>
      </div>
    );
  }

  _setInputRef = (ref: HTMLInputElement | null) => {
    this._input = ref;
  };

  _onSubmit = (e: Object) => {
    e.preventDefault();
    let { conversation } = this.props;
    if (
      !conversation ||
      conversation.chatsDisabled ||
      conversation.status !== "created"
    ) {
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
    input.value = "";
    this.props.onSubmit(body);
  };
}
