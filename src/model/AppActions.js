// @flow
import {AppStore} from './AppStore';
import {KgsClient} from './KgsClient';
import {tempId, isTempId} from './tempId';
import {prepareSavedAppState} from './appState';
import {isGamePlayer, isGameProposalPlayer, proposalsEqual} from './game';
import type {
  GameChannel,
  GameFilter,
  GameProposal,
  GameRole,
  ProposalVisibility,
  NavOption,
  KgsMessage,
  User,
  UserDetails,
  Room,
  Point,
  PlayerColor
} from './types';
import {distinct} from '../util/collection';

const APP_STATE_SAVE_KEY = 'savedAppState';

export class AppActions {

  _store: AppStore;
  _client: KgsClient;
  _history: Object;

  constructor(store: AppStore, client: KgsClient, history: Object) {
    this._store = store;
    this._client = client;
    this._history = history;
  }

  _isOffline = () => {
    let {status, network} = this._store.getState().clientState;
    return status === 'loggedOut' || network !== 'online';
  }

  onSaveAppState = () => {
    this._store.saveState(APP_STATE_SAVE_KEY, prepareSavedAppState);
  }

  onRestoreAppState = () => {
    this._store.restoreSavedState(APP_STATE_SAVE_KEY, appState => {
      this._client.setState(appState.clientState);
      this._store.dispatch({type: 'APP_STATE_INITIALIZED'});
      let clientStatus = appState.clientState.status;
      // TODO - if it's been longer than ~5 mins, log out
      if (clientStatus === 'loggedIn') {
        // Resume receive loop from previous session
        this._client.poll();
      } else if (clientStatus !== 'loggedOut') {
        // In transition; could be inconsistent - bail out
        this.onLogout();
      }
    });
  }

  onReceiveServerMessages = (msgs: Array<KgsMessage>) => {
    this._store.dispatch(msgs);

    // Follow-up actions we know we need to take, even without user interaction
    msgs = Array.isArray(msgs) ? msgs : [msgs];
    for (let msg of msgs) {
      if (msg.type === 'LOGIN_SUCCESS') {
        this.onLoginSuccess();
      } else if (msg.type === 'CHALLENGE_FINAL') {
        this.onChallengeFinalized(msg.proposal);
      } else if (msg.type === 'CHALLENGE_PROPOSAL' && msg.channelId) {
        this.onReceiveChallengeProposal(msg.channelId, msg.proposal);
      } else if (msg.type === 'ARCHIVE_JOIN' && msg.channelId) {
        this.onArchiveJoinSuccess(msg.channelId, msg.user);
      } else if (msg.type === 'GLOBAL_GAMES_JOIN' || msg.type === 'GAME_LIST') {
        this.onCheckRoomNames(msg.games);
      } else if (msg.type === 'GAME_TIME_EXPIRED' && msg.channelId) {
        this.onGameTimeExpired(msg.channelId);
      }
    }
  }

  onLogin = (username: ?string, password: ?string) => {
    if (!username || !password) {
      this._store.dispatch({type: 'LOGIN_FAILED_MISSING_INFO'});
      return;
    }
    this._store.dispatch({type: 'LOGIN_START'});
    this._client.login(username, password);
  }

  onLoginSuccess = () => {
    let state = this._store.getState();

    // Make sure URL is sync'd with state
    this._history.replace('/' + state.nav);

    // Auto-join game lists
    this._client.sendMessage({
      type: 'GLOBAL_LIST_JOIN_REQUEST',
      list: 'ACTIVES'
    });
    this._client.sendMessage({
      type: 'GLOBAL_LIST_JOIN_REQUEST',
      list: 'CHALLENGES'
    });

    // Get own recent games list (mainly useful for showing unfinished games)
    if (state.currentUser) {
      this._client.sendMessage({
        type: 'JOIN_ARCHIVE_REQUEST',
        name: state.currentUser.name
      });
    }
  }

  onShowUnderConstruction = () => {
    this._store.dispatch({
      type: 'SHOW_UNDER_CONSTRUCTION'
    });
  }

