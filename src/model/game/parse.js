// @flow
import uuidV4 from "uuid/v4";
import { computeGameNodeStates, validateRuleSet, getGameLine } from "./tree";
import { parseUser } from "../user";
import type {
  GameChannel,
  GameRules,
  GameSummary,
  GameTree,
  SgfEvent,
  SgfProp,
  SgfLoc,
  GameRuleSet,
  ConversationMessage
} from "../types";
import { GameNode } from "../types";

export function parseGameSummary(values: Object): GameSummary {
  let rules: GameRules = {
    size: values.size,
    komi: values.komi
  };
  if (values.handicap) {
    rules.handicap = values.handicap;
  }
  let summary: GameSummary = {
    type: values.gameType,
    timestamp: values.timestamp,
    rules: rules,
    players: values.players
  };
  if (values.score) {
    summary.score = values.score;
  }
  if (values.revision) {
    summary.revision = values.revision;
  }
  if (values.tag) {
    summary.tag = values.tag;
  }
  if (values.private) {
    summary.private = values.private;
  }
  if (values.inPlay) {
    summary.inPlay = values.inPlay;
  }
  return summary;
}

function parseGameComments(
  node: GameNode,
  commentDate?: ?Date
): Array<ConversationMessage> {
  let msgs = [];
  for (let prop of node.props) {
    if (prop.name !== "COMMENT") {
      continue;
    }
    let text = prop.text;
    if (!text) {
      continue;
    }
    let lines = text.split(/[\r\n]+/m);
    let lineMsgs: Array<ConversationMessage> = [];
    for (let line of lines) {
      let match = line.match(/([a-zA-Z0-9]{1,10})[0-9\s[\]dpk?-]*?:(.+)/);
      let username = match && match[1];
      let body = match && match[2];
      if (!username || !body) {
        break;
      }
      lineMsgs.push({
        id: uuidV4(),
        sender: username,
        body: body.trim(),
        date: commentDate
      });
    }
    if (lineMsgs.length) {
      msgs.push(...lineMsgs);
    }
  }
  return msgs;
}

function addPropsToNode(
  tree: GameTree,
  nodeId: number,
  props: Array<SgfProp>,
  commentDate?: ?Date
) {
  let node = tree.nodes[nodeId];
  let newProps = node ? [...node.props] : [];
  newProps.push(...props);
  let newNode = new GameNode(
    newProps,
    node ? node.children : [],
    node ? node.parent : null
  );
  tree.nodes = {
    ...tree.nodes,
    [nodeId]: newNode
  };
  tree.computedState = computeGameNodeStates(tree, nodeId);
  tree.messages = {
    ...tree.messages,
    [nodeId]: parseGameComments(newNode, commentDate)
  };
}

function addNodeChild(
  tree: GameTree,
  nodeId: number,
  childNodeId: number,
  pos: number
) {
  let node = tree.nodes[nodeId];
  let newChildren = node ? [...node.children] : [];
  if (newChildren.indexOf(childNodeId) === -1) {
    newChildren.splice(pos, 0, childNodeId);
  }
  tree.nodes = {
    ...tree.nodes,
    [nodeId]: new GameNode(
      node ? node.props : [],
      newChildren,
      node ? node.parent : null
    ),
    [childNodeId]: new GameNode([], [], nodeId)
  };
}

function locsEqual(loc1: ?SgfLoc, loc2: ?SgfLoc) {
  if (!loc1 || !loc2) {
    return loc1 === loc2;
  }
  if (loc1 === "PASS") {
    return loc1 === loc2;
  } else if (loc2 !== "PASS") {
    return loc1.x === loc2.x && loc1.y === loc2.y;
  } else {
    return false;
  }
}

function propMatches(prop1: SgfProp, prop2: SgfProp) {
  return prop1.name === prop2.name && locsEqual(prop1.loc, prop2.loc);
}

function removePropsFromNode(
  tree: GameTree,
  nodeId: number,
  props: Array<SgfProp>
) {
  let node = tree.nodes[nodeId];
  let newProps = node.props.filter(
    nprop => !props.find(prop => propMatches(prop, nprop))
  );
  let newNode = new GameNode(newProps, node.children, node.parent);
  tree.nodes = {
    ...tree.nodes,
    [nodeId]: newNode
  };
}

function replaceNodeProp(tree: GameTree, nodeId: number, prop: SgfProp) {
  let node = tree.nodes[nodeId];
  let newProps = node.props.filter(
    nprop => (propMatches(prop, nprop) ? prop : nprop)
  );
  let newNode = new GameNode(newProps, node.children, node.parent);
  tree.nodes = {
    ...tree.nodes,
    [nodeId]: newNode
  };
}

