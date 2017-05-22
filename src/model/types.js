// @flow

export type AuthLevel = (
  'normal' |
  'robot_ranked' |
  'teacher' |
  'jr_admin' |
  'sr_admin' |
  'super_admin'
);

export type UserFlags = {
  guest?: boolean,
  connected?: boolean,
  deleted?: boolean,
  sleeping?: boolean,
  avatar?: boolean,
  robot?: boolean,
  tourneyWinner?: boolean,
  tourneyRunnerUp?: boolean,
  playing?: boolean,
  playingTourney?: boolean,
  kgsPlus?: boolean,
  kgsMeijin?: boolean,
  canPlayRanked?: boolean,
  selfish?: boolean
};

export type UserDetails = {
  channelId: number,
  forcedNoRank: boolean,
  privateEmail: boolean,
  emailWanted: boolean,
  rankWanted: boolean,
  lastOn: string,
  regStartDate: string,
  personalName: string,
  personalInfo: string,
  locale: string,
  email?: string,
  subscriptions?: string
};

export type User = {
  name: string, // A-Za-z0-9, max 10 chars
  flags?: UserFlags,
  rank?: string,
  rankVal?: number,
  authLevel?: AuthLevel,
  details?: UserDetails
};

export type UnparsedUser = {
  name: string,
  flags?: string,
  rank?: string,
  authLevel?: AuthLevel
};

export type RoomCategory = (
  'MAIN' |
  'NATIONAL' |
  'TOURNAMENT' |
  'FRIENDLY' |
  'SPECIAL' |
  'LESSONS' |
  'CLUBS' |
  'TEMPORARY' |
  'OTHER'
);

export type Room = {
  id: number,
  name: ?string,
  description: ?string,
  owners: ?Array<string>,
  users: ?Array<string>,
  category: ?RoomCategory,
  private?: boolean,
  tournOnly?: boolean,
  globalGamesOnly?: boolean
};

export type ConversationMessage = {
  id: string,
  sender: string,
  body: string,
  date: ?Date, // date received; server doesn't provide it
  sending?: boolean,
  announcement?: boolean,
  moderated?: boolean
};

export type Conversation = {
  id: number,
  user?: string,
  lastSeen?: number,
  unseenCount?: number,
  chatsDisabled?: boolean,
  messages: Array<ConversationMessage>,
  callbackKey?: ?number,
  status: 'pending' | 'created' | 'userNotFound' | 'closed'
};

export type GameType = (
  'challenge' |
  'demonstration' |
  'review' |
  'rengo_review' |
  'teaching' |
  'simul' |
  'rengo' |
  'free' |
  'ranked' |
  'tournament'
);

export type GameRuleSet = 'japanese' | 'chinese' | 'aga' | 'new_zealand';

export type GameRules = {
  size: number, // 2 - 38
  komi: number, // multiple of 0.5
  handicap?: number,
  rules?: GameRuleSet,
  timeSystem?: 'none' | 'absolute' | 'byo_yomi' | 'canadian',
  mainTime?: number, // seconds
  byoYomiTime?: number, // seconds
  byoYomiPeriods?: number,
  byoYomiStones?: number
};

export type GameRole = (
  'black' |
  'white' |
  'black_2' |
  'white_2' |
  'challengeCreator' |
  'owner'
);

export type PlayerColor = 'white' | 'black';

export type GameProposalPlayer = {
  role: GameRole,
  user?: UnparsedUser,
  name?: string
};

export type GameProposal = {
  gameType: GameType,
  rules: GameRules,
  nigiri: boolean,
  players: Array<GameProposalPlayer>,
  private?: boolean
};

// Scores may be a floating point number, or a string. Numbers indicate the
// score difference (positive a black win, negative a white win).
export type GameScore = (
  number |
  'UNKNOWN' |
  'UNFINISHED' |
  'NO_RESULT' |
  'B+RESIGN' |
  'W+RESIGN' |
  'B+FORFEIT' |
  'W+FORFEIT' |
  'B+TIME' |
  'W+TIME'
);

export type GamePlayers = {[role: GameRole]: User};

