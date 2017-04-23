// @flow
import React, {PureComponent as Component} from 'react';
import type {
  Conversation,
  Index
} from '../../model';

export default class ChatUnseenBadge extends Component {

  props: {
    conversationsById: Index<Conversation>
  };

  render() {
    let {conversationsById} = this.props;
    let majorCount = 0;
    let minorCount = 0;
    for (let id of Object.keys(conversationsById)) {
      let convo = conversationsById[id];
      if (convo.unseenCount) {
        if (convo.user) {
          majorCount += convo.unseenCount;
        } else {
          minorCount += convo.unseenCount;
        }
      }
    }
    if (!majorCount && !minorCount) {
      return null;
    }
    return (
      <div className={'ChatUnseenBadge ChatUnseenBadge-' + (majorCount ? 'major' : 'minor')}>
        {majorCount || minorCount}
      </div>
    );
  }
}