  onHideUnderConstruction = () => {
    this._store.dispatch({
      type: 'HIDE_UNDER_CONSTRUCTION'
    });
  }

  onLogout = () => {
    this._history.push('/');
    this._store.dispatch({type: 'LOGOUT_START'});
    setTimeout(() => {
      this.onSaveAppState();
    }, 0);
    if (this._store.getState().clientState.status !== 'loggedOut') {
      this._client.logout();
    }
  }

  onChangeNav = (nav: NavOption, opts?: {push?: boolean} = {push: true}) => {
    if (opts.push && nav !== this._history.location.pathname.slice(1)) {
      this._history.push('/' + nav);
    }
    let state = this._store.getState();
    if (state.nav !== nav) {
      this._store.dispatch({type: 'NAV_CHANGE', nav});
    } else if (nav === 'watch') {
      if (typeof state.watchGameId === 'number') {
        this.onLeaveGame(state.watchGameId);
      }
    }
  }

  onJoinGame = (gameId: number | string) => {
    let state = this._store.getState();

    let {currentUser} = state;
    if (!currentUser) {
      return;
    }

    if (typeof state.watchGameId === 'number' && state.watchGameId !== gameId) {
      this.onLeaveGame(state.watchGameId);
    }

    if (gameId === state.playGameId) {
      // Already playing this game
      this.onChangeNav('play');
      return;
    }

    let players;
    if (typeof gameId === 'number') {
      let game = state.gamesById[gameId];
      players = game.players;
    } else {
      let gameSummaries = state.gameSummariesByUser[currentUser.name];
      let gameSummary = gameSummaries ? gameSummaries.find(g => g.timestamp === gameId) : null;
      if (gameSummary) {
        players = gameSummary.players;
      }
    }
    let joinType;
    if (players && isGamePlayer(currentUser.name, players)) {
      // Left game; rejoin
      joinType = 'PLAY_GAME';
      this.onChangeNav('play');
    } else {
      joinType = 'WATCH_GAME';
      this.onChangeNav('watch');
    }
    
    if (typeof gameId === 'number') {
      // By channel id
      this._store.dispatch([
        {type: 'GAME_JOIN', channelId: gameId},
        {type: joinType, gameId}
      ]);
      if (!this._isOffline()) {
        this._client.sendMessage({
          type: 'JOIN_REQUEST',
          channelId: gameId
        });
      }
    } else {
      // By timestamp
      this._store.dispatch([
        {type: joinType, gameId}
      ]);
      if (!this._isOffline()) {
        this._client.sendMessage({
          type: 'JOIN_GAME_BY_ID',
          timestamp: gameId
        });
      }
    }
  }

  onLeaveGame = (game: GameChannel | number) => {
    let gameId = typeof game === 'number' ? game : game.id;
    let state = this._store.getState();
    let msgs = [];
    if (state.playGameId === gameId) {
      msgs.push({
        type: 'PLAY_GAME',
        gameId: null
      });
    }
    if (state.watchGameId === gameId) {
      msgs.push({
        type: 'WATCH_GAME',
        gameId: null
      });
    }
    if (msgs.length) {
      this._store.dispatch(msgs);
    }
    this.onUnjoin(gameId);
  }

  onSelectChallenge = (challengeId: number) => {
    if (this._isOffline()) {
      return;
    }
    let state = this._store.getState();
    let challenge: ?GameChannel = state.gamesById[challengeId];
    let proposal: ?GameProposal = challenge && challenge.initialProposal;
    if (proposal && (proposal.gameType === 'rengo' || proposal.gameType === 'simul')) {
      this.onShowUnderConstruction();
      return;
    }
    this._store.dispatch({
      type: 'PLAY_CHALLENGE',
      challengeId
    });
    this._client.sendMessage({
      type: 'JOIN_REQUEST',
      channelId: challengeId
    });
  }

