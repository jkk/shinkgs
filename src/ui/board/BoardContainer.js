// @flow
import React, {PureComponent as Component} from 'react';
import Board from './Board';
import BoardNav from './BoardNav';
import {A, Icon} from '../common';
import {getGameLine} from '../../model/game';
import type {
  GameChannel,
  GameTree,
  Point,
  BoardPointMark,
  PlayerColor
} from '../../model/types';

type Props = {
  game: GameChannel,
  playing?: boolean,
  onClickPoint: (game: GameChannel, loc: Point, color?: ?PlayerColor, mark?: ?BoardPointMark) => any
};

type State = {
  nodeId: number | null,
  currentLine: Array<number> | null,
  boardWidth?: ?number
};

export default class BoardContainer extends Component {

  props: Props;
  state: State = this._getState(null, this.props.game.tree, null);

  _containerRef: ?HTMLElement;

  _getState(prevTree: ?GameTree, nextTree: ?GameTree, prevNodeId: number | null) {
    let nodeId = prevNodeId;
    if (nodeId === null || (prevTree && nodeId === prevTree.activeNode)) {
      nodeId = nextTree && typeof nextTree.activeNode === 'number' ? nextTree.activeNode : null;
    }
    return {
      nodeId,
      currentLine: nextTree && typeof nodeId === 'number' ? getGameLine(nextTree, nodeId) : null
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    let nextTree = nextProps.game.tree;
    let thisTree = this.props.game.tree;
    if (nextTree !== thisTree) {
      this.setState(this._getState(thisTree, nextTree, this.state.nodeId));
    }
  }

  _setBoardWidth = () => {
    if (this._containerRef) {
      let boardWidth = Math.min(
        this._containerRef.offsetWidth,
        this._containerRef.offsetHeight - 100
      );
      this.setState({boardWidth});
    }
  }

  componentDidMount() {
    this._setBoardWidth();
    window.addEventListener('resize', this._setBoardWidth);
    document.addEventListener('keydown', this._onKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._setBoardWidth);
    document.removeEventListener('keydown', this._onKeyDown);
  }

  render() {
    let {game, playing, onClickPoint} = this.props;
    let {nodeId, currentLine, boardWidth} = this.state;

    if (!boardWidth) {
      return (
        <div className='GameScreen-board-container' ref={this._setContainerRef} />
      );
    }

    let tree = game.tree;
    let board;
    let markup;
    if (tree && typeof nodeId === 'number') {
      let computedState = tree.computedState[nodeId];
      if (computedState) {
        board = computedState.board;
        markup = computedState.markup;
      }
    }
    return (
      <div className='GameScreen-board-container' ref={this._setContainerRef}>
        <div
          className='GameScreen-board'
          style={{width: boardWidth, height: boardWidth}}>
          <div className='GameScreen-board-inner'>
            {board && markup ?
              <Board
                board={board}
                markup={markup}
                onClickPoint={onClickPoint ? this._onClickPoint : undefined} /> : null}
          </div>
        </div>
        {playing ? null : (
          <div className='GameScreen-board-bar' style={{width: boardWidth}}>
            {currentLine ?
              <div className='GameScreen-board-step'>
                <A className='GameScreen-board-prev' onClick={this._onPrev}>
                  <Icon name='chevron-left' />
                </A>
                <A className='GameScreen-board-next' onClick={this._onNext}>
                  <Icon name='chevron-right' />
                </A>
              </div> : null}
            <div className='GameScreen-board-nav'>
              <BoardNav
                nodeId={nodeId}
                currentLine={currentLine}
                onChangeMoveNum={this._onChangeMoveNum} />
            </div>
          </div>
        )}
      </div>
    );
  }

  _setContainerRef = (ref: HTMLElement) => {
    this._containerRef = ref;
  }

  _onChangeMoveNum = (moveNum: number) => {
    let {currentLine} = this.state;
    if (!currentLine) {
      return;
    }
    let nodeId = currentLine[moveNum];
    if (typeof nodeId === 'number') {
      this.setState({nodeId});
    }
  }

  _onPrev = () => {
    let {currentLine, nodeId} = this.state;
    if (currentLine && typeof nodeId === 'number') {
      let idx = currentLine.indexOf(nodeId);
      if (idx > 0) {
        this.setState({nodeId: currentLine[idx - 1]});
      }
    }
  }

  _onNext = () => {
    let {currentLine, nodeId} = this.state;
    if (currentLine && typeof nodeId === 'number') {
      let idx = currentLine.indexOf(nodeId);
      if (idx < currentLine.length - 1) {
        this.setState({nodeId: currentLine[idx + 1]});
      }
    }
  }

  _onKeyDown = (e: Object) => {
    let node = e.target;
    while (node) {
      if (node.nodeName === 'INPUT' || node.nodeName === 'SELECT' || node.nodeName === 'TEXTAREA') {
        if (node.value) {
          return;
        }
      }
      node = node.parentNode;
    }
    if (e.key === 'ArrowLeft' || e.keyCode === 37) {
      this._onPrev();
    } else if (e.key === 'ArrowRight' || e.keyCode === 39) {
      this._onNext();
    } else if (e.key === 'ArrowUp' || e.keyCode === 38) {
      let {currentLine, nodeId} = this.state;
      if (currentLine && typeof nodeId === 'number') {
        this.setState({nodeId: currentLine[currentLine.length - 1]});
      }
    } else if (e.key === 'ArrowDown' || e.keyCode === 40) {
      let {currentLine, nodeId} = this.state;
      if (currentLine && typeof nodeId === 'number') {
        this.setState({nodeId: currentLine[0]});
      }
    }
  }

  _onClickPoint = (loc: Point, color?: ?PlayerColor, mark?: ?BoardPointMark) => {
    this.props.onClickPoint(this.props.game, loc, color, mark);
  }
}
