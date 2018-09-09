// @flow
import React, { PureComponent as Component } from 'react';
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
  onClickPoint: (
    game: GameChannel,
    loc: Point,
    color?: ?PlayerColor,
    mark?: ?BoardPointMark
  ) => any
};

type State = {
  boardWidth: ?number,
  marginTop: number
};

export default class BoardContainer extends Component<> {
  static defaultProps: Props;
  state: State = { boardWidth: null, marginTop: 0 };

  _containerRef: ?HTMLElement;

  _setBoardWidth = () => {
    if (this._containerRef) {
      // Note: this is tightly coupled to the CSS layout
      let containerWidth = this._containerRef.offsetWidth;
      let containerHeight = this._containerRef.offsetHeight;
      let boardWidth = Math.min(containerWidth, containerHeight);
      let marginTop = -35;
      if (containerWidth <= 736 || containerWidth - boardWidth < 180) {
        boardWidth = Math.min(containerWidth, containerHeight - 35);
        marginTop = 0;
      }
      this.setState({ boardWidth, marginTop });
    }
  };

  componentDidMount() {
    this._setBoardWidth();
    window.addEventListener('resize', this._setBoardWidth);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._setBoardWidth);
  }

  render() {
    let { game, onClickPoint } = this.props;
    let { boardWidth, marginTop } = this.state;

    if (!boardWidth) {
      return (
        <div
          className='GameScreen-board-container'
          ref={this._setContainerRef}
        />
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
          style={{ width: boardWidth, height: boardWidth, marginTop }}>
          <div className='GameScreen-board-inner'>
            {board && markup ? (
              <Board
                board={board}
                markup={markup}
                width={boardWidth}
                onClickPoint={onClickPoint ? this._onClickPoint : undefined}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  _setContainerRef = (ref: HTMLElement) => {
    this._containerRef = ref;
  };

  _onClickPoint = (
    loc: Point,
    color?: ?PlayerColor,
    mark?: ?BoardPointMark
  ) => {
    this.props.onClickPoint(this.props.game, loc, color, mark);
  };
}
