// @flow
import React, {PureComponent as Component} from 'react';
import {A} from '../common';
import {range} from '../../util/collection';
import type {
  BoardState,
  BoardMarkup,
  BoardPointMark,
  PlayerColor,
  Point
} from '../../model/types';

let xLabels = 'ABCDEFGHJKLMNOPQRST'.split('');

class BoardStoneSlot extends Component<{
  x: number,
  y: number,
  color: ?PlayerColor,
  mark: ?BoardPointMark,
  label: ?string,
  onClick: ?((loc: Point, color?: ?PlayerColor, mark?: ?BoardPointMark) => any)
}> {
  render() {
    let {color, mark, label} = this.props;
    return (
      <A button className='Board-stone-slot' onClick={this._onClickPoint}>
        {color ?
          <div className={'Board-stone Board-stone-' + color} /> : null}
        {mark ?
          <div className={'Board-stone-mark Board-stone-mark-' + mark} /> : null}
        {label ?
          <div className='Board-stone-label'>{label}</div> : null}
      </A>
    );
  }

  _onClickPoint = () => {
    let {x, y} = this.props;
    if (this.props.onClick) {
      this.props.onClick({x, y}, this.props.color, this.props.mark);
    }
  }
}

export default class Board extends Component<{
  board: BoardState,
  markup: BoardMarkup,
  width: number,
  onClickPoint?: ?((loc: Point, color?: ?PlayerColor, mark?: ?BoardPointMark) => any)
}> {
  render() {
    let {board, markup, onClickPoint} = this.props;
    let size = board.length;
    let sizeRange = range(size);
    let className = 'Board' +
      ' Board-size-' + size +
      (onClickPoint ? ' Board-clickable' : '');
    return (
      <div className={className}>
        <div className='Board-inner'>
          <div className='Board-grid'>
            <div className='Board-grid-lines-y'>
              {sizeRange.map(y =>
                <div key={y} className='Board-grid-line-y' />
              )}
            </div>
            <div className='Board-grid-lines-x'>
              {sizeRange.map(x =>
                <div key={x} className='Board-grid-line-x' />
              )}
            </div>
          </div>
          <div className='Board-star-points'>
            {range(0, 9).map(i =>
              <div key={i} className={'Board-star-point Board-star-point-' + i} />
            )}
          </div>
          <div className='Board-coords'>
            <div className='Board-coords-top'>
              {sizeRange.map(x =>
                <div key={x} className='Board-coord-label'>{xLabels[x]}</div>
              )}
            </div>
            <div className='Board-coords-bottom'>
              {sizeRange.map(x =>
                <div key={x} className='Board-coord-label'>{xLabels[x]}</div>
              )}
            </div>
            <div className='Board-coords-left'>
              {sizeRange.map(y =>
                <div key={y} className='Board-coord-label'>{size - y}</div>
              )}
            </div>
            <div className='Board-coords-right'>
              {sizeRange.map(y =>
                <div key={y} className='Board-coord-label'>{size - y}</div>
              )}
            </div>
          </div>
          <div className='Board-stones'>
            {range(size).map(y =>
              <div key={y} className='Board-stones-line'>
                {range(size).map(x => {
                  let color = board[y][x];
                  let mark = markup.marks[y] && markup.marks[y][x];
                  let label = markup.labels[y] && markup.labels[y][x];
                  return (
                    <BoardStoneSlot
                      key={y * size + x}
                      x={x}
                      y={y}
                      color={color}
                      mark={mark}
                      label={label}
                      onClick={onClickPoint} />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
