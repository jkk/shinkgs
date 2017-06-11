// @flow
import type {
  AppState,
  KgsMessage,
  User,
  UserFlags,
  Index,
  ChannelMembership,
  RankGraph
} from './types';

import { parseRankGraph } from './channel';

export function userHasRank(user: User) {
  return user.rank && user.rank !== '?';
}

export function userUnranked(user: User) {
  return user.rank === undefined;
}

export function parseRankVal(rank: string) {
  let num = parseInt(rank, 10);
  if (!num) {
    return -9999;
  }
  let type = rank.charAt(rank.length - 1);
  if (type === '?' && rank.length > 1) {
    type = rank.charAt(rank.length - 2);
  }
  if (type === 'k') {
    return -num;
  } else if (type === 'p') {
    return num + 10;
  } else {
    return num;
  }
}

export function getUserStatusText(user: User) {
  let status;
  if (user.flags && user.flags.sleeping) {
    status = 'Idle';
  } else if (user.flags && user.flags.playing) {
    status = 'Playing';
  } else {
    status = user.flags && user.flags.connected ? 'Online' : 'Offline';
  }
  return status;
}

export function getUserAuthName(user: User) {
  switch (user.authLevel) {
  case 'jr_admin': return 'Junior Admin';
  case 'sr_admin': return 'Senior Admin';
  case 'super_admin': return 'Super Admin';
  case 'teacher': return 'Teacher';
  default: return null;
  }
}

export function sortUsers(users: Array<User>) {
  users.sort((a, b) => {
    let cmp = (b.rankVal || 0) - (a.rankVal || 0);
    if (cmp === 0) {
      return a.name.localeCompare(b.name);
    } else {
      return cmp;
    }
  });
}

export function parseUser(user: ?User, values: Object, details?: Object): User {
  let newUser: Object = user ? {...user} : {};
  newUser.rankVal = parseRankVal(values.rank);
  let flagsStr: ?string = values.flags;
  if (typeof flagsStr === 'string') {
    let flags: UserFlags = {};
    for (let c of flagsStr) {
      switch (c) {
      case 'g': flags.guest = true; break;
      case 'c': flags.connected = true; break;
      case 'd': flags.deleted = true; break;
      case 's': flags.sleeping = true; break;
      case 'a': flags.avatar = true; break;
      case 'r': flags.robot = true; break;
      case 'T': flags.tourneyWinner = true; break;
      case 't': flags.tourneyRunnerUp = true; break;
      case 'p': flags.playing = true; break;
      case 'P': flags.playingTourney = true; break;
      case '*': flags.kgsPlus = true; break;
      case '!': flags.kgsMeijin = true; break;
      case '=': flags.canPlayRanked = true; break;
      case '~': flags.selfish = true; break;
      default: break;
      }
    }
    newUser.flags = flags;
  } else if (!newUser.flags) {
    newUser.flags = {};
  }
  for (let key of ['name', 'rank', 'authLevel']) {
    if (key in values) {
      newUser[key] = values[key];
    }
  }
  if (newUser.rank && values.name && values.flags && values.rank === undefined) {
    // Special case for rank removal (e.g. after details update)
    newUser.rank = null;
  }
  if (details) {
    newUser.details = details;
  }
  return newUser;
}

