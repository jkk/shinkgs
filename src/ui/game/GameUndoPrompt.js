// @flow
import React, {PureComponent as Component} from 'react';
import {Button} from '../common';
import type {GameRole} from '../../model';

export default class GameUndoPrompt extends Component {

  props: {
    role: GameRole,
    onAccept: Function,
    onDecline: Function
  };

  render() {
    let {onAccept, onDecline} = this.props;
    return (
      <div className='GameUndoPrompt'>
        <div className='GameUndoPrompt-label'>
          Undo requested. Allow?
        </div>
        <div className='GameUndoPrompt-buttons'>
          <Button small primary onClick={onAccept}>Yes</Button>
          {' '}
          <Button small muted onClick={onDecline}>No</Button>
        </div>
      </div>
    );
  }
}