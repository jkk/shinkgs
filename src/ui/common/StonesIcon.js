// @flow
import React, { PureComponent as Component } from "react";

type Props = {};

export class StonesIcon extends Component<Props> {
  render() {
    return (
      <div className="StonesIcon">
        <div className="StonesIcon-black" />
        <div className="StonesIcon-white" />
      </div>
    );
  }
}