export type GameSummary = {
  timestamp: string, // unique identifier
  type: GameType,
  rules: GameRules,
  players: GamePlayers,
  score?: GameScore,
  revision?: string,
  tag?: string,
  private?: boolean,
  inPlay?: boolean
};

export type ClockState = {
  paused?: boolean,
  running?: boolean,
  time?: number,
  periodsLeft?: number,
  stonesLeft?: number
};

export type GameAction = (
  'MOVE' |
  'EDIT' |
  'SCORE' |
  'CHALLENGE_CREATE' |
  'CHALLENGE_SETUP' |
  'CHALLENGE_WAIT' |
  'CHALLENGE_ACCEPT' |
  'CHALLENGE_SUBMITTED' |
  'EDIT_DELAY'
);

export type Point = {x: number, y: number};

export type SgfEventType = string;

export type SgfLoc = 'PASS' | Point;

export type SgfColor = 'empty' | 'black' | 'white';

export type SgfProp = {
  name: string,
  text?: string,
  color?: SgfColor,
  loc?: SgfLoc,
  loc2?: SgfLoc,
  float?: number,
  int?: number
};

export type SgfEvent = (
  {type: 'PROP_ADDED', nodeId: number, prop: SgfProp} |
  {type: 'PROP_REMOVED', nodeId: number, prop: SgfProp} |
  {type: 'PROP_CHANGED', nodeId: number, prop: SgfProp} |
  {type: 'CHILDREN_REORDERED', nodeId: number, children: Array<number>} |
  {type: 'CHILD_ADDED', nodeId: number, childNodeId: number, position?: number} |
  {type: 'PROP_GROUP_ADDED', nodeId: number, props: Array<SgfProp>} |
  {type: 'PROP_GROUP_REMOVED', nodeId: number, props: Array<SgfProp>} |
  {type: 'ACTIVATED', nodeId: number, prevNodeId: number} |
  {type: 'POINTER_MOVED', nodeId: number, x: number, y: number} |
  {type: 'TIMESTAMP', nodeId: number, time: number} |
  {type: 'SPEEX_FPP', nodeId: number, fpp: number} |
  {type: 'SPEEX_MUTE_CHANGED', nodeId: number, mute: boolean} |
  {type: 'SPEEX_DATA', nodeId: number, data: string}
);

export type BoardPointMark = (
  'whiteTerritory' |
  'blackTerritory' |
  'triangle' |
  'square' |
  'circle' |
  'cross' |
  'dead' |
  'active' |
  'pendingWhite' |
  'pendingBlack'
);

export type BoardMarkup = {
  marks: {[y: number]: {[x: number]: BoardPointMark}},
  labels: {[y: number]: {[x: number]: ?string}}
};

export type BoardState = Array<Array<?PlayerColor>>; // y[x]

export type GameNodeComputedState = {
  blackCaptures: number,
  whiteCaptures: number,
  board: BoardState,
  markup: BoardMarkup
};

export class GameNode {
  props: Array<SgfProp>;
  children: Array<number>;
  parent: ?number;
  constructor(
    props: Array<SgfProp>,
    children: Array<number>,
    parent: ?number
  ) {
    this.props = props;
    this.children = children;
    this.parent = parent;
  }
}

export type PendingMove = {
  nodeId: number,
  color: PlayerColor,
  loc: Point
};

export type GameTree = {
  nodes: {
    [nodeId: number]: GameNode
  },
  computedState: {
    [nodeId: number]: GameNodeComputedState
  },
  messages: {
    [nodeId: number]: Array<ConversationMessage>
  },
  rootNode: number,
  activeNode: number,
  currentNode: number,
  currentLine: Array<number>,
  pendingMove?: PendingMove
};

export type ChallengeStatus = (
  'viewing' |
  'waiting' |
  'accepted' |
  'declined'
);

