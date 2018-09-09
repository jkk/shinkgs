// @flow
import React, { PureComponent as Component } from "react";
import UserName from "./UserName";
import { A } from "../common";
import type { User } from "../../model";

type Props = {
  user: User,
  onSelect: User => any
};

class UserListItem extends Component<Props> {
  render() {
    let { user } = this.props;
    let flags = user.flags || {};
    let className =
      "UserList-item" + (!flags.connected ? " UserList-item-offline" : "");
    return (
      <div className={className}>
        <A onClick={this._onSelect}>
          <div className="UserList-item-name">
            <UserName user={user} extraIcons />
          </div>
        </A>
      </div>
    );
  }

  _onSelect = () => {
    this.props.onSelect(this.props.user);
  };
}

type UserListProps = {
  users: Array<User>,
  onSelectUser: User => any
};

type State = {
  fullRender: boolean
};

export default class UserList extends Component<UserListProps, State> {
  state = {
    fullRender: false
  };

  componentDidMount() {
    let { users } = this.props;
    if (users.length > 40) {
      setTimeout(() => {
        this.setState({ fullRender: true });
      }, 32);
    }
  }

  render() {
    let { users: allUsers, onSelectUser } = this.props;
    let { fullRender } = this.state;
    let users = fullRender ? allUsers : allUsers.slice(0, 40);
    return (
      <div className="UserList">
        {users.map(user => (
          <UserListItem key={user.name} user={user} onSelect={onSelectUser} />
        ))}
      </div>
    );
  }
}
