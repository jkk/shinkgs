// @flow
import React, {PureComponent as Component} from 'react';
import {Button} from '../common';
import type {KgsClientState} from '../../model/types';

export default class OfflineAlert extends Component<{
  logoutError: ?string,
  clientState: KgsClientState,
  onLogout: Function
}> {
  render() {
    let {
      logoutError,
      clientState,
      onLogout
    } = this.props;
    let text = 'Disconnected';
    if (logoutError) {
      text += ` - ${logoutError.replace(/\.$/, '')}`;
    }
    if (clientState.retryTimes) {
      text += '. Trying to reconnect...';
    }
    if (!logoutError && !clientState.retryTimes) {
      text += '. Please log in again.';
    }
    return (
      <div className='OfflineAlert'>
        <div className='OfflineAlert-text'>
          {text}
        </div>
        <div className='OfflineAlert-logout'>
          <Button small onClick={onLogout}>Exit</Button>
        </div>
      </div>
    );
  }
}
