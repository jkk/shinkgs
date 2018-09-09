// @flow
import React, { PureComponent as Component } from "react";
import GameClock from "./GameClock";
import UserName from "../user/UserName";
import UserAvatar from "../user/UserAvatar";
import BoardStone from "../board/BoardStone";
import { A, Icon } from "../common";
import { getWinningColor } from "../../model/game";
import type { GameChannel, GameRules, User, ClockState } from "../../model";

type Props = {
  nodeId: ?number,
  color: "white" | "black" | "owner",
  winner: boolean,
  owner: ?User,
  player1: ?User,
  player2: ?User,
  clock: ?ClockState,
  gameRules: ?GameRules,
  captures: number,
  timeLeft: number,
  gameActive: boolean,
  onUserDetail: User => any
};

class GamePlayersInfoColor extends Component<Props> {
  render() {
    let {
      nodeId,
      color,
      winner,
      owner,
      player1,
      player2,
      clock,
      gameRules,
      captures,
      timeLeft,
      gameActive
    } = this.props;
    if (!player1 && !player2) {
      return null;
    }
    let className =
      "GamePlayersInfo-color GamePlayersInfo-" +
      color +
      (winner ? " GamePlayersInfo-winner" : "");
    let icon;
    if (color === "white") {
      icon = "⚪️";
    } else if (color === "black") {
      icon = "⚫️";
    }
    if (owner && player1 && owner.name === player1.name) {
      icon = "✏️" + (icon || "");
    }
    return (
      <div className={className}>
        <div className="GamePlayersInfo-avatar">
          <A onClick={this._onClickPlayer1}>
            <UserAvatar user={player1} />
          </A>
        </div>
        <div className="GamePlayersInfo-players">
          {player1 ? (
            <div className="GamePlayersInfo-player1">
              <div className="GamePlayersInfo-players-icon">
                {color === "white" || color === "black" ? (
                  <BoardStone color={color} />
                ) : (
                  <div>{icon}</div>
                )}
              </div>
              <A onClick={this._onClickPlayer1}>
                <UserName user={player1} />
              </A>
            </div>
          ) : null}
          {player2 ? (
            <div className="GamePlayersInfo-player2">
              <A onClick={this._onClickPlayer2}>
                <UserName user={player2} />
              </A>
            </div>
          ) : null}
        </div>
        {color !== "owner" ? (
          <div className="GamePlayersInfo-captures-clock">
            <div className="GamePlayersInfo-captures">{captures} captures</div>
            <div className="GamePlayersInfo-winner-clock">
              {clock ? (
                <div className="GamePlayersInfo-clock">
                  <GameClock
                    nodeId={nodeId}
                    active={gameActive}
                    clock={clock}
                    timeLeft={timeLeft}
                    gameRules={gameRules}
                  />
                </div>
              ) : null}
              {winner ? (
                <div className="GamePlayersInfo-winner-badge">
                  <Icon name="check" /> Winner
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="GamePlayersInfo-role">Game Owner</div>
        )}
      </div>
    );
  }

  _onClickPlayer1 = () => {
    if (this.props.player1) {
      this.props.onUserDetail(this.props.player1);
    }
  };

  _onClickPlayer2 = () => {
    if (this.props.player2) {
      this.props.onUserDetail(this.props.player2);
    }
  };
}

type GamePlayersInfoProps = {
  game: GameChannel,
  onUserDetail: User => any
};

export default class GamePlayersInfo extends Component<GamePlayersInfoProps> {
  render() {
    let { game, onUserDetail } = this.props;
    let players = game.players;
    let winner = getWinningColor(game.score);
    if (!players) {
      return null;
    }
    let white1 = players.white;
    let white2 = players.white_2;
    let black1 = players.black;
    let black2 = players.black_2;
    let color1 = "white";
    if (!white1 && !white2 && !black1 && !black2) {
      white1 = players.owner;
      color1 = "owner";
    }
    let computedState;
    let nodeId;
    let gameActive;
    if (game.tree) {
      nodeId = game.tree.currentNode;
      computedState = game.tree.computedState[nodeId];
      gameActive = !game.over && nodeId === game.tree.activeNode;
    } else {
      gameActive = false;
    }
    let className =
      "GamePlayersInfo" + (white2 && black2 ? " GamePlayersInfo-rengo" : "");
    return (
      <div className={className}>
        <GamePlayersInfoColor
          nodeId={nodeId}
          color={color1}
          winner={winner === "white"}
          player1={white1}
          player2={white2}
          owner={players.owner}
          captures={computedState ? computedState.whiteCaptures : 0}
          timeLeft={computedState ? computedState.whiteTimeLeft : -1}
          gameActive={gameActive}
          clock={game.clocks && game.clocks[color1]}
          gameRules={game.rules}
          onUserDetail={onUserDetail}
        />
        <GamePlayersInfoColor
          nodeId={nodeId}
          color="black"
          winner={winner === "black"}
          player1={black1}
          player2={black2}
          owner={players.owner}
          captures={computedState ? computedState.blackCaptures : 0}
          timeLeft={computedState ? computedState.blackTimeLeft : -1}
          gameActive={gameActive}
          clock={game.clocks && game.clocks.black}
          gameRules={game.rules}
          onUserDetail={onUserDetail}
        />
      </div>
    );
  }
}