  onCloseChallenge = (challengeId: number) => {
    this._store.dispatch({
      type: 'CLOSE_CHALLENGE',
      channelId: challengeId
    });
    this.onUnjoin(challengeId);
  }

  onSubmitChallengeProposal = (challengeId: number, proposal: GameProposal) => {
    this._store.dispatch({
      type: 'START_CHALLENGE_SUBMIT',
      channelId: challengeId,
      proposal
    });
    this._client.sendMessage({
      type: 'CHALLENGE_SUBMIT',
      channelId: challengeId,
      ...proposal
    });
  }

  onCreateChallenge = (proposal: GameProposal, roomId: number, visibility: ProposalVisibility, notes?: string) => {
    let finalProposal = {...proposal, private: visibility === 'private'};
    this._client.sendMessage({
      type: 'CHALLENGE_CREATE',
      proposal: finalProposal,
      channelId: roomId,
      text: notes,
      global: visibility === 'public',
      callbackKey: 12345 // Note - we don't use this
    });
  }

  onAcceptChallengeProposal = (challengeId: number, proposal: GameProposal) => {
    // Users must be name-only
    let normProposal = {...proposal, players: proposal.players.map(p => {
      p = {...p, name: p.user ? p.user.name : p.name};
      delete p.user;
      return p;
    })};
    this._client.sendMessage({
      type: 'CHALLENGE_PROPOSAL',
      channelId: challengeId,
      ...normProposal
    });
  }

  onDeclineChallengeProposal = (challengeId: number, name: string) => {
    this._store.dispatch({
      type: 'START_CHALLENGE_DECLINE',
      channelId: challengeId,
      name
    });
    this._client.sendMessage({
      type: 'CHALLENGE_DECLINE',
      name,
      channelId: challengeId
    });
  }

  onChallengeFinalized = (proposal: GameProposal) => {
    let state = this._store.getState();
    let currentUser = state.currentUser;
    let name = currentUser && currentUser.name;
    let isPlayer = name && isGameProposalPlayer(name, proposal);
    if (!isPlayer) {
      // Challenge accepted by someone else
      this.onChangeNav('watch');
    }
  }

  onReceiveChallengeProposal = (challengeId: number, proposal: GameProposal) => {
    if (!proposal) {
      this.onCloseChallenge(challengeId);
    }
    let state = this._store.getState();
    let challenge = state.gamesById[challengeId];
    let sentProposal = challenge.sentProposal;
    if (sentProposal) {
      let acceptable = proposalsEqual(sentProposal, proposal);
      if (acceptable) {
        this._client.sendMessage({
          type: 'CHALLENGE_ACCEPT',
          channelId: challengeId,
          ...sentProposal
        });
      } else {
        // TODO - reset challenge, show to current user for review
        // console.log('TODO - received counter proposal', {challengeId, proposal});
        this.onCloseChallenge(challengeId);
      }
    } else {
      // TODO - received a revised proposal when we didn't submit a challenge.
      // Is there anything for us to do here?
    }
  }

  onShowGames = (filter: GameFilter) => {
    let msgs;
    let state = this._store.getState();
    if (filter.type === 'challenge') {
      this.onChangeNav('play');
      msgs = [
        {type: 'PLAY_FILTER_CHANGE', filter},
      ];
      if (state.playGameId) {
        this.onLeaveGame(state.playGameId);
      }
    } else {
      this.onChangeNav('watch');
      msgs = [
        {type: 'WATCH_FILTER_CHANGE', filter}
      ];
      if (typeof state.watchGameId === 'number') {
        this.onLeaveGame(state.watchGameId);
      }
    }
    this._store.dispatch(msgs);
  }

  onLoadGame = (timestamp: string) => {
    console.log('TODO - Ask for room/private, then load game', timestamp);
    this.onShowUnderConstruction();
  }

  onUserDetail = (name: string) => {
    if (this._isOffline()) {
      return;
    }
    this._store.dispatch({type: 'START_USER_DETAILS', name});
    this._client.sendMessage({type: 'DETAILS_JOIN_REQUEST', name});
    this._client.sendMessage({type: 'JOIN_ARCHIVE_REQUEST', name});
  }

