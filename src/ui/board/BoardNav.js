// @flow
import React, {PureComponent as Component} from 'react';
import Slider from 'rc-slider/lib/Slider';

export default class BoardNav extends Component {

  props: {
    nodeId: number,
    currentLine: Array<number>,
    onChangeCurrentNode: number => any
  };

  render() {
    let {nodeId, currentLine} = this.props;
    if (typeof nodeId !== 'number' || !currentLine) {
      return <div className='BoardNav' />;
    }
    let moveNum = currentLine.indexOf(nodeId);
    return (
      <div className='BoardNav'>
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
    );
  }

  _onChangeMoveNum = (val: number) => {
    let {currentLine} = this.props;
    let nodeId = currentLine[val];
    this.props.onChangeCurrentNode(nodeId);
  }
}
