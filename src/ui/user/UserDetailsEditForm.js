// @flow
import React, { PureComponent as Component } from 'react';
import { Button, CheckboxInput } from '../common';
import type { User, UserDetails } from '../../model';

export default class UserDetailsEditForm extends Component<> {
  static defaultProps: {
    user: User,
    details: UserDetails,
    onSave: (user: User, details: UserDetails, newPassword: string) => any,
    onCancel: Function
  };

  state: {
    details: UserDetails,
    newPassword: string
  } = {
    details: {
      ...this.props.details,
      rankWanted:
        this.props.user.rank === undefined || this.props.user.rank === null
          ? false
          : true
    },
    newPassword: ''
  };

  render() {
    let { onCancel } = this.props;
    let { details, newPassword } = this.state;
    return (
      <div className='UserDetailsEditForm'>
        <div className='UserDetailsEditForm-fields'>
          <input
            type='text'
            name='personalName'
            autoCapitalize='words'
            placeholder='Your Name'
            value={details.personalName}
            onChange={this._onChangeInput}
          />
          <input
            type='email'
            name='email'
            placeholder='Your Email'
            value={details.email}
            onChange={this._onChangeInput}
          />
          <input
            type='password'
            name='newPassword'
            placeholder='New Password (leave blank to keep existing)'
            value={newPassword}
            onChange={this._onChangeInput}
          />
          <textarea
            name='personalInfo'
            placeholder='Bio'
            value={details.personalInfo}
            rows={5}
            onChange={this._onChangeInput}
          />
          <div className='UserDetailsEditForm-checkbox'>
            <CheckboxInput
              name='emailWanted'
              label='Receive KGS announcement emails'
              value='true'
              checked={details.emailWanted === true}
              onChange={this._onChangeInput}
            />
          </div>
          <div className='UserDetailsEditForm-checkbox'>
            <CheckboxInput
              name='privateEmail'
              label='Hide email adddress from other users'
              value='true'
              checked={details.privateEmail === true}
              onChange={this._onChangeInput}
            />
          </div>
          <div className='UserDetailsEditForm-checkbox'>
            <CheckboxInput
              name='rankWanted'
              label='Rank enabled'
              value='true'
              checked={details.rankWanted === true}
              onChange={this._onChangeInput}
            />
          </div>
        </div>
        <div className='UserDetailsEditForm-buttons'>
          <Button primary onClick={this._onSave}>
            Save Changes
          </Button>{' '}
          <Button secondary onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  _onChangeInput = (e: Object) => {
    let target = e.target;
    if (target.name === 'newPassword') {
      this.setState({ newPassword: target.value });
    } else {
      if (target.type === 'text' || target.nodeName === 'TEXTAREA') {
        this.setState({
          details: {
            ...this.state.details,
            [target.name]: target.value
          }
        });
      } else if (target.type === 'checkbox') {
        this.setState({
          details: {
            ...this.state.details,
            [target.name]: target.checked
          }
        });
      }
    }
  };

  _onSave = () => {
    this.props.onSave(
      this.props.user,
      this.state.details,
      this.state.newPassword
    );
  };
}
