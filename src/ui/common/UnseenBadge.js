// @flow
import React, { PureComponent as Component } from "react";

type Props = {
  majorCount?: number,
  minorCount?: number
};

export class UnseenBadge extends Component<Props> {
  render() {
    let { majorCount, minorCount } = this.props;
    if (!majorCount && !minorCount) {
      return null;
    }
    return (
      <div
        className={
          "UnseenBadge UnseenBadge-" + (majorCount ? "major" : "minor")
        }>
        {majorCount || minorCount}
      </div>
    );
  }
}
