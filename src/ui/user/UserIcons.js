// @flow
import React, {PureComponent as Component} from 'react';
import type {User} from '../../model';

export default class UserIcons extends Component {

  props: {
    user: User
  };

  render() {
    const {user} = this.props;
    const flags = user.flags || {};
    let icons = [];
    switch(user.authLevel) {
    case 'jr_admin':
      icons.push({icon: '⭐️', name: 'Admin'});
      break;
    case 'sr_admin':
      icons.push({icon: '🌟', name: 'Senior Admin'});
      break;
    case 'super_admin':
      icons.push({icon: '🌠', name: 'Super Admin'});
      break;
    case 'teacher':
      icons.push({icon: '🎓', name: 'Teacher'});
      break;
    }

    if (flags.sleeping) {
      icons.push({icon:'💤', name: 'Sleeping'});
    }
    if (flags.kgsPlus) {
      icons.push({icon:'🎩', name: 'KGS Plus'});
    }

    if (flags.playingTourney) {
      icons.push({icon:'🕹️', name: 'Playing Tournament'});
    } else if (flags.playing) {
      icons.push({icon:'🎮', name: 'Playing'});
    }

    if (flags.kgsMeijin) {
      icons.push({icon:'🏆', name: 'KGS Meijin'});
    } else if (flags.tourneyWinner) {
      icons.push({icon:'🥇', name: 'Tournament Winner'});
    } else if (flags.tourneyRunnerUp) {
      icons.push({icon: '🥈', name: 'Tournament Runner-up'});
    }

    if (!icons.length) {
      return null;
    }
    return (
      <div className='UserIcons'>
        {icons.map(({icon, name}) =>
          <div key={icon} className='UserIcons-icon'>
            {icon}
            <div className='UserIcons-icon-tooltip'>{name}</div>
          </div>
        )}
      </div>
    );
  }

}
