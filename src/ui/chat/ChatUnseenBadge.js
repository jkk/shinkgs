// @flow
import React, {PureComponent as Component} from 'react';
import {UnseenBadge} from '../common';
import type {
  Conversation,
  ChannelMembership,
  Index
} from '../../model';

export default class ChatUnseenBadge extends Component {

  props: {
    conversationsById: Index<Conversation>,
    channelMembership?: ChannelMembership
  };

  render() {
    let {conversationsById, channelMembership} = this.props;
    let majorCount = 0;
    let minorCount = 0;
    for (let id of Object.keys(conversationsById)) {
      let convo = conversationsById[id];
      if (channelMembership) {
        let chan = channelMembership[id];
        if (!chan || (chan.type !== 'room' && chan.type !== 'conversation')) {
          continue;
        }
      }
      if (convo.unseenCount) {
        if (convo.user) {
          majorCount += convo.unseenCount;
        } else {
          minorCount += convo.unseenCount;
        }
      }
    }
    return (
      <div className='ChatUnseenBadge'>
        <UnseenBadge majorCount={majorCount} minorCount={minorCount} />
      </div>
    );
  }
}
