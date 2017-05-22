// @flow
import React, {PureComponent as Component} from 'react';
import Board from './Board';
import BoardNav from './BoardNav';
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
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._setBoardWidth);
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
            {typeof nodeId === 'number' && currentLine ?
              <BoardNav
                nodeId={nodeId}
                currentLine={currentLine}
                onChangeCurrentNode={this._onChangeCurrentNode} /> : null}
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

  _onClickPoint = (loc: Point, color?: ?PlayerColor, mark?: ?BoardPointMark) => {
    this.props.onClickPoint(this.props.game, loc, color, mark);
  }
}
