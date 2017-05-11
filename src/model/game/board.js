// @flow
import {InvariantError} from '../../util/error';
import type {
  SgfLoc,
  SgfProp,
  SgfColor,
  GameRuleSet,
  BoardState,
  Point
} from '../types';

export function createBoardState(size: number): BoardState {
  let board = [];
  while (size) {
    board.push([]);
    size--;
  }
  return board;
}

export function copyBoardState(board: BoardState): BoardState {
  let newBoard = [...board];
  for (let i = 0; i < newBoard.length; i++) {
    newBoard[i] = [...newBoard[i]];
  }
  return newBoard;
}

type StoneGroup = {
  id: number,
  color: 'white' | 'black',
  points: Array<Point>,
  liberties: number
};

export function getStoneGroup(board: BoardState, x: number, y: number): StoneGroup | null {
  let color = board[y][x];
  if (!color) {
    return null;
  }
  let size = board.length;
  let id = y * size + x;
  let points: Array<Point> = [];
  let liberties = 0;
  let pointsChecked = {[id]: true};
  let pointsToCheck: Array<Point> = [{x, y}];
  while (pointsToCheck.length) {
    let pt = pointsToCheck.pop();
    let ptId = pt.y * size + pt.x;
    if (ptId < id) {
      id = ptId;
    }
    points.push(pt);
    if (pt.y > 0) {
      let bpt = board[pt.y - 1][pt.x];
      let bptId = (pt.y - 1) * size + pt.x;
      if (!bpt) {
        liberties++;
      } else if (bpt === color && !pointsChecked[bptId]) {
        pointsChecked[bptId] = true;
        pointsToCheck.push({y: pt.y - 1, x: pt.x});
      }
    }
    if (pt.y < size - 1) {
      let bpt = board[pt.y + 1][pt.x];
      let bptId = (pt.y + 1) * size + pt.x;
      if (!bpt) {
        liberties++;
      } else if (bpt === color && !pointsChecked[bptId]) {
        pointsChecked[bptId] = true;
        pointsToCheck.push({y: pt.y + 1, x: pt.x});
      }
    }
    if (pt.x > 0) {
      let bpt = board[pt.y][pt.x - 1];
      let bptId = pt.y * size + pt.x - 1;
      if (!bpt) {
        liberties++;
      } else if (bpt === color && !pointsChecked[bptId]) {
        pointsChecked[bptId] = true;
        pointsToCheck.push({y: pt.y, x: pt.x - 1});
      }
    }
    if (pt.x < size - 1) {
      let bpt = board[pt.y][pt.x + 1];
      let bptId = pt.y * size + pt.x + 1;
      if (!bpt) {
        liberties++;
      } else if (bpt === color && !pointsChecked[bptId]) {
        pointsChecked[bptId] = true;
        pointsToCheck.push({y: pt.y, x: pt.x + 1});
      }
    }
  }
  return {
    id,
    color,
    points,
    liberties
  };
}

function removeDeadStonesAround(board: BoardState, x: number, y: number) {
  let color = board[y][x];
  if (!color) {
    return null;
  }
  let oppositeColor = color === 'white' ? 'black' : 'white';

  let size = board.length;
  let groups = {};

  // Above
  if (y > 0) {
    let group = getStoneGroup(board, x, y - 1);
    if (group && group.color === oppositeColor && !group.liberties) {
      groups[group.id] = group;
    }
  }
  // Below
  if (y < size - 1) {
    let group = getStoneGroup(board, x, y + 1);
    if (group && group.color === oppositeColor && !group.liberties && !groups[group.id]) {
      groups[group.id] = group;
    }
  }
  // Left
  if (x > 0) {
    let group = getStoneGroup(board, x - 1, y);
    if (group && group.color === oppositeColor && !group.liberties && !groups[group.id]) {
      groups[group.id] = group;
    }
  }
  // Right
  if (x < size - 1) {
    let group = getStoneGroup(board, x + 1, y);
    if (group && group.color === oppositeColor && !group.liberties && !groups[group.id]) {
      groups[group.id] = group;
    }
  }

  let groupIds = Object.keys(groups);
  if (!groupIds.length) {
    return null;
  }

  let newBoard = copyBoardState(board);
  let blackCaps = 0;
  let whiteCaps = 0;
  for (let groupId of groupIds) {
    let group = groups[groupId];
    if (group.color === 'white') {
      blackCaps += group.points.length;
    } else {
      whiteCaps += group.points.length;
    }
    for (let gPt of group.points) {
      newBoard[gPt.y][gPt.x] = null;
    }
  }
  return {
    blackCaptures: blackCaps,
    whiteCaptures: whiteCaps,
    board: newBoard
  };
}

export function applyPropsToBoard(
  props: Array<SgfProp>,
  board: BoardState,
  ruleset: GameRuleSet
) {
  if (!ruleset) {
    // TODO - actually use ruleset
    throw new InvariantError('Rule set required');
  }
  let blackCaps = 0;
  let whiteCaps = 0;
  let newBoard = copyBoardState(board);
  for (let prop of props) {
    let loc: ?SgfLoc = prop.loc;
    if (prop.name === 'MOVE' || prop.name === 'ADDSTONE') {
      if (!loc || !prop.color) {
        throw new InvariantError('Missing loc or color on MOVE/ADDSTONE prop');
      }
      let color: SgfColor = prop.color;
      if (loc !== 'PASS') {
        newBoard[loc.y][loc.x] = color === 'empty' ? null : color;
        if (prop.name === 'MOVE') {
          let ret = removeDeadStonesAround(newBoard, loc.x, loc.y);
          // TODO - check for auto-capture for appropriate rulesets
          if (ret) {
            newBoard = ret.board;
            blackCaps += ret.blackCaptures;
            whiteCaps += ret.whiteCaptures;
          }
        }
      }
    }
  }
  return {
    blackCaptures: blackCaps,
    whiteCaptures: whiteCaps,
    board: newBoard
  };
}
