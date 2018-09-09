// @flow
import React, { PureComponent as Component } from "react";
import { Icon } from "./Icon";

type Props = {};

export class Spinner extends Component<Props> {
  render() {
    return (
      <div className="Spinner">
        <div className="Spinner-icon">
          <Icon name="spinner" />
        </div>
      </div>
    );
  }
}