export type GameChannel = {
  id: number,
  type: GameType,
  time: number, // date received
  deletedTime?: number,
  initialProposal?: GameProposal, // for challenge
  challengeStatus?: ChallengeStatus,
  sentProposal?: GameProposal,
  receivedProposals?: Array<GameProposal>,
  rules?: GameRules, // for non-challenge
  players: GamePlayers,
  moveNum: number,
  roomId: number,
  observers?: number,
  name?: string,
  score?: GameScore,
  actions?: Array<{action: GameAction, user: UnparsedUser}>,
  clocks?: {[role: GameRole]: ClockState},
  whiteDoneSent?: boolean,
  blackDoneSent?: boolean,
  whiteScore?: boolean,
  blackScore?: boolean,
  doneId?: number,
  summary?: GameSummary,
  tree?: GameTree,
  users?: Array<string>,
  accessDenied?: string,
  undoRequest?: GameRole,
  // Flags
  global?: boolean,
  over?: boolean,
  adjourned?: boolean,
  private?: boolean,
  subscribers?: boolean,
  event?: boolean,
  uploaded?: boolean,
  audio?: boolean,
  paused?: boolean,
  named?: boolean,
  saved?: boolean
};

export type GameFilter = {
  type?: 'game' | 'challenge',
  roomId?: ?number,
  excludeBots?: boolean
};

export type GameChatSection = {
  nodeId: number,
  moveNum: number,
  actions: Array<string>,
  messages: Array<ConversationMessage>
};

export type ChannelType = (
  'room' |
  'gameList' |
  'game' |
  'conversation' |
  'challenge' |
  'archive' |
  'details'
);

export type ChannelMembership = {
  [channelId: string | number]: {
    type: ChannelType,
    complete: boolean,
    stale: boolean
  }
};

export type AutomatchPrefs = {
  blitzOk: boolean,
  estimatedRank: string,
  fastOk: boolean,
  freeOk: boolean,
  humanOk: boolean,
  maxHandicap: number,
  mediumOk: boolean,
  rankedOk: boolean,
  robotOk: boolean,
  unrankedOk: boolean
};

export type Playback = {
  dateStamp: string,
  gameSummary: GameSummary,
  subscribersOnly: boolean
};

export type Index<T> = {
  [key: string | number]: T
};

export type NavOption = 'watch' | 'play' | 'chat' | 'search' | 'more';

export type UserDetailsRequest = {
  name: string,
  status: 'pending' | 'nonexistant' | 'received'
};

export type KgsClientState = {
  status: 'loggedOut' | 'loggingIn' | 'loggedIn' | 'loggingOut',
  network: 'online' | 'offline' | 'error',
  retryTimes: number
};

export type Preferences = {
  username?: string
};

export type AppState = {
  +clientState: KgsClientState,
  +preferences: Preferences,
  +initialized: boolean,
  +savedAt: ?Date,
  +serverInfo: ?Object,
  +currentUser: ?User,
  +loginError: ?string,
  +logoutError: ?string,
  +roomsById: Index<Room>,
  +gamesById: Index<GameChannel>,
  +gameSummariesByUser: Index<Array<GameSummary>>,
  +activeGames: Array<GameChannel>,
  +challenges: Array<GameChannel>,
  +unfinishedGames: Array<GameSummary>,
  +watchFilter: GameFilter,
  +watchGameId: ?(number | string),
  +playFilter: GameFilter,
  +playGameId: ?number,
  +playChallengeId: ?number,
  +usersByName: Index<User>,
  +conversationsById: Index<Conversation>,
  +channelMembership: ChannelMembership,
  +automatchPrefs: ?AutomatchPrefs,
  +playbacks: Array<Playback>,
  +nav: NavOption,
  +activeConversationId: ?number,
  +userDetailsRequest: ?UserDetailsRequest,
  +showUnderConstruction: boolean
};

export type KgsMessage = (
  // TODO - exhaustive types
  // {
  //   type: 'CHAT' | 'ANNOUNCE' | 'MODERATED_CHAT',
  //   user: User
  // } |
  // {
  //   type: 'CONVO_JOIN' | 'ROOM_JOIN',
  //   channelId: number
  // } |
  {
    type: string,
    channelId?: number,
    [key: string]: any
  }
);

export type MessageDispatcher = (
  msgs: KgsMessage | Array<KgsMessage>,
  callback?: AppState => any
) => any;
