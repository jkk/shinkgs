// @flow
import type {AppState, KgsClientState} from './types';

// Resets on each login
export function getEmptyServerState() {
  return {
    currentUser: null,
    serverInfo: null,
    roomsById: {},
    gamesById: {},
    gameSummariesByUser: {},
    activeGames: [],
    challenges: [],
    unfinishedGames: [],
    watchGameId: null,
    playGameId: null,
    playChallengeId: null,
    nav: 'chat',
    usersByName: {},
    conversationsById: {},
    channelMembership: {},
    automatchPrefs: null,
    playbacks: [],
    activeConversationId: null,
    userDetailsRequest: null,
    showUnderConstruction: false
  };
}

export function getInitialState(clientState: KgsClientState): AppState {
  return {
    initialized: false,
    preferences: {},
    watchFilter: {},
    playFilter: {},
    savedAt: null,
    loginError: null,
    logoutError: null,
    clientState,
    ...getEmptyServerState()
  };
}
