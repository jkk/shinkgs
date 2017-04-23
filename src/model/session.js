// @flow
import {getEmptyServerState} from './appState';
import {parseUser} from './user';
import type {AppState, KgsMessage} from './types';

export function handleSessionMessage(prevState: AppState, msg: KgsMessage): AppState {
  let nextState: AppState;
  switch (msg.type) {
  case 'RESTORE_APP_STATE':
    // TODO - mark appropriate data as stale
    nextState = {
      ...msg.appState,
      loginError: null,
      logoutError: null
    };
    return nextState;
  case 'APP_STATE_INITIALIZED':
    return {
      ...prevState,
      initialized: true
    };
  case 'CLIENT_STATE_CHANGE':
    return {
      ...prevState,
      clientState: msg.clientState
    };
  case 'HELLO':
    return {
      ...prevState,
      serverInfo: {
        jsonClientBuild: msg.jsonClientBuild,
        versionMajor: msg.versionMajor,
        versionMinor: msg.versionMinor,
        versionBugfix: msg.versionBugfix,
      }
    };
  case 'LOGIN_START':
    return {
      ...prevState,
      loginError: null,
      logoutError: null
    };
  case 'LOGIN_FAILED_MISSING_INFO':
    return {
      ...prevState,
      loginError: 'Enter username and password'
    };
  case 'LOGIN_FAILED_NO_SUCH_USER':
    return {
      ...prevState,
      loginError: 'Login failed - no such user'
    };
  case 'LOGIN_FAILED_KEEP_OUT':
    return {
      ...prevState,
      loginError: msg.text || 'Login failed - you are temporarily banned'
    };
  case 'LOGIN_FAILED_BAD_PASSWORD':
    return {
      ...prevState,
      loginError: msg.text || 'Login failed - bad password'
    };
  case 'LOGIN_FAILED_USER_ALREADY_EXISTS':
    return {
      ...prevState,
      loginError: msg.text || 'Login failed - user already exists'
    };
  case 'LOGIN_SUCCESS':
    return {
      ...prevState,
      loginError: null,
      currentUser: parseUser(null, msg.you),
      preferences: {...prevState.preferences, username: msg.you.name}
    };
  case 'LOGOUT_START':
    return {
      ...prevState,
      ...getEmptyServerState()
    };
  case 'LOGOUT':
    nextState = {...prevState};
    if (msg.text) {
      nextState.logoutError = msg.text;
      // Sometimes KGS will give you a LOGOUT error when you try to log in,
      // even though you're not logged in yet
      if (prevState.clientState.status === 'loggedOut') {
        nextState.loginError = msg.text;
      }
    }
    return nextState;
  case 'RECONNECT':
    return {
      ...prevState,
      logoutError: 'Automatically logged out because your account has been logged into another system'
    };
  case 'SESSION_EXPIRED':
    return {
      ...prevState,
      logoutError: 'Previous session expired or became invalid'
    };
  case 'NAV_CHANGE':
    return {
      ...prevState,
      nav: msg.nav,
      userDetailsRequest: null
    };
  case 'SHOW_NOT_IMPLEMENTED':
    return {
      ...prevState,
      showNotImplemented: true
    };
  case 'HIDE_NOT_IMPLEMENTED':
    return {
      ...prevState,
      showNotImplemented: false
    };
  case 'SHOW_UNDER_CONSTRUCTION':
    return {
      ...prevState,
      showUnderConstruction: true
    };
  case 'HIDE_UNDER_CONSTRUCTION':
    return {
      ...prevState,
      showUnderConstruction: false
    };
  default:
    return prevState;
  }
}
