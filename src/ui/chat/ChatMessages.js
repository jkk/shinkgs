// @flow
import React, { PureComponent as Component } from "react";
import GameTypeIcon from "../game/GameTypeIcon";
import GamePlayersList from "../game/GamePlayersList";
import GameTimeSystem from "../game/GameTimeSystem";
import { A, RichContent } from "../common";
import UserName from "../user/UserName";
import { formatLocaleTime } from "../../util/date";
import type {
  User,
  ConversationMessage,
  Index,
  GameChannel,
} from "../../model";

type Props = {
  currentUser: User,
  message: ConversationMessage,
  sender: User | string,
  onUserDetail: (string) => any,
};

class ChatMessageItem extends Component<Props> {
  render() {
    let { currentUser, message, sender } = this.props;
    // TODO - for some reason this is null sometimes
    if (!sender) {
      sender = "[Unknown]";
    }
    let className =
      "ChatMessages-item" +
      ((message.announcement ? " ChatMessages-item-announcement" : "") +
        (currentUser.name ===
        (typeof sender === "string" ? sender : sender.name)
          ? " ChatMessages-item-self"
          : ""));
    return (
      <div className={className}>
        <div className="ChatMessages-item-content">
          {typeof sender === "string" ? (
            <div className="ChatMessages-item-user ChatMessages-item-user-unverified">
              <A onClick={this._onUserDetail}>{sender}</A>
            </div>
          ) : (
            <div className="ChatMessages-item-user">
              <A onClick={this._onUserDetail}>
                <UserName user={sender} />
              </A>
            </div>
          )}
          <div className="ChatMessages-item-body">
            <RichContent content={message.body} />
          </div>
        </div>
        {message.date ? (
          <div className="ChatMessages-item-time">
            {message.sending ? "Sending..." : formatLocaleTime(message.date)}
          </div>
        ) : null}
      </div>
    );
  }

  _onUserDetail = () => {
    let { sender } = this.props;
    this.props.onUserDetail(typeof sender === "string" ? sender : sender.name);
  };
}

type PropsChatGameLink = {
  game: GameChannel,
  onSelect: (GameChannel) => any,
};

class ChatGameLink extends Component<PropsChatGameLink> {
  render() {
    let { game } = this.props;
    let className =
      "ChatMessages-game ChatMessages-game-type-" +
      game.type +
      (game.deletedTime ? " ChatMessages-game-deleted" : "");
    return (
      <A className={className} onClick={this._onSelect}>
        <div className="ChatMessages-game-icon">
          <GameTypeIcon
            type={
              game.initialProposal ? game.initialProposal.gameType : game.type
            }
            isPrivate={game.private}
            subscribersOnly={game.subscribers}
          />
        </div>
        <div className="ChatMessages-game-players">
          <GamePlayersList players={game.players} />
        </div>
        <div className="ChatMessages-game-time">
          {game.initialProposal && game.initialProposal.rules ? (
            <GameTimeSystem rules={game.initialProposal.rules} />
          ) : null}
        </div>
        {game.name ? (
          <div className="ChatMessages-game-name">{game.name}</div>
        ) : null}
      </A>
    );
  }

  _onSelect = () => {
    this.props.onSelect(this.props.game);
  };
}

type ChatItem =
  | { id: number, time: number, type: "message", message: ConversationMessage }
  | { id: number, time: number, type: "game", game: GameChannel };

type PropsChatMessages = {
  currentUser: User,
  messages: Array<ConversationMessage>,
  usersByName: Index<User>,
  games?: ?Array<GameChannel>,
  onUserDetail: (string) => any,
  onJoinGame?: (gameId: number | string) => any,
  onSelectChallenge?: (number) => any,
};

export default class ChatMessages extends Component<PropsChatMessages> {
  render() {
    let {
      currentUser,
      messages,
      usersByName,
      games,
      onUserDetail,
    } = this.props;
    let displayMessages;
    if (games && games.length) {
      let itemId = 1;
      let items: Array<ChatItem> = messages.map((msg) => ({
        type: "message",
        id: itemId++,
        time: msg.date ? msg.date.getTime() : 0,
        message: msg,
      }));
      for (let game of games) {
        items.push({
          type: "game",
          id: itemId++,
          time: game.time || 0,
          game: game,
        });
      }
      items.sort((a, b) => a.time - b.time);
      displayMessages = [];
      for (let item of items) {
        if (item.type === "message") {
          displayMessages.push(
            <ChatMessageItem
              currentUser={currentUser}
              key={item.id}
              message={item.message}
              sender={usersByName[item.message.sender] || item.message.sender}
              onUserDetail={onUserDetail}
            />
          );
        } else if (item.type === "game") {
          displayMessages.push(
            <ChatGameLink
              key={item.id}
              game={item.game}
              onSelect={this._onSelectGame}
            />
          );
        }
      }
    } else {
      displayMessages = messages.map((msg) => (
        <ChatMessageItem
          currentUser={currentUser}
          key={msg.id}
          message={msg}
          sender={usersByName[msg.sender] || msg.sender}
          onUserDetail={onUserDetail}
        />
      ));
    }
    return <div className="ChatMessages">{displayMessages}</div>;
  }

  _onSelectGame = (game: GameChannel) => {
    let { onJoinGame, onSelectChallenge } = this.props;
    if (game.deletedTime) {
      return;
    }
    if (game.type === "challenge" && onSelectChallenge) {
      onSelectChallenge(game.id);
    } else if (onJoinGame) {
      onJoinGame(game.id);
    }
  };
}
