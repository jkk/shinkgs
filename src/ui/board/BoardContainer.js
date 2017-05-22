// @flow
import React, {PureComponent as Component} from 'react';
import Board from './Board';
import type {
  GameChannel,
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
  boardWidth: ?number
};

export default class BoardContainer extends Component {

  props: Props;
  state: State = {boardWidth: null};

  _containerRef: ?HTMLElement;

  _setBoardWidth = () => {
    if (this._containerRef) {
      // Note: this is tightly coupled to the CSS layout
      let containerWidth = this._containerRef.offsetWidth;
      let boardWidth = Math.min(
        containerWidth,
        this._containerRef.offsetHeight - 65
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
    let {game, onClickPoint} = this.props;
    let {boardWidth} = this.state;

    if (!boardWidth) {
      return (
        <div className='GameScreen-board-container' ref={this._setContainerRef} />
      );
    }

    let tree = game.tree;
    let board;
    let markup;
    if (tree) {
      let computedState = tree.computedState[tree.currentNode];
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
      </div>
    );
  }

  _setContainerRef = (ref: HTMLElement) => {
    this._containerRef = ref;
  }

  _onClickPoint = (loc: Point, color?: ?PlayerColor, mark?: ?BoardPointMark) => {
    this.props.onClickPoint(this.props.game, loc, color, mark);
  }
}
