// @flow
import React, {PureComponent as Component} from 'react';

export class UnseenBadge extends Component<> {
  static defaultProps: {
    majorCount?: number,
    minorCount?: number
  };

  render() {
    let {majorCount, minorCount} = this.props;
    if (!majorCount && !minorCount) {
      return null;
    }
    return (
      <div className={'UnseenBadge UnseenBadge-' + (majorCount ? 'major' : 'minor')}>
        {majorCount || minorCount}
      </div>
    );
  }
}
