// @flow
import React, { PureComponent as Component } from "react";
import type { PlayerColor } from "../../model";

type Props = {
  color: PlayerColor,
};

export default class BoardStone extends Component<Props> {
  render() {
    let { color } = this.props;
    return <div className={"Board-stone Board-stone-" + color} />;
  }
}
