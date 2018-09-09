// @flow
import React, {PureComponent as Component} from 'react';
import type { Children } from 'react';
import GameTimeSystem from './GameTimeSystem';
import {formatGameType, formatGameRuleset} from '../../model/game';
import type {
  GameChannel,
  Room,
  Index
} from '../../model';

export default class GameInfo extends Component<> {
  static defaultProps: {
    game: GameChannel,
    roomsById: Index<Room>,
    children?: Children,
  };

  render() {
    let {game, roomsById, children} = this.props;
    let rules = game.rules;
    let room = roomsById[game.roomId];
    let rows = [];
    if (game.name) {
      rows.push(
        <tr key='name'>
          <th>Name</th>
          <td>{game.name}</td>
        </tr>
      );
    }
    rows.push(
      <tr key='type'>
        <th>Type</th>
        <td>
          {formatGameType(game.type)}
        </td>
      </tr>
    );
    if (rules) {
      if (rules.handicap) {
        rows.push(
          <tr key='handicap'>
            <th>Handi</th>
            <td>{rules.handicap}</td>
          </tr>
        );
      }
      rows.push(
        <tr key='komi'>
          <th>Komi</th>
          <td>{rules.komi}</td>
        </tr>
      );
      if (rules.timeSystem) {
        rows.push(
          <tr key='time'>
            <th>Time</th>
            <td><GameTimeSystem rules={rules} /></td>
          </tr>
        );
      }
      if (rules.rules) {
        rows.push(
          <tr key='rules'>
            <th>Rules</th>
            <td>{formatGameRuleset(rules.rules)}</td>
          </tr>
        );
      }
    }
    if (room && room.name) {
      rows.push(
        <tr key='room'>
          <th>Room</th>
          <td>{room.name}</td>
        </tr>
      );
    }
    return (
      <div className='GameInfo'>
        <table className='GameInfo-table'>
          <tbody>
            {rows}
            {children}
          </tbody>
        </table>
      </div>
    );
  }
}
