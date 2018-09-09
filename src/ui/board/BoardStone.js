// @flow
import React, { PureComponent as Component } from 'react';
import type { PlayerColor } from '../../model';

export default class BoardStone extends Component<> {
  static defaultProps: {
    color: PlayerColor
  };

  render() {
    let { color } = this.props;
    return <div className={'Board-stone Board-stone-' + color} />;
  }
}