  onCloseUserDetail = () => {
    let {userDetailsRequest, usersByName} = this._store.getState();
    if (userDetailsRequest) {
      let user = usersByName[userDetailsRequest.name];
      if (user && user.details) {
        this.onUnjoin(user.details.channelId);
      }
    }
    this._store.dispatch({type: 'CLOSE_USER_DETAILS'});
  }

  onSelectConversation = (conversationId: number) => {
    let msgs = [
      {type: 'SAW_CONVERSATION', conversationId},
      {type: 'CONVERSATION_CHANGE', conversationId},
    ];
    let activeConvId = this._store.getState().activeConversationId;
    if (activeConvId) {
      msgs.push({type: 'SAW_CONVERSATION', conversationId: activeConvId});
    }
    this._store.dispatch(msgs);
  }

  markConversationSeen = (conversationId: number) => {
    this._store.dispatch({type: 'SAW_CONVERSATION', conversationId});
  }

  onCloseConversation = (conversationId: number) => {
    if (this._isOffline()) {
      return;
    }
    this._store.dispatch({type: 'CLOSE_CONVERSATION', conversationId});
    if (!isTempId(conversationId)) {
      this.onUnjoin(conversationId);
    }
  }

  onStartChat = (user: User) => {
    if (this._isOffline()) {
      return;
    }
    this.onChangeNav('chat');
    let {conversationsById} = this._store.getState();
    let userConvo = Object.keys(conversationsById).find(cid =>
      conversationsById[cid].user === user.name
    );
    if (userConvo) {
      this.onSelectConversation(parseInt(userConvo, 10));
      return;
    }
    let channelId = tempId();
    let callbackKey = tempId();
    this._store.dispatch({
      type: 'CONVO_JOIN',
      user,
      channelId,
      callbackKey,
      joinNow: true
    });
    this._client.sendMessage({type: 'CONVO_REQUEST', name: user.name, callbackKey});
  }

  onSendChat = (body: string, conversationId: number) => {
    if (this._isOffline()) {
      return;
    }
    // Temp message to show until next payload received
    this._store.dispatch({
      type: 'CHAT',
      sending: true,
      text: body,
      channelId: conversationId,
      user: this._store.getState().currentUser
    });
    this._client.sendMessage({type: 'CHAT', text: body, channelId: conversationId});
  }

  onSendGameChat = (body: string, gameId: number) => {
    if (this._isOffline()) {
      return;
    }
    this._client.sendMessage({type: 'CHAT', text: body, channelId: gameId});
  }

  onJoinRoom = (room: Room) => {
    if (this._isOffline()) {
      return;
    }
    this._store.dispatch([
      {type: 'ROOM_JOIN', channelId: room.id},
      {type: 'CONVERSATION_CHANGE', conversationId: room.id}
    ]);
    this._client.sendMessage({type: 'JOIN_REQUEST', channelId: room.id});
    this._client.sendMessage({type: 'ROOM_DESC_REQUEST', channelId: room.id});
  }

  onFetchRoomList = () => {
    let roomsById = this._store.getState().roomsById;
    // Only fetch rooms whose name we don't know yet
    let roomIds = distinct(
      Object.keys(roomsById).filter(id => typeof roomsById[id].name !== 'string')
    );
    if (roomIds.length) {
      this._client.sendMessage({type: 'ROOM_NAMES_REQUEST', rooms: roomIds});
    }
  }

  onCheckRoomNames = (games: Array<GameChannel>) => {
    if (this._isOffline()) {
      return;
    }

    let state = this._store.getState();

    // Room names we don't have yet
    let roomsById = state.roomsById;
    let roomIds = distinct(
      games
        .filter(g => g.roomId && (!roomsById[g.roomId] || typeof roomsById[g.roomId].name !== 'string'))
        .map(g => g.roomId)
    );
    if (roomIds.length) {
      this._client.sendMessage({type: 'ROOM_NAMES_REQUEST', rooms: roomIds});
    }
  }

