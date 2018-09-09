// @flow
import React, {PureComponent as Component} from 'react';
import {Button} from '../common';
import type {GameRole} from '../../model';

export default class GameUndoPrompt extends Component<{
  role: GameRole,
  onAccept: Function,
  onDecline: Function
}> {
  render() {
    let {onAccept, onDecline} = this.props;
    return (
      <div className='GameUndoPrompt'>
        <div className='GameUndoPrompt-label'>
          Undo requested.
        </div>
        <div className='GameUndoPrompt-buttons'>
          <Button small primary onClick={onAccept}>Allow</Button>
          {' '}
          <Button small secondary onClick={onDecline}>Deny</Button>
        </div>
      </div>
    );
  }
}