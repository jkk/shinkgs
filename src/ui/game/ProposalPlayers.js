// @flow
import React, { PureComponent as Component } from "react";
import { A } from "../common";
import UserName from "../user/UserName";
import BoardStone from "../board/BoardStone";
import NigiriIcon from "../board/NigiriIcon";
import { formatGameRole } from "../../model/game";
import type { GameProposalPlayer, GameType, User, Index } from "../../model";

type Props = {
  player: GameProposalPlayer,
  prevPlayer: ?GameProposalPlayer,
  index: number,
  user: User | string | void,
  nigiri: boolean,
  prevNigiri: boolean | null,
  playerHilite?: boolean,
  onUserDetail: string => any,
  onToggleRole: string => any,
};

class ProposalPlayersItem extends Component<Props> {
  render() {
    let {
      player,
      prevPlayer,
      index,
      user,
      nigiri,
      prevNigiri,
      playerHilite,
    } = this.props;
    let icon;
    if (nigiri) {
      icon = <NigiriIcon />;
    } else if (player.role === "white") {
      icon = <BoardStone color="white" />;
    } else if (player.role === "black") {
      icon = <BoardStone color="black" />;
    }
    let className =
      "ProposalPlayers-item" +
      ((playerHilite ? " ProposalPlayers-item-player-hilite" : "") +
        ((prevNigiri !== null && prevNigiri !== nigiri) ||
        (!nigiri && prevPlayer && prevPlayer.role !== player.role)
          ? " ProposalPlayers-item-role-hilite"
          : ""));
    return (
      <div className={className}>
        <A button className="ProposalPlayers-role" onClick={this._onToggleRole}>
          <div className="ProposalPlayers-role-icon">{icon}</div>
          <div className="ProposalPlayers-role-name">
            {nigiri ? `Player ${index + 1}` : formatGameRole(player.role)}
          </div>
        </A>
        <div className="ProposalPlayers-player">
          <A
            button
            className="ProposalPlayers-player-button"
            onClick={this._onUserDetail}>
            {user ? (
              typeof user === "string" ? (
                user
              ) : (
                <UserName user={user} extraIcons />
              )
            ) : (
              "--"
            )}
          </A>
        </div>
      </div>
    );
  }

  _onUserDetail = () => {
    let { user, onUserDetail } = this.props;
    if (!user) {
      return;
    }
    onUserDetail(typeof user === "string" ? user : user.name);
  };

  _onToggleRole = () => {
    let { user, onToggleRole } = this.props;
    if (!user) {
      return;
    }
    onToggleRole(typeof user === "string" ? user : user.name);
  };
}

type ProposalPlayersProps = {
  currentUser: User,
  players: Array<GameProposalPlayer>,
  prevPlayers: ?Array<GameProposalPlayer>,
  nigiri: boolean,
  prevNigiri: boolean | null,
  gameType: GameType,
  usersByName: Index<User>,
  onUserDetail: string => any,
  onToggleRole: string => any,
};

export default class ProposalPlayers extends Component<ProposalPlayersProps> {
  render() {
    let {
      currentUser,
      players,
      prevPlayers,
      nigiri,
      prevNigiri,
      usersByName,
      onUserDetail,
      onToggleRole,
    } = this.props;
    return (
      <div className="ProposalPlayers">
        {players.map((player, i) => {
          let name = player.user ? player.user.name : player.name;
          return (
            <ProposalPlayersItem
              key={i + "-" + (name || "")}
              player={player}
              prevPlayer={prevPlayers ? prevPlayers[i] : null}
              index={i}
              user={name ? usersByName[name] : name}
              nigiri={nigiri}
              prevNigiri={prevNigiri}
              playerHilite={
                i > 0 && name && currentUser.name !== name ? true : false
              }
              onUserDetail={onUserDetail}
              onToggleRole={onToggleRole}
            />
          );
        })}
      </div>
    );
  }
}
