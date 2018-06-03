// @flow
import React, { PureComponent as Component } from "react";
import type { Element } from "react";
import { A } from "../common";
import GameTypeIcon from "./GameTypeIcon";
import GamePlayersList from "./GamePlayersList";
import GameRulesDisplay from "./GameRulesDisplay";
import UserName from "../user/UserName";
import { formatGameScore, getWinningColor } from "../../model/game";
import { formatLocaleDateTime } from "../../util/date";
import { Modal, CheckboxInput } from "../common";
import type { ChannelMembership, GameSummary, Index, Room } from "../../model";

type GameSummaryListItemProps = {
  game: GameSummary,
  player?: string,
  onSelect: (game: GameSummary) => any,
};

class GameSummaryListItem extends Component<GameSummaryListItemProps> {
  render() {
    let { game, player } = this.props;
    let type = game.type;
    let rules = game.rules;
    let winningColor = getWinningColor(game.score);
    let winningPlayer = winningColor && game.players[winningColor];
    let won = winningPlayer && winningPlayer.name === player;
    let className =
      "GameSummaryList-item" +
      (won
        ? " GameSummaryList-item-won"
        : player && winningColor
          ? " GameSummaryList-item-lost"
          : "");
    let playingNow = game.inPlay && !winningColor;
    return (
      <A className={className} onClick={this._onSelect}>
        <div className="GameSummaryList-item-type">
          <GameTypeIcon type={type} isPrivate={game.private} />
        </div>
        <div className="GameSummaryList-item-players">
          <GamePlayersList players={game.players} winner={winningColor} />
        </div>
        <div className="GameSummaryList-item-info">
          {playingNow ? (
            <div className="GameSummaryList-item-date-now">Playing now</div>
          ) : (
            <div>
              <div className="GameSummaryList-item-result-rules">
                {game.score ? (
                  <div className="GameSummaryList-item-result">
                    {formatGameScore(game.score)}
                  </div>
                ) : null}
                {rules ? (
                  <div className="GameSummaryList-item-rules">
                    <GameRulesDisplay rules={rules} />
                  </div>
                ) : null}
              </div>
              <div className="GameSummaryList-item-date">
                {formatLocaleDateTime(game.timestamp)}
              </div>
            </div>
          )}
        </div>
      </A>
    );
  }

  _onSelect = () => {
    this.props.onSelect(this.props.game);
  };
}

type Props = {
  games: Array<GameSummary>,
  channelMembership: ChannelMembership,
  player?: string,
  roomsById: Index<Room>,
  onSelect: (
    game: GameSummary,
    channelId?: string,
    loadPrivate?: boolean
  ) => any,
};

type State = {
  fullRender: boolean,
  showLoadGameModal: boolean,
  selectedGame?: GameSummary,
  loadPrivate: boolean,
};

export default class GameSummaryList extends Component<Props, State> {
  state = {
    fullRender: false,
    showLoadGameModal: false,
    selectedGame: undefined,
    loadPrivate: true,
  };

  componentDidMount() {
    let { games } = this.props;
    if (games.length > 15) {
      setTimeout(() => {
        this.setState({ fullRender: true });
      }, 0);
    }
  }

  render() {
    let { games, player } = this.props;
    let {
      fullRender,
      showLoadGameModal,
      selectedGame,
      loadPrivate,
    } = this.state;

    // Game-load modal title.
    let title = selectedGame && (
      <div className="GameSummaryList-load-title">
        <UserName user={selectedGame.players.white} />
        {" vs. "}
        <UserName user={selectedGame.players.black} />
      </div>
    );

    if (!fullRender) {
      games = games.slice(0, 15);
    }
    return (
      <div className="GameSummaryList">
        {showLoadGameModal && (
          <Modal title={title} onClose={this._closeGameModal}>
            <div className="GameSummaryList-load-game">
              <CheckboxInput
                label="Private"
                checked={loadPrivate}
                onClick={this._toggleLoadPrivate}
              />
              <h4>Load game into:</h4>
              <div className="GameSummaryList-load-game-list">
                {this._getRoomList(selectedGame)}
              </div>
            </div>
          </Modal>
        )}
        {games.map(game => (
          <GameSummaryListItem
            key={game.timestamp}
            game={game}
            player={player}
            onSelect={() => {
              this._onSelect(game);
            }}
          />
        ))}
      </div>
    );
  }

  _closeGameModal = () => {
    this.setState({ showLoadGameModal: false });
  };

  _onSelect = (game: GameSummary) => {
    const { onSelect } = this.props;

    if (game.inPlay) {
      // If the game is in play, we don't want to show the modal and instead
      // just select the game. This should load it up automatically.
      onSelect(game);
    } else {
      this.setState({
        showLoadGameModal: true,
        selectedGame: game,
      });
    }
  };

  _toggleLoadPrivate = () => {
    this.setState({ loadPrivate: !this.state.loadPrivate });
  };

  _getRoomList = (game?: GameSummary): Array<Element<"div">> => {
    const { channelMembership, roomsById, onSelect } = this.props;
    const { loadPrivate } = this.state;

    // Get room-channel IDs.
    const roomIds = Object.keys(channelMembership).reduce((ids, channelID) => {
      if (channelMembership[channelID].type === "room") {
        ids.push(channelID);
        return ids;
      }
      return ids;
    }, []);

    const rooms = roomIds.map(id => (
      <div key={id} className="GameSummaryList-load-game-item">
        <A
          button
          onClick={() => {
            game && onSelect(game, id, loadPrivate);
          }}>
          {roomsById[id].name}
        </A>
      </div>
    ));

    return rooms;
  };
}
