// @flow
import React, { PureComponent as Component } from 'react';
import { A } from '../common';
import MoreMenu from './MoreMenu';
import UserName from '../user/UserName';
import { InvariantError } from '../../util/error';
import type { User, AppActions } from '../../model';

export default class MoreScreen extends Component<> {
  static defaultProps: {
    currentUser: ?User,
    actions: AppActions
  };

  componentDidMount() {
    if (document.body) {
      document.body.classList.add('MoreScreen-body');
    }
  }

  componentWillUnmount() {
    if (document.body) {
      document.body.classList.remove('MoreScreen-body');
    }
  }

  render() {
    let { currentUser, actions } = this.props;
    if (!currentUser) {
      throw new InvariantError('currentUser is required');
    }
    return (
      <div className='MoreScreen'>
        <div className='MoreScreen-account'>
          <A onClick={this._onShowProfile}>
            <UserName user={currentUser} />
          </A>
        </div>
        <MoreMenu currentUser={currentUser} actions={actions} />
      </div>
    );
  }

  _onShowProfile = () => {
    let { currentUser } = this.props;
    if (currentUser) {
      this.props.actions.onUserDetail(currentUser.name);
    }
  };
}
