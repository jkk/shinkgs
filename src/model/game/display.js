// @flow
import type {
  GameChannel,
  GameRules,
  GameScore,
  GameType,
  GameRuleSet,
  GameRole,
  PlayerColor
} from '../types';

function compareGames(a: GameChannel, b: GameChannel) {
  if (a.event && !b.event) {
    return -1;
  }
  if (!a.event && b.event) {
    return 1;
  }
  if (a.adjourned && !b.adjourned) {
    return 1;
  }
  if (!a.adjourned && b.adjourned) {
    return -1;
  }
  if (!a.players) {
    return 1;
  }
  if (!b.players) {
    return -1;
  }
  let pa = a.players.owner || a.players.challengeCreator || a.players.white;
  let pb = b.players.owner || b.players.challengeCreator || b.players.white;
  let par = (pa && pa.rankVal) || -99;
  let pbr = (pb && pb.rankVal) || -99;
  if (par === pbr) {
    let pa2 = a.players.black;
    let pb2 = b.players.black;
    let pa2r = (pa2 && pa2.rankVal) || -99;
    let pb2r = (pb2 && pb2.rankVal) || -99;
    if (pb2r === pa2r) {
      return (pa ? pa.name : '').localeCompare(pb ? pb.name : '');
    } else {
      return pb2r - pa2r;
    }
  }
  return pbr - par;
}

export function sortGames(games: Array<GameChannel>) {
  games.sort(compareGames);
}

const GAME_RESULT_LABEL = {
  UNKNOWN: 'Unknown',
  UNFINISHED: 'Unfinished',
  NO_RESULT: 'No Result',
  'B+RESIGN': 'B+Resign',
  'W+RESIGN': 'W+Resign',
  'B+FORFEIT': 'B+Forfeit',
  'W+FORFEIT': 'W+Forfeit',
  'B+TIME': 'B+Time',
  'W+TIME': 'W+Time'
};

export function formatGameScore(score: GameScore) {
  if (typeof score === 'number') {
    return score < 0 ? 'W+' + -score : 'B+' + score;
  } else {
    return GAME_RESULT_LABEL[score] || score;
  }
}

export function getWinningColor(score: ?GameScore): ?PlayerColor {
  if (!score) {
    return null;
  }
  if (typeof score === 'number') {
    return score < 0 ? 'white' : 'black';
  }
  let col = score.substring(0, 2);
  if (col === 'W+') {
    return 'white';
  } else if (col === 'B+') {
    return 'black';
  }
  return null;
}

export function formatDuration(duration: number) {
  let mins = Math.floor(duration / 60);
  let secs = duration - mins * 60;
  return '' + mins + ':' + (secs < 10 ? '0' : '') + secs;
}

export type GameTimeSpeed = 'very fast' | 'fast' | 'normal' | 'slow';

export function getGameTimeSpeed(rules: GameRules): GameTimeSpeed {
  if (rules.timeSystem === 'none') {
    return 'slow';
  }
  let mainTime = rules.mainTime || 0;
  if (mainTime >= 45 * 60) {
    return 'slow';
  }
  if (mainTime >= 25 * 60) {
    return 'normal';
  }
  if (rules.timeSystem === 'absolute') {
    if (mainTime >= 15 * 60) {
      return 'fast';
    } else {
      return 'very fast';
    }
  } else if (rules.timeSystem === 'canadian') {
    let pace = (rules.byoYomiTime || 0) / (rules.byoYomiStones || 1);
    if (pace >= 48) {
      return 'slow';
    }
    if (pace >= 14.4) {
      return 'normal';
    }
    if (mainTime >= 10 * 60) {
      return pace >= 9.6 ? 'normal' : 'fast';
    } else {
      return pace >= 7.2 ? 'fast' : 'very fast';
    }
  } else if (rules.timeSystem === 'byo_yomi') {
    let secs = rules.byoYomiTime || 0;
    let periods = rules.byoYomiPeriods || 0;
    if (secs > 60) {
      return 'slow';
    }
    if (periods > 10) {
      return 'normal';
    } else {
      if (periods === 1 && secs < 60) {
        return 'very fast';
      }
      if (secs >= 30) {
        return 'normal';
      } else if (secs >= 10) {
        return 'fast';
      } else {
        return 'very fast';
      }
    }
  }
  return 'normal';
}

export function formatGameTimeSystem(rules: GameRules) {
  if (rules.timeSystem === 'none') {
    return 'No time limit';
  } else if (rules.timeSystem === 'absolute') {
    return formatDuration(rules.mainTime || 0) + ' absolute';
  } else if (rules.timeSystem === 'byo_yomi') {
    return (
      formatDuration(rules.mainTime || 0) +
      ' + ' +
      (rules.byoYomiPeriods || 0) +
      '×' +
      formatDuration(rules.byoYomiTime || 0)
      // ' (byo-yomi)'
    );
  } else if (rules.timeSystem === 'canadian') {
    return (
      formatDuration(rules.mainTime || 0) +
      ' + ' +
      formatDuration(rules.byoYomiTime || 0) +
      '/' +
      (rules.byoYomiStones || 0)
      // ' (Canadian)'
    );
  }
}

const GAME_TYPE_LABEL = {
  challenge: 'Challenge',
  demonstration: 'Demonstration',
  review: 'Review',
  rengo_review: 'Rengo Review',
  teaching: 'Teaching',
  simul: 'Simul',
  rengo: 'Rengo',
  free: 'Free',
  ranked: 'Ranked',
  tournament: 'Tournament'
};

export function formatGameType(type: GameType) {
  return GAME_TYPE_LABEL[type];
}

const RULESET_LABEL = {
  japanese: 'Japanese',
  chinese: 'Chinese',
  aga: 'AGA',
  new_zealand: 'New Zealand'
};

export function formatGameRuleset(ruleset: GameRuleSet) {
  return RULESET_LABEL[ruleset];
}

const ROLE_LABELS = {
  black: 'Black',
  white: 'White',
  black_2: 'Black 2',
  white_2: 'White 2',
  challengeCreator: 'Creator',
  owner: 'Owner'
};

export function formatGameRole(role: GameRole) {
  return ROLE_LABELS[role];
}
