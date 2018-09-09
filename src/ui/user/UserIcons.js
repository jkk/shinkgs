// @flow
import React, { PureComponent as Component } from "react";
import type { User } from "../../model";

const EMPTY_FLAGS = {};

type Props = {
  user: User
};

export default class UserIcons extends Component<Props> {
  render() {
    let { user } = this.props;
    let flags = user.flags || EMPTY_FLAGS;
    let icons = [];
    if (user.authLevel === "jr_admin") {
      icons.push("⭐️");
    } else if (
      user.authLevel === "sr_admin" ||
      user.authLevel === "super_admin"
    ) {
      icons.push("🌟");
    } else if (user.authLevel === "teacher") {
      // icons.push('🎓');
    }
    if (flags.sleeping) {
      icons.push("💤");
    }
    if (flags.kgsPlus) {
      icons.push("🎩");
    }
    // if (user.flags.playing || user.flags.playingTourney) {
    //   icons.push('🎮');
    // }
    if (flags.tourneyWinner || flags.kgsMeijin) {
      icons.push("🏆");
    }
    if (flags.tourneyRunnerUp) {
      icons.push("🏅");
    }
    if (!icons.length) {
      return null;
    }
    return (
      <div className="UserIcons">
        {icons.map(icon => (
          <div key={icon} className="UserIcons-icon">
            {icon}
          </div>
        ))}
      </div>
    );
  }
}
