// @flow
import {
  createBoardState,
  applyPropsToBoard
} from './board';
import {formatGameScore} from './display';
import {InvariantError} from '../../util/error';
import type {
  GameChannel,
  GameSummary,
  GameTree,
  GameNodeComputedState,
  GameRuleSet,
  GameProposal,
  GameRole,
  GameChatSection,
  GamePlayers,
  GameAction,
  UnparsedUser,
  BoardMarkup,
  SgfProp,
  PendingMove,
  PlayerColor
} from '../types';

export function getGameLine(tree: GameTree, nodeId: number): Array<number> {
  let node = tree.nodes[nodeId];
  if (!node) {
    throw new InvariantError('No node with id ' + nodeId);
  }

  // Go to end of line first
  let child = node.children[0];
  while (typeof child === 'number') {
    nodeId = child;
    node = tree.nodes[child];
    if (!node) {
      throw new InvariantError('No node with id ' + nodeId);
    }
    child = node.children[0];
  }

  // Now traverse back to root
  let line = [nodeId];
  let parent = node.parent;
  while (typeof parent === 'number') {
    line.push(parent);
    node = tree.nodes[parent];
    parent = node.parent;
  }
  line.reverse();
  return line;
}

export function validateRuleSet(ruleset: mixed): GameRuleSet {
  if (
    ruleset === 'japanese' ||
    ruleset === 'chinese' ||
    ruleset === 'aga' ||
    ruleset === 'new_zealand'
  ) {
    return ruleset;
  }
  throw new InvariantError('Invalid ruleset ' + String(ruleset));
}


const BOARD_MARKS = {
  'CIRCLE': 'circle',
  'TRIANGLE': 'triangle',
  'SQUARE': 'square',
  'CROSS': 'cross',
  'DEAD': 'dead'
};

export function getMarkupForProps(props: Array<SgfProp>): BoardMarkup {
  let markup: BoardMarkup = {
    marks: {},
    labels: {}
  };
  for (let prop of props) {
    let loc = prop.loc;
    if (!loc || loc === 'PASS') {
      continue;
    }
    if (prop.name === 'MOVE') {
      if (!markup.marks[loc.y]) {
        markup.marks[loc.y] = {};
      }
      markup.marks[loc.y][loc.x] = 'active';
    } else {
      let mark = BOARD_MARKS[prop.name];
      if (!mark && prop.name === 'TERRITORY') {
        mark = prop.color === 'black' ? 'blackTerritory' : 'whiteTerritory';
      }
      if (mark) {
        if (!markup.marks[loc.y]) {
          markup.marks[loc.y] = {};
        }
        markup.marks[loc.y][loc.x] = mark;
      } else if (prop.name === 'LABEL') {
        let label = typeof prop.text === 'string' ? prop.text : null;
        if (label) {
          if (!markup.labels[loc.y]) {
            markup.labels[loc.y] = {};
          }
          markup.labels[loc.y][loc.x] = label;
        }
      }
    }
  }
  return markup;
}

function addPendingMoveMarkup(markup: BoardMarkup, pendingMove: PendingMove) {
  let {x, y} = pendingMove.loc;
  if (!markup.marks[y]) {
    markup.marks[y] = {};
  }
  markup.marks[y][x] = pendingMove.color === 'white' ?
    'pendingWhite' : 'pendingBlack';
}

export function computeGameNodeStates(
  tree: GameTree,
  nodeId: number
): {[nodeId: number]: GameNodeComputedState} {
  let line = getGameLine(tree, nodeId);
  if (!line.length) {
    throw new InvariantError('Unexpected empty game line');
  }

  // Determine rules to use
  let rootNode = tree.nodes[tree.rootNode];
  let rulesProp = rootNode.props.find(p => p.name === 'RULES');
  let size = rulesProp && typeof rulesProp.size === 'number' ? rulesProp.size : 19;
  let ruleset: GameRuleSet = rulesProp && typeof rulesProp.rules !== 'undefined' ?
    validateRuleSet(rulesProp.rules) : 'japanese';
  let mainTime = rulesProp && typeof rulesProp.mainTime === 'number' ? rulesProp.mainTime : -1;

  // Don't redo already-computed state. Anything that happened before
  // the node we're looking at is still valid.
  let computedState: {[nodeId: number]: GameNodeComputedState} = {...tree.computedState};
  let startIdx = line.indexOf(nodeId);
  let blackCaps;
  let whiteCaps;
  let blackTimeLeft;
  let whiteTimeLeft;
  let board;
  if (startIdx > 0 && computedState[line[startIdx - 1]]) {
    let prevState = computedState[line[startIdx - 1]];
    blackCaps = prevState.blackCaptures;
    whiteCaps = prevState.whiteCaptures;
    blackTimeLeft = prevState.blackTimeLeft;
    whiteTimeLeft = prevState.whiteTimeLeft;
    board = prevState.board;
  } else {
    startIdx = 0;
    blackCaps = 0;
    whiteCaps = 0;
    blackTimeLeft = mainTime;
    whiteTimeLeft = mainTime;
    board = createBoardState(size);
  }

  for (let i = startIdx; i < line.length; i++) {
    let cursorId = line[i];
    let node = tree.nodes[cursorId];
    let ret = applyPropsToBoard(node.props, board, ruleset);
    let markup = getMarkupForProps(node.props);
    if (tree.pendingMove && tree.pendingMove.nodeId === cursorId) {
      addPendingMoveMarkup(markup, tree.pendingMove);
    }
    board = ret.board;
    blackCaps += ret.blackCaptures;
    whiteCaps += ret.whiteCaptures;
    for (let prop of node.props) {
      if (prop.name === 'TIMELEFT' && prop.float) {
        if (prop.color === 'black') {
          blackTimeLeft = prop.float;
        } else {
          whiteTimeLeft = prop.float;
        }
      }
    }
    computedState[cursorId] = {
      blackCaptures: blackCaps,
      whiteCaptures: whiteCaps,
      blackTimeLeft,
      whiteTimeLeft,
      board,
      markup
    };
  }
  return computedState;
}

