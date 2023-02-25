// @flow
import React, { PureComponent as Component } from "react";
import UserIcons from "./UserIcons";
import type { User } from "../../model";

type Props = {
  user: ?User,
  prefixIcons?: boolean,
  extraIcons?: boolean,
};

const EMPTY_FLAGS = {};

export default class UserName extends Component<Props> {
  static defaultProps: Props;
  render() {
    let { user, prefixIcons, extraIcons } = this.props;
    let className = "UserName";
    if (prefixIcons) {
      className += " Username-with-prefix-icons";
    }
    if (!user) {
      return <div className="UserName">[unknown]</div>;
    }
    let flags = user.flags || EMPTY_FLAGS;
    let icons = (
      <div className="UserName-icons">
        {flags.robot ? (
          <span role="img" className="UserName-robot" title="robot">
            {" "}
            🤖
          </span>
        ) : null}
        {flags.selfish ? (
          <span
            role="img"
            className="UserName-selfish"
            title="selfish">
            <span
              role="img"
              className="UserName-selfish-icon"
              title="selfish">
              ~
            </span>
          </span>
        ) : null}
        {flags.guest ? (
          <span role="img" className="UserName-guest" title="guest">
            {" "}
            👤
          </span>
        ) : null}
        {extraIcons ? <UserIcons user={user} /> : null}
      </div>
    );
    return (
      <div className={className}>
        {prefixIcons ? icons : null}
        {user.name}
        {flags.guest ? "" : ` [${user.rank || "-"}]`}
        {prefixIcons ? null : icons}
      </div>
    );
  }
}
