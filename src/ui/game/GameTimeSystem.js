// @flow
import React, { PureComponent as Component } from 'react';
import { Icon } from '../common';
import { formatGameTimeSystem, getGameTimeSpeed } from '../../model/game';
import type { GameRules } from '../../model';

export default class GameTimeSystem extends Component<> {
  static defaultProps: {
    rules: GameRules
  };

  render() {
    let { rules } = this.props;
    let speed = getGameTimeSpeed(rules);
    let icon;
    if (speed === 'very fast') {
      icon = (
        <div>
          <Icon name='bolt' />
          <Icon name='bolt' />
        </div>
      );
    } else if (speed === 'fast') {
      icon = <Icon name='bolt' />;
    } else if (speed === 'slow') {
      icon = <Icon name='hourglass-o' />;
    }
    return (
      <div className='GameTimeSystem'>
        {icon ? <div className='GameTimeSystem-icon'>{icon}</div> : null}
        {formatGameTimeSystem(rules)}
      </div>
    );
  }
}
