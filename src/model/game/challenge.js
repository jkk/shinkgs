// @flow
import { userHasRank, userUnranked } from "../user";
import type { User, GameProposal, GameRules, Index } from "../types";

export const DEFAULT_KOMI = 6.5;

type MatchupInfo = {
  white: string,
  black: string,
  handicap: number,
  komi: number,
  nigiri: boolean,
  unranked: boolean,
};

export function getMatchupInfo(
  user1: User,
  user2: User,
  initialKomi?: number
): MatchupInfo {
  let rank1 = user1.rankVal;
  let rank2 = user2.rankVal;
  let unranked = userUnranked(user1) || userUnranked(user2);
  if (
    !userHasRank(user1) ||
    !userHasRank(user2) ||
    user1.rankVal === user2.rankVal ||
    typeof rank1 !== "number" ||
    typeof rank2 !== "number"
  ) {
    return {
      white: user1.name,
      black: user2.name,
      handicap: 0,
      komi: initialKomi || DEFAULT_KOMI,
      nigiri: true,
      unranked,
    };
  }
  rank1 = rank1 < 0 ? rank1 + 1 : rank1;
  rank2 = rank2 < 0 ? rank2 + 1 : rank2;
  let white;
  let black;
  let handicap;
  let komi = 0.5;
  let nigiri = false;
  if (rank1 > rank2) {
    white = user1.name;
    black = user2.name;
    handicap = Math.max(0, Math.min(rank1 - rank2, 9));
  } else {
    white = user2.name;
    black = user1.name;
    handicap = Math.max(0, Math.min(rank2 - rank1, 9));
  }
  if (handicap === 1) {
    handicap = 0;
  }
  return { white, black, handicap, komi, nigiri, unranked };
}

export function proposalsEqual(p1: GameProposal, p2: GameProposal) {
  if (
    p1.gameType !== p2.gameType ||
    p1.nigiri !== p2.nigiri ||
    p1.private !== p2.private ||
    p1.rules.size !== p2.rules.size ||
    p1.rules.komi !== p2.rules.komi ||
    (p1.rules.handicap || 0) !== (p2.rules.handicap || 0) ||
    p1.rules.rules !== p2.rules.rules ||
    p1.rules.timeSystem !== p2.rules.timeSystem ||
    p1.rules.mainTime !== p2.rules.mainTime ||
    p1.rules.byoYomiPeriods !== p2.rules.byoYomiPeriods ||
    p1.rules.byoYomiStones !== p2.rules.byoYomiStones ||
    p1.rules.byoYomiTime !== p2.rules.byoYomiTime ||
    p1.players.length !== p2.players.length
  ) {
    return false;
  }
  if (p1.nigiri) {
    return true;
  }
  for (let i = 0; i < p1.players.length; i++) {
    if (p1.players[i].role !== p2.players[i].role) {
      return false;
    }
    let name1 = p1.players[i].user
      ? p1.players[i].user.name
      : p1.players[i].name;
    let name2 = p2.players[i].user
      ? p2.players[i].user.name
      : p2.players[i].name;
    if (name1 !== name2) {
      return false;
    }
  }
  return true;
}

export function getEvenProposal(
  initialProposal: GameProposal,
  challengerName: string,
  usersByName: Index<User>
): GameProposal {
  let proposal = { ...initialProposal };
  let players = [];
  let otherUser;
  let challenging = false;

  // Put players into expected format (name only, not full user)
  // and while we're at it, figure out who the other user is and if
  // we're challening or receiving challenges
  for (let player of proposal.players) {
    let newPlayer = { ...player };
    if (newPlayer.user) {
      newPlayer.name = newPlayer.user.name;
      delete newPlayer.user;
    } else if (!newPlayer.name) {
      newPlayer.name = challengerName;
      challenging = true;
    }
    if (newPlayer.name !== challengerName) {
      otherUser = usersByName[newPlayer.name];
    }
    players.push(newPlayer);
  }

  // If sending a challenge, auto-set handicap and komi as appropriate
  let challenger = usersByName[challengerName];
  if (challenging && otherUser && challenger) {
    let matchupInfo = getMatchupInfo(
      challenger,
      otherUser,
      proposal.rules.komi
    );
    let { handicap, komi, nigiri, white, black, unranked } = matchupInfo;
    proposal.rules = {
      ...proposal.rules,
      handicap,
      komi,
    };
    proposal.nigiri = nigiri;
    if (unranked && proposal.gameType === "ranked") {
      proposal.gameType = "free";
    }
    for (let player of players) {
      if (!player.name) {
        continue;
      }
      if (player.name === white) {
        player.role = "white";
      } else if (player.name === black) {
        player.role = "black";
      }
    }
  }

  proposal.players = players;

  if (!proposal.status) {
    proposal.status = "setup";
  }

  return proposal;
}

export function createInitialProposal(
  currentUser: User,
  lastProposal?: ?GameProposal
): GameProposal {
  let players = [{ name: currentUser.name, role: "white" }, { role: "black" }];
  let flags = currentUser.flags;
  let canPlayRanked =
    !userUnranked(currentUser) &&
    (!flags ||
      (flags.canPlayRanked !== undefined ? flags.canPlayRanked : true));
  let gameType = lastProposal
    ? lastProposal.gameType
    : canPlayRanked
    ? "ranked"
    : "free";
  let rules: GameRules = lastProposal
    ? lastProposal.rules
    : {
        komi: DEFAULT_KOMI,
        size: 19,
        rules: "japanese",
        timeSystem: "byo_yomi",
        mainTime: 60 * 20,
        byoYomiPeriods: 5,
        byoYomiTime: 30,
      };
  let proposal = {
    gameType,
    players,
    rules,
    nigiri: true,
  };
  return proposal;
}

export function getOtherPlayerName(proposal: GameProposal, ourName: string) {
  for (let player of proposal.players) {
    let name = player.user ? player.user.name : player.name;
    if (name && name !== ourName) {
      return name;
    }
  }
  return null;
}
