// @flow
import React, {PureComponent as Component} from 'react';
import UserIcons from './UserIcons';
import type {User} from '../../model';

type Props = {
  user: ?User,
  prefixIcons?: boolean,
  extraIcons?: boolean
};

const EMPTY_FLAGS = {};

export default class UserName extends Component {

  props: Props;

  render() {
    let {user, prefixIcons, extraIcons} = this.props;
    let className = 'UserName';
    if (prefixIcons) {
      className += ' Username-with-prefix-icons';
    }
    if (!user) {
      return <div className='UserName'>[unknown]</div>;
    }
    let flags = user.flags || EMPTY_FLAGS;
    let icons = (
      <div className='UserName-icons'>
        {flags.robot ?
          <div className='UserName-robot'> 🤖<div className='UserIcons-icon-tooltip'>Robot</div></div> : null}
        {flags.selfish ?
          <div className='UserName-selfish'>
            <div className='UserName-selfish-icon'>~<div className='UserIcons-icon-tooltip'>Selfish</div></div>
          </div> :
          null}
        {flags.guest ?
          <div className='UserName-guest'>
            <div className='UserName-selfish-icon'> 👤<div className='UserIcons-icon-tooltip'>Guest</div></div>
          </div> :
          null}
        {extraIcons ? <UserIcons user={user} /> : null}
      </div>
    );
    return (
      <div className={className}>
        {prefixIcons ? icons : null}
        {user.name}{flags.guest ? '' : ` [${user.rank || '-'}]`}
        {prefixIcons ? null : icons}
      </div>
    );
  }

}
