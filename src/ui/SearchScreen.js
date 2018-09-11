// @flow
import React, { PureComponent as Component } from "react";
import { Button } from "./common";
import UserList from "./user/UserList";
import { sortUsers } from "../model/user";
import { quoteRegExpPattern } from "../util/string";
import { distinctBy } from "../util/collection";
import { isTouchDevice } from "../util/dom";
import type { User, Index, AppActions } from "../model";

type Props = {
  usersByName: Index<User>,
  actions: AppActions,
};

type State = {
  query: string,
};

export default class SearchScreen extends Component<Props, State> {
  state: {
    query: string,
  } = {
    query: "",
  };

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    let { usersByName } = this.props;
    let { query } = this.state;
    let queryRe = new RegExp(quoteRegExpPattern(query), "i");
    let users = Object.keys(usersByName)
      .filter(name => queryRe.test(name))
      .map(name => usersByName[name]);
    users = distinctBy(users, u => u.name);
    sortUsers(users);
    return (
      <div className="SearchScreen">
        <form
          method="post"
          action="#"
          className="SearchScreen-search-form"
          onSubmit={this._onLookup}>
          <div className="SearchScreen-query">
            <input
              type="text"
              placeholder="Username"
              autoFocus={!isTouchDevice()}
              autoCorrect="off"
              autoCapitalize="none"
              value={query}
              onChange={this._onChangeQuery}
            />
          </div>
          <div className="SearchScreen-button">
            <Button type="submit">View Profile</Button>
          </div>
        </form>
        {users.length ? (
          <div className="SearchScreen-users">
            <UserList users={users} onSelectUser={this._onSelectUser} />
          </div>
        ) : null}
      </div>
    );
  }

  _onChangeQuery = (e: Object) => {
    this.setState({ query: e.target.value });
  };

  _onLookup = (e: Event) => {
    e.preventDefault();
    let { query } = this.state;
    if (!query.trim()) {
      return;
    }
    this.props.actions.onUserDetail(query.toLowerCase());
  };

  _onSelectUser = (user: User) => {
    this.props.actions.onUserDetail(user.name);
  };
}
