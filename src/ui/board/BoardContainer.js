// @flow
import React, {PureComponent as Component} from 'react';
import Board from './Board';
import BoardNav from './BoardNav';
import {A, Icon} from '../common';
import type {
  GameChannel,
  Point,
  BoardPointMark,
  PlayerColor
} from '../../model/types';

type Props = {
  game: GameChannel,
  playing?: boolean,
  onChangeCurrentNode: (game: GameChannel, nodeId: number) => any,
  onClickPoint: (game: GameChannel, loc: Point, color?: ?PlayerColor, mark?: ?BoardPointMark) => any
};

type State = {
  boardWidth: ?number
};

export default class BoardContainer extends Component {

  props: Props;
  state: State = {boardWidth: null};

  _containerRef: ?HTMLElement;

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
    let {boardWidth} = this.state;

    if (!boardWidth) {
      return (
        <div className='GameScreen-board-container' ref={this._setContainerRef} />
      );
    }

    let tree = game.tree;
    let nodeId;
    let currentLine;
    let board;
    let markup;
    if (tree) {
      nodeId = tree.currentNode;
      currentLine = tree.currentLine;
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
                width={boardWidth}
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
              {typeof nodeId === 'number' && currentLine ?
                <BoardNav
                  nodeId={nodeId}
                  currentLine={currentLine}
                  onChangeCurrentNode={this._onChangeCurrentNode} /> : null}
            </div>
          </div>
        )}
      </div>
    );
  }

  _setContainerRef = (ref: HTMLElement) => {
    this._containerRef = ref;
  }

  _onChangeCurrentNode = (nodeId: number) => {
    this.props.onChangeCurrentNode(this.props.game, nodeId);
  }

  _onPrev = () => {
    let {game} = this.props;
    let tree = game.tree;
    if (tree) {
      let idx = tree.currentLine.indexOf(tree.currentNode);
      if (idx > 0) {
        this._onChangeCurrentNode(tree.currentLine[idx - 1]);
      }
    }
  }

  _onNext = () => {
    let {game} = this.props;
    let tree = game.tree;
    if (tree) {
      let idx = tree.currentLine.indexOf(tree.currentNode);
      if (idx < tree.currentLine.length - 1) {
        this._onChangeCurrentNode(tree.currentLine[idx + 1]);
      }
    }
  }

  _onLast = () => {
    let {game} = this.props;
    let tree = game.tree;
    if (tree) {
      this._onChangeCurrentNode(tree.currentLine[tree.currentLine.length - 1]);
    }
  }

  _onFirst = () => {
    let {game} = this.props;
    let tree = game.tree;
    if (tree) {
      this._onChangeCurrentNode(tree.currentLine[0]);
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
      this._onLast();
    } else if (e.key === 'ArrowDown' || e.keyCode === 40) {
      this._onFirst();
    }
  }

  _onClickPoint = (loc: Point, color?: ?PlayerColor, mark?: ?BoardPointMark) => {
    this.props.onClickPoint(this.props.game, loc, color, mark);
  }
}
