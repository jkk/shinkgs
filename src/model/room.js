// @flow
import type {
  AppState,
  KgsMessage,
  Room,
  ChannelMembership,
  Index
} from './types';

export function getDefaultRoom(
  channelMembership: ChannelMembership,
  roomsById: Index<Room>
) {
  let rooms = Object.keys(channelMembership)
    .filter(id => channelMembership[id].type === 'room' && roomsById[id])
    .map(id => roomsById[id]);
  // TODO - hack
  return rooms.find(r => r.name === 'English Game Room') || rooms[0];
}

function updateRoom(room: ?Room, values: Object): Room {
  let newRoom: Object = room ? { ...room } : {};
  if (values.channelId) {
    newRoom.id = values.channelId;
  }
  if (values.owners) {
    newRoom.owners = values.owners.map(o => o.name);
  }
  if (values.users) {
    newRoom.users = values.users.map(u => u.name);
  }
  for (let key of [
    'name',
    'description',
    'category',
    'private',
    'tournOnly',
    'globalGamesOnly'
  ]) {
    if (key in values) {
      newRoom[key] = values[key];
    }
  }
  return newRoom;
}

export function handleRoomMessage(
  prevState: AppState,
  msg: KgsMessage
): AppState {
  let chanId = msg.channelId;
  if (msg.type === 'ROOM_NAMES' || msg.type === 'LOGIN_SUCCESS') {
    let roomsById: Index<Room> = { ...prevState.roomsById };
    for (let room of msg.rooms) {
      roomsById[room.channelId] = updateRoom(roomsById[room.channelId], room);
    }
    let nextState: AppState = { ...prevState, roomsById };
    return nextState;
  } else if (
    (msg.type === 'ROOM_DESC' || msg.type === 'ROOM_CHANNEL_INFO') &&
    chanId
  ) {
    let roomsById: Index<Room> = { ...prevState.roomsById };
    roomsById[chanId] = updateRoom(roomsById[chanId], msg);
    return { ...prevState, roomsById };
  } else if (msg.type === 'ROOM_JOIN' && chanId) {
    // Room info
    let roomsById: Index<Room> = { ...prevState.roomsById };
    let room: Room = updateRoom(roomsById[chanId], msg);
    roomsById[chanId] = room;

    // Channel membership
    let channelMembership: ChannelMembership = {
      ...prevState.channelMembership
    };
    channelMembership[chanId] = { type: 'room', complete: false, stale: false };

    // FIXME - hack
    let activeConversationId =
      !prevState.activeConversationId && room.name === 'English Game Room'
        ? chanId
        : prevState.activeConversationId;

    return { ...prevState, roomsById, channelMembership, activeConversationId };
  } else if (
    msg.type === 'ROOM_NAME_FLUSH' &&
    chanId &&
    prevState.channelMembership[chanId]
  ) {
    let chanMem: ChannelMembership = { ...prevState.channelMembership };
    chanMem[chanId].stale = true;
    return { ...prevState, channelMembership: chanMem };
  } else if (
    msg.type === 'USER_REMOVED' &&
    chanId &&
    prevState.roomsById[chanId]
  ) {
    let roomsById: Index<Room> = { ...prevState.roomsById };
    let users = roomsById[chanId].users;
    if (!users) {
      return prevState;
    }
    roomsById[chanId] = {
      ...roomsById[chanId],
      users: users.filter(name => name !== msg.user.name)
    };
    return { ...prevState, roomsById };
  } else if (
    msg.type === 'USER_ADDED' &&
    chanId &&
    prevState.roomsById[chanId]
  ) {
    let roomsById: Index<Room> = { ...prevState.roomsById };
    let users = roomsById[chanId].users;
    if (!users || users.find(name => name === msg.user.name)) {
      return prevState;
    }
    roomsById[chanId] = {
      ...roomsById[chanId],
      users: [...users, msg.user.name]
    };
    return { ...prevState, roomsById };
  }
  return prevState;
}