function parseSgfEvents(prevTree: ?GameTree, events: Array<SgfEvent>) {
  let tree: ?GameTree = prevTree ? { ...prevTree } : null;
  for (let event of events) {
    if (!tree) {
      tree = {
        nodes: {},
        computedState: {},
        messages: {},
        rootNode: event.nodeId,
        activeNode: event.nodeId,
        currentNode: event.nodeId,
        currentLine: [event.nodeId]
      };
    }
    if (event.type === "PROP_ADDED") {
      addPropsToNode(tree, event.nodeId, [event.prop]);
    } else if (event.type === "PROP_REMOVED") {
      removePropsFromNode(tree, event.nodeId, [event.prop]);
    } else if (event.type === "PROP_CHANGED") {
      let prop = event.prop;
      if (prop.name === "COMMENT") {
        // Special case for game chats
        addPropsToNode(tree, event.nodeId, [event.prop], new Date());
      } else {
        replaceNodeProp(tree, event.nodeId, event.prop);
      }
    } else if (event.type === "CHILDREN_REORDERED") {
      let node = tree.nodes[event.nodeId];
      let newNode = new GameNode(node.props, event.children, node.parent);
      tree.nodes = {
        ...tree.nodes,
        [event.nodeId]: newNode
      };
      tree.currentLine = getGameLine(tree, tree.currentNode);
    } else if (event.type === "CHILD_ADDED") {
      addNodeChild(tree, event.nodeId, event.childNodeId, event.position || 0);
      tree.currentLine = getGameLine(tree, tree.currentNode);
    } else if (event.type === "PROP_GROUP_ADDED") {
      addPropsToNode(tree, event.nodeId, event.props);
    } else if (event.type === "PROP_GROUP_REMOVED") {
      removePropsFromNode(tree, event.nodeId, event.props);
    } else if (event.type === "ACTIVATED") {
      if (tree.currentNode === tree.activeNode) {
        tree.currentNode = event.nodeId;
      }
      tree.activeNode = event.nodeId;
      tree.computedState = computeGameNodeStates(tree, tree.activeNode);
    } else {
      // Unsupported event type (e.g. live streaming) - ignore
    }
  }
  return tree;
}

function parseGameRulesFromTree(tree: GameTree): ?GameRules {
  let rootNode = tree.nodes[tree.rootNode];
  if (!rootNode) {
    return null;
  }
  let rulesProp: ?Object = rootNode.props.find(p => p.name === "RULES");
  if (!rulesProp) {
    return null;
  }
  let size = typeof rulesProp.size === "number" ? rulesProp.size : 19;
  let komi = typeof rulesProp.komi === "number" ? rulesProp.komi : 6.5;
  let ruleset: ?GameRuleSet =
    typeof rulesProp.rules !== "undefined"
      ? validateRuleSet(rulesProp.rules)
      : null;
  let rules: GameRules = { size, komi };
  if (ruleset) {
    rules.rules = ruleset;
  }
  if (typeof rulesProp.handicap === "number") {
    rules.handicap = rulesProp.handicap;
  }
  if (typeof rulesProp.timeSystem === "string") {
    rules.timeSystem = rulesProp.timeSystem;
  }
  if (typeof rulesProp.mainTime === "number") {
    rules.mainTime = rulesProp.mainTime;
  }
  if (typeof rulesProp.byoYomiTime === "number") {
    rules.byoYomiTime = rulesProp.byoYomiTime;
  }
  if (typeof rulesProp.byoYomiPeriods === "number") {
    rules.byoYomiPeriods = rulesProp.byoYomiPeriods;
  }
  if (typeof rulesProp.byoYomiStones === "number") {
    rules.byoYomiStones = rulesProp.byoYomiStones;
  }
  return rules;
}

// Props we store as-is without parsing
const GAME_CHAN_PROPS = [
  "initialProposal",
  "rules",
  "moveNum",
  "roomId",
  "observers",
  "name",
  "score",
  "private",
  "global",
  "over",
  "adjourned",
  "subscribers",
  "event",
  "uploaded",
  "audio",
  "paused",
  "named",
  "saved",
  "actions",
  "clocks",
  "whiteDoneSent",
  "blackDoneSent",
  "whiteScore",
  "blackScore",
  "doneId"
];

let gameTimes: { [gameTime: number]: true } = {};

function getUniqueGameTime() {
  let time = Date.now();
  while (gameTimes[time]) {
    time++;
  }
  gameTimes[time] = true;
  return time;
}

export function parseGameChannel(
  chan: ?GameChannel,
  values: Object
): GameChannel {
  let newChan: Object = chan ? { ...chan } : { time: getUniqueGameTime() };
  if (values.channelId) {
    newChan.id = values.channelId;
  }
  if (values.gameType) {
    newChan.type = values.gameType;
  }
  if (values.gameSummary) {
    newChan.summary = parseGameSummary(values.gameSummary);
  }
  if (values.players) {
    newChan.players = {};
    for (let role of Object.keys(values.players)) {
      newChan.players[role] = parseUser(null, values.players[role]);
    }
  }
  if (!values.rules && values.size && values.komi) {
    let rules: GameRules = {
      size: values.size,
      komi: values.komi
    };
    if (values.handicap) {
      rules.handicap = values.handicap;
    }
    newChan.rules = newChan.rules ? { ...newChan.rules, ...rules } : rules;
  }
  if (values.users) {
    newChan.users = values.users.map(u => u.name);
  }
  if (values.sgfEvents) {
    let prevTree =
      values.type === "GAME_JOIN" && values.sgfEvents.length
        ? null
        : newChan.tree;
    newChan.tree = parseSgfEvents(prevTree, values.sgfEvents);
    if (newChan.tree) {
      delete newChan.tree.pendingMove;
    }
    delete newChan.undoRequest;
    if (newChan.tree) {
      let treeRules = parseGameRulesFromTree(newChan.tree);
      if (treeRules) {
        newChan.rules = { ...treeRules, ...newChan.rules };
      }
    }
  }
  for (let key of GAME_CHAN_PROPS) {
    if (key in values) {
      newChan[key] = values[key];
    }
  }
  return newChan;
}