export function isGameOverNode(game: GameChannel, nodeId: number) {
  let tree = game.tree;
  if (!tree || !game.over) {
    return false;
  }
  return (
    // Last node in the branch
    !tree.nodes[nodeId].children.length &&
    // Game being played - i.e., not a review
    (
      game.type === 'free' ||
      game.type === 'ranked' ||
      game.type === 'simul' ||
      game.type === 'rengo' ||
      game.type === 'tournament'
    )
  );
}

function getGameNodeActions(game: GameChannel, nodeId: number) {
  let actions: Array<string> = [];
  if (!game.tree) {
    return actions;
  }
  let passProp = game.tree.nodes[nodeId].props.find(p => p.loc === 'PASS');
  if (passProp) {
    actions.push((passProp.color === 'black' ? 'Black' : 'White') + ' passed');
  }
  if (isGameOverNode(game, nodeId) && game.score) {
    actions.push('Game Over: ' + formatGameScore(game.score));
  }
  return actions;
}

export function getGameChatSections(game: GameChannel): Array<GameChatSection> {
  let sections = [];
  let tree = game.tree;
  if (!tree) {
    return sections;
  }
  let line = getGameLine(tree, tree.activeNode);
  for (let i = 0; i < line.length; i++) {
    let nodeId = line[i];
    let messages = tree.messages[nodeId];
    let actions = getGameNodeActions(game, nodeId);
    if ((messages && messages.length) || actions.length) {
      sections.push({nodeId, moveNum: i, actions, messages});
    }
  }
  return sections;
}

export function isGameProposalPlayer(name: string, proposal: GameProposal) {
  return !!proposal.players.find(p =>
    p.name === name ||
    (p.user && p.user.name === name)
  );
}

export function getGamePlayerRole(name: string, players: GamePlayers): ?GameRole {
  for (let role of Object.keys(players)) {
    if (players[(role: any)].name === name) {
      return (role: any);
    }
  }
  return null;
}

export function isGamePlayer(name: string, players: GamePlayers) {
  return !!getGamePlayerRole(name, players);
}

export function isPlayerMove(game: GameChannel, name: string) {
  let actions = game.actions;
  if (!actions) {
    return false;
  }
  let moveAction = actions.find(a => a.action === 'MOVE');
  return !!(moveAction && moveAction.user.name === name);
}

export function getGamePlayerOtherRole(name: string, players: GamePlayers): ?GameRole {
  for (let role of Object.keys(players)) {
    if (players[(role: any)].name !== name) {
      return (role: any);
    }
  }
  return null;
}

export function isGameScoring(game: GameChannel) {
  if (game.over || !game.actions) {
    return false;
  }
  return !!game.actions.find(a => a.action === 'SCORE');
}

export function getGameRoleColor(role: GameRole): ?PlayerColor {
  if (role === 'white' || role === 'white_2') {
    return 'white';
  }
  if (role === 'black' || role === 'black_2') {
    return 'black';
  }
  return null;
}

export function getKgsSgfUrl(summary: GameSummary) {
  let [y, m, d] = summary.timestamp.split('-');
  let player1 = summary.players.white || summary.players.owner;
  let black = summary.players.black;
  let url = 'http://files.gokgs.com/games/' +
    y + '/' +
    parseInt(m, 10) + '/' +
    parseInt(d, 10) + '/' +
    player1.name;
  if (
    summary.type !== 'demonstration' &&
    summary.type !== 'review' &&
    summary.type !== 'rengo_review' &&
    black
  ) {
    url += '-' + black.name;
  }
  if (summary.revision) {
    url += '-' + (parseInt(summary.revision, 10) + 1);
  }
  url += '.sgf';
  return url;
}

export function getActionsForUser(
  actions: ?Array<{action: GameAction, user: UnparsedUser}>,
  name: string
): {[action: GameAction]: true} {
  let ret = {};
  if (!actions) {
    return ret;
  }
  for (let action of actions) {
    if (action.user.name === name) {
      ret[action.action] = true;
    }
  }
  return ret;
}