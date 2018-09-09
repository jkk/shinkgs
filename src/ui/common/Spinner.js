// @flow
import React, {PureComponent as Component} from 'react';
import {Icon} from './Icon';

export class Spinner extends Component<> {
  static defaultProps: {};
  render() {
    return (
      <div className='Spinner'>
        <div className='Spinner-icon'>
          <Icon name='spinner' />
        </div>
      </div>
    );
  }
}
