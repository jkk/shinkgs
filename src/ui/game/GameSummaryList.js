// @flow
import React, { PureComponent as Component } from "react";
import { A } from "../common";
import GameTypeIcon from "./GameTypeIcon";
import GamePlayersList from "./GamePlayersList";
import GameRulesDisplay from "./GameRulesDisplay";
import { formatGameScore, getWinningColor } from "../../model/game";
import { formatLocaleDateTime } from "../../util/date";
import type { GameSummary } from "../../model";

type Props = {
  game: GameSummary,
  player?: string,
  onSelect: (GameSummary) => any,
};

class GameSummaryListItem extends Component<Props> {
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
            <div className="GameSummaryList-item-date-now">
              {game.type === "review" ? "Reviewing" : "Playing now"}
            </div>
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

type GameSummaryListProps = {
  games: Array<GameSummary>,
  player?: string,
  onSelect: (GameSummary) => any,
};

type State = {
  fullRender: boolean,
};

export default class GameSummaryList extends Component<
  GameSummaryListProps,
  State
> {
  state = {
    fullRender: false,
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
    let { games, player, onSelect } = this.props;
    let { fullRender } = this.state;
    if (!fullRender) {
      games = games.slice(0, 15);
    }
    return (
      <div className="GameSummaryList">
        {games.map((game) => (
          <GameSummaryListItem
            key={game.timestamp}
            game={game}
            player={player}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }
}
