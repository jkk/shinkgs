// @flow
import React, { PureComponent as Component } from "react";

type Props = {
  name: string
};

export class Icon extends Component<Props> {
  render() {
    let { name } = this.props;
    return <i className={"Icon fa fa-" + name} />;
  }
}
