// @flow
import React, { PureComponent as Component } from "react";
import { Icon } from "../common";
import type { User } from "../../model";

type Props = {
  user: ?User,
};

export default class UserAvatar extends Component<Props> {
  render() {
    let { user } = this.props;
    return (
      <div className="UserAvatar">
        {user ? (
          user.flags && user.flags.avatar ? (
            <img
              src={`http://goserver.gokgs.com/avatars/${user.name}.jpg`}
              alt=""
            />
          ) : (
            <div className="UserAvatar-missing">
              <Icon name="user" />
            </div>
          )
        ) : null}
      </div>
    );
  }
}
