// @flow
import React, {PureComponent as Component} from 'react';
import BoardStone from './BoardStone';

export default class NigiriIcon extends Component<> {
  static defaultProps: {};
  render() {
    return (
      <div className='NigiriIcon'>
        <div className='NigiriIcon-black'>
          <div className='NigiriIcon-black-inner'>
            <BoardStone color='black' />
          </div>
        </div>
        <div className='NigiriIcon-white'>
          <div className='NigiriIcon-white-inner'>
            <BoardStone color='white' />
          </div>
        </div>
      </div>
    );
  }
}
