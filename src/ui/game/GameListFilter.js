// @flow
import React, { PureComponent as Component } from "react";
import { A, SelectInput, CheckboxInput } from "../common";
import type { GameChannel, GameFilter, Index, Room } from "../../model";

type Props = {
  games: Array<GameChannel>,
  roomsById: Index<Room>,
  filter: GameFilter,
  onChange: (GameFilter) => any,
};

export default class GameListFilter extends Component<Props> {
  render() {
    let { games, roomsById, filter } = this.props;

    let gameRoomsById = {};
    for (let g of games) {
      if (g.roomId && !gameRoomsById[g.roomId]) {
        gameRoomsById[g.roomId] = {
          id: g.roomId,
          name: roomsById[g.roomId] && roomsById[g.roomId].name,
          count: 1,
        };
      } else {
        gameRoomsById[g.roomId].count++;
      }
    }
    let rooms = Object.keys(gameRoomsById)
      .map((id) => gameRoomsById[id])
      .filter((g) => g.name);
    rooms.sort((a, b) => b.count - a.count);

    let roomSelectClass =
      "GameListFilter-room-select" +
      (" GameListFilter-room-select-" +
        (filter.roomId ? "active" : "inactive"));
    let gameTypeLabel =
      games[0] && games[0].type === "challenge" ? "Challenges" : "Games";

    return (
      <div className="GameListFilter">
        <div className="GameListFilter-room">
          <div className={roomSelectClass}>
            <SelectInput
              onChange={this._onChangeRoom}
              value={filter.roomId || ""}>
              <option value="">All {gameTypeLabel}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </SelectInput>
            {filter.roomId ? (
              <A
                className="GameListFilter-room-clear"
                onClick={this._onClearRoom}>
                &times;
              </A>
            ) : null}
          </div>
        </div>
        <div className="GameListFilter-bots">
          <CheckboxInput
            label="Bots"
            checked={!filter.excludeBots}
            onChange={this._onChangeBots}
          />
        </div>
      </div>
    );
  }

  _onChangeRoom = (e: Object) => {
    let roomId = parseInt(e.target.value, 10);
    let { games } = this.props;
    let type = games[0] && games[0].type === "challenge" ? "challenge" : "game";
    this.props.onChange({ ...this.props.filter, type, roomId: roomId || null });
  };

  _onChangeBots = (e: Object) => {
    let { games } = this.props;
    let type = games[0] && games[0].type === "challenge" ? "challenge" : "game";
    this.props.onChange({
      ...this.props.filter,
      type,
      excludeBots: !e.target.checked,
    });
  };

  _onClearRoom = () => {
    this.props.onChange({ ...this.props.filter, roomId: null });
  };
}
