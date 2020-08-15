// @flow
import type { AppState, KgsClientState } from "./types";

// Resets on each login
export function getEmptyServerState() {
  return {
    currentUser: null,
    serverInfo: null,
    roomsById: {},
    gamesById: {},
    gameSummariesByUser: {},
    rankGraphsByChannelId: {},
    activeGames: [],
    challenges: [],
    unfinishedGames: [],
    watchGameId: null,
    playGameId: null,
    playChallengeId: null,
    nav: "chat",
    usersByName: {},
    conversationsById: {},
    channelMembership: {},
    automatchPrefs: null,
    playbacks: [],
    activeConversationId: null,
    userDetailsRequest: null,
    showUnderConstruction: false,
    showFeedbackModal: false,
    reviewGameId: null,
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
    ...getEmptyServerState(),
  };
}

export function prepareSavedAppState(appState: AppState): AppState {
  // Always pretend we're online when saving state, so after restoration
  // we can try a network request before finding out what the true
  // state of the network is.
  return {
    ...appState,
    clientState: {
      ...appState.clientState,
      network: "online",
    },
  };
}