  onArchiveJoinSuccess = (channelId: number, user: User) => {
    let state = this._store.getState();
    let {currentUser} = state;
    if (currentUser && currentUser.name === user.name) {
      // Stay subscribed to own archive, for unfinished games list
      return;
    }

    // Immediately unjoin - don't care about live updates for anyone else
    this.onUnjoin(channelId);
  }

  onUnjoin = (channelId: number) => {
    if (this._isOffline()) {
      return;
    }
    this._client.sendMessage({type: 'UNJOIN_REQUEST', channelId});
  }

  onChangeCurrentNode = (game: GameChannel, nodeId: number) => {
    this._store.dispatch({
      type: 'SET_CURRENT_GAME_NODE',
      currentNode: nodeId,
      channelId: game.id
    });
  }

  onPlayMove = (game: GameChannel, loc: Point, color: ?PlayerColor) => {
    if (color) {
      this._store.dispatch({
        type: 'START_GAME_MOVE',
        channelId: game.id,
        loc,
        color
      });
    }
    this._client.sendMessage({
      type: 'GAME_MOVE',
      channelId: game.id,
      loc
    });
  }

  onMarkLife = (game: GameChannel, loc: Point, alive: boolean) => {
    this._client.sendMessage({
      type: 'GAME_MARK_LIFE',
      channelId: game.id,
      x: loc.x,
      y: loc.y,
      alive
    });
  }

  onPass = (game: GameChannel) => {
    this._client.sendMessage({
      type: 'GAME_MOVE',
      channelId: game.id,
      loc: 'PASS'
    });
  }

  onUndo = (game: GameChannel) => {
    this._client.sendMessage({
      type: 'GAME_UNDO_REQUEST',
      channelId: game.id
    });
  }

  onResign = (game: GameChannel) => {
    this._client.sendMessage({
      type: 'GAME_RESIGN',
      channelId: game.id
    });
  }

  onAddGameTime = (game: GameChannel, role: GameRole, seconds: number) => {
    this._client.sendMessage({
      type: 'GAME_ADD_TIME',
      channelId: game.id,
      time: seconds,
      role
    });
  }

  onDoneScoring = (game: GameChannel) => {
    this._client.sendMessage({
      type: 'GAME_SCORING_DONE',
      channelId: game.id,
      doneId: game.doneId
    });
  }

  onAcceptUndo = (game: GameChannel) => {
    this._client.sendMessage({
      type: 'GAME_UNDO_ACCEPT',
      channelId: game.id
    });
  }

  onDeclineUndo = (game: GameChannel) => {
    this._store.dispatch({
      type: 'GAME_UNDO_DECLINE',
      channelId: game.id
    });
  }

  onGameTimeExpired = (gameId: number) => {
    this._client.sendMessage({
      type: 'GAME_TIME_EXPIRED',
      channelId: gameId
    });
  }

  onUpdateProfileDetails = (user: User, details: UserDetails) => {
    if (this._isOffline()) {
      return;
    }
    this._client.sendMessage({
      type: 'DETAILS_CHANGE',
      channelId: details.channelId,
      personalName: details.personalName,
      personalEmail: details.email,
      personalInfo: details.personalInfo,
      emailWanted: details.emailWanted,
      emailPrivate: details.privateEmail,
      rankWanted: details.rankWanted,
      authLevel: user.authLevel || 'normal'
    });
    // Force a refresh, since changing rankWanted doesn't get reflected in
    // DETAILS_UPDATE response
    this.onUnjoin(details.channelId);
    setTimeout(() => {
      // If we do it right away it doesn't always work
      this._client.sendMessage({
        type: 'DETAILS_JOIN_REQUEST',
        name: user.name
      });
    }, 200);
  }

  onUpdatePassword = (user: User, newPassword: string) => {
    if (this._isOffline()) {
      return;
    }
    this._client.sendMessage({
      type: 'SET_PASSWORD',
      user: user.name,
      password: newPassword
    });
  }

}