export function handleUserMessage(
  prevState: AppState,
  msg: KgsMessage
): AppState {
  let chanId = msg.channelId;
  if (msg.type === 'ROOM_JOIN' || msg.type === 'GAME_JOIN') {
    let usersByName: Index<User> = {...prevState.usersByName};
    if (msg.users) {
      for (let user of msg.users) {
        usersByName[user.name] = parseUser(usersByName[user.name], user);
      }
    }
    return {...prevState, usersByName};
  } else if (msg.type === 'USER_UPDATE' || msg.type === 'USER_ADDED') {
    let usersByName: Index<User> = {...prevState.usersByName};
    let user = msg.user;
    let newUser = parseUser(usersByName[user.name], user);
    usersByName[user.name] = newUser;
    let nextState = {...prevState, usersByName};
    if (nextState.currentUser && nextState.currentUser.name === user.name) {
      nextState.currentUser = {...nextState.currentUser, ...newUser};
    }
    return nextState;
  } else if (msg.type === 'LOGIN_SUCCESS') {
    let usersByName: Index<User> = {...prevState.usersByName};
    let user = msg.you;
    usersByName[user.name] = parseUser(usersByName[user.name], user);
    return {...prevState, usersByName};
  } else if (msg.type === 'START_USER_DETAILS') {
    return {...prevState, userDetailsRequest: {
      name: msg.name,
      status: 'pending'
    }};
  } else if (msg.type === 'DETAILS_JOIN' && chanId) {
    let usersByName: Index<User> = {...prevState.usersByName};
    let user = msg.user;
    let newUser = parseUser(usersByName[user.name], user, msg);
    usersByName[user.name] = newUser;

    // In case we looked it up without knowing the casing
    let lowerName = user.name.toLowerCase();
    if (user.name !== lowerName) {
      usersByName[lowerName] = newUser;
    }

    let nextState = {...prevState, usersByName};

    if (prevState.userDetailsRequest && prevState.userDetailsRequest.name.toLowerCase() === lowerName) {
      nextState.userDetailsRequest = {
        name: prevState.userDetailsRequest.name,
        status: 'received'
      };
    }

    // Channel membership
    let chanMem: ChannelMembership = {...prevState.channelMembership};
    chanMem[chanId] = {type: 'details', complete: false, stale: false};
    nextState.channelMembership = chanMem;

    if (nextState.currentUser && nextState.currentUser.name === user.name) {
      nextState.currentUser = {...nextState.currentUser, ...newUser};
    }

    return nextState;
  } else if (msg.type === 'DETAILS_RANK_GRAPH') {
    let rankGraphsByChannelId: Index<RankGraph> = {...prevState.rankGraphsByChannelId};
    let channelId:string = String(msg.channelId);
    let data:Array<number> = msg.data;

    rankGraphsByChannelId[channelId] = parseRankGraph(data);
    let nextState = {...prevState, rankGraphsByChannelId};

    return nextState;
  } else if (msg.type === 'DETAILS_UPDATE' && chanId) {
    let req = prevState.userDetailsRequest;
    if (req) {
      let user = prevState.usersByName[req.name];
      if (user && user.details && user.details.channelId === chanId) {
        let usersByName: Index<User> = {...prevState.usersByName};
        usersByName[user.name] = parseUser(usersByName[user.name], {}, msg);
        return {...prevState, usersByName};
      }
    }
  } else if (msg.type === 'DETAILS_NONEXISTANT') {
    return {...prevState, userDetailsRequest: {
      name: msg.name,
      status: 'nonexistant'
    }};
  } else if (msg.type === 'CLOSE_USER_DETAILS') {
    return {...prevState, userDetailsRequest: null};
  } else if (msg.type === 'GAME_LIST' || msg.type === 'GLOBAL_GAMES_JOIN') {
    if (msg.games) {
      let usersByName: Index<User> = {...prevState.usersByName};
      for (let game of msg.games) {
        if (game.players) {
          for (let role of Object.keys(game.players)) {
            let name = game.players[role].name;
            if (name) {
              usersByName[name] = parseUser(usersByName[name], game.players[role]);
            }
          }
        }
      }
      return {...prevState, usersByName};
    }
  } else if (
    msg.users &&
    (msg.type === 'GAME_JOIN' ||
      msg.type === 'GAME_UPDATE' ||
      msg.type === 'GAME_STATE' ||
      msg.type === 'GAME_NAME_CHANGE' ||
      msg.type === 'CHALLENGE_JOIN')
    ) {
    if (prevState.currentUser) {
      for (let user of msg.users) {
        if (user.name === prevState.currentUser.name) {
          let usersByName: Index<User> = {...prevState.usersByName};
          let newUser = parseUser(usersByName[user.name], user);
          usersByName[user.name] = newUser;
          let nextState = {...prevState, usersByName};
          if (nextState.currentUser && nextState.currentUser.name === user.name) {
            nextState.currentUser = {...nextState.currentUser, ...newUser};
          }
          return nextState;
        }
      }
    }
    return prevState;
  }
  return prevState;
}
