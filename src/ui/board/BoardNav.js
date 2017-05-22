// @flow
import React, {PureComponent as Component} from 'react';
import Slider from 'rc-slider/lib/Slider';
import {A, Icon} from '../common';

export default class BoardNav extends Component {

  props: {
    nodeId: number,
    currentLine: Array<number>,
    onChangeCurrentNode: number => any
  };

  componentDidMount() {
    document.addEventListener('keydown', this._onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  render() {
    let {nodeId, currentLine} = this.props;
    if (typeof nodeId !== 'number' || !currentLine) {
      return <div className='BoardNav' />;
    }
    let moveNum = currentLine.indexOf(nodeId);
    return (
      <div className='BoardNav'>
        <div className='BoardNav-slide-container'>
          <div className='BoardNav-move'>
            Move {moveNum}
          </div>
          <div className='BoardNav-slide'>
            <Slider
              min={0}
              max={currentLine.length - 1}
              step={1}
              value={moveNum}
              onChange={this._onChangeMoveNum} />
          </div>
        </div>
        <div className='BoardNav-step'>
          <A className='BoardNav-prev' onClick={this._onPrev}>
            <Icon name='chevron-left' />
          </A>
          <A className='BoardNav-next' onClick={this._onNext}>
            <Icon name='chevron-right' />
          </A>
        </div>
      </div>
    );
  }

  _onChangeMoveNum = (val: number) => {
    let {currentLine} = this.props;
    let nodeId = currentLine[val];
    this.props.onChangeCurrentNode(nodeId);
  }

  _onPrev = () => {
    let {nodeId, currentLine} = this.props;
    let idx = currentLine.indexOf(nodeId);
    if (idx > 0) {
      this.props.onChangeCurrentNode(currentLine[idx - 1]);
    }
  }

  _onNext = () => {
    let {nodeId, currentLine} = this.props;
    let idx = currentLine.indexOf(nodeId);
    if (idx < currentLine.length - 1) {
      this.props.onChangeCurrentNode(currentLine[idx + 1]);
    }
  }

  _onLast = () => {
    let {currentLine} = this.props;
    this.props.onChangeCurrentNode(currentLine[currentLine.length - 1]);
  }

  _onFirst = () => {
    let {currentLine} = this.props;
    this.props.onChangeCurrentNode(currentLine[0]);
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
}
