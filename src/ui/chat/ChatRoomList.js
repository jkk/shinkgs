// @flow
import React, {PureComponent as Component} from 'react';
import {A} from '../common';
import {quoteRegExpPattern} from '../../util/string';
import {isMobileScreen} from '../../util/dom';
import type {
  Room,
  Index
} from '../../model/types';

const CAT_LABELS = {
  'MAIN': 'Main',
  'NATIONAL': 'National',
  'TOURNAMENT': 'Tournaments',
  'FRIENDLY': 'Social',
  'SPECIAL': 'Special',
  'LESSONS': 'Lessons',
  'CLUBS': 'Clubs',
  'TEMPORARY': 'New Rooms',
  'OTHER': 'Other'
};

class ChatRoomListItem extends Component<> {
  static defaultProps: {
    room: Room,
    onJoin: Room => any
  };

  render() {
    let {room} = this.props;
    return (
      <A className='ChatRoomList-room' onClick={this._onJoin}>
        {room.name}{room.private ? ' 🔒' : null}
      </A>
    );
  }

  _onJoin = () => {
    this.props.onJoin(this.props.room);
  }
}

export default class ChatRoomList extends Component<> {
  static defaultProps: {
    roomsById: Index<Room>,
    onJoinRoom: Room => any
  };

  state = {
    search: ('': string)
  };

  render() {
    let {roomsById, onJoinRoom} = this.props;
    let {search} = this.state;
    let searchRegex = search ? new RegExp(quoteRegExpPattern(search), 'gi') : null;
    let roomsByCat = {};
    for (let id of Object.keys(roomsById)) {
      let name = roomsById[id].name;
      if (!name || (searchRegex && !searchRegex.test(name))) {
        continue;
      }
      let cat = roomsById[id].category || 'OTHER';
      if (!roomsByCat[cat]) {
        roomsByCat[cat] = [];
      }
      roomsByCat[cat].push(roomsById[id]);
    }
    for (let cat of Object.keys(roomsByCat)) {
      roomsByCat[cat].sort((a, b) => a.name.localeCompare(b.name));
    }
    return (
      <div className='ChatRoomList'>
        <div className='ChatRoomList-search'>
          <input
            className='ChatRoomList-search-input'
            type='text'
            placeholder='Search Rooms'
            autoFocus={!isMobileScreen()}
            value={search}
            onChange={this._onSearch} />
        </div>
        {Object.keys(roomsByCat).map(catId =>
          <div className='ChatRoomList-cat' key={catId}>
            <div className='ChatRoomList-cat-title'>
              {CAT_LABELS[catId] || 'Other'}
            </div>
            <div className='ChatRoomList-rooms'>
              {roomsByCat[catId].map(room =>
                <ChatRoomListItem
                  key={room.id}
                  room={room}
                  onJoin={onJoinRoom} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  _onSearch = (e: Object) => {
    this.setState({search: e.target.value});
  }
}
