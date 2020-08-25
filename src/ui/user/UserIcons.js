// @flow
import React, { PureComponent as Component } from "react";
import type { User } from "../../model";

const EMPTY_FLAGS = {};

type Props = {
  user: User,
};

type Icon = {
  title: string,
  value: string,
};

const getIcons = (user: User): Icon[] => {
  const flags = user.flags || EMPTY_FLAGS;
  const icons: Icon[] = [];

  if (user.authLevel === "jr_admin") {
    icons.push({
      title: "Admin",
      value: "⭐",
    });
  } else if (
    user.authLevel === "sr_admin" ||
    user.authLevel === "super_admin"
  ) {
    icons.push({
      title: "Admin",
      value: "🌟",
    });
  } else if (user.authLevel === "teacher") {
    // icons.push({
    //   title: "Teacher",
    //   value: "🎓"
    // });
  }
  if (flags.sleeping) {
    icons.push({
      title: "Sleeping",
      value: "💤",
    });
  }
  if (flags.kgsPlus) {
    icons.push({
      title: "KGS+",
      value: "🎩",
    });
  }

  // if (user.flags.playing || user.flags.playingTourney) {
  //   icons.push({
  //     title: "Playing",
  //     value: "🎮",
  //   });
  // }

  if (flags.tourneyWinner || flags.kgsMeijin) {
    icons.push({
      title: flags.kgsMeijin ? "KGS Meijin" : "Tournament Winner",
      value: "🏆",
    });
  }
  if (flags.tourneyRunnerUp) {
    icons.push({
      title: "Tournament Runner Up",
      value: "🏅",
    });
  }

  return icons;
};

export default class UserIcons extends Component<Props> {
  render() {
    let { user } = this.props;
    let icons = getIcons(user);

    return (
      <div className="UserIcons">
        {icons.map((icon) => (
          <div key={icon.value} className="UserIcons-icon" title={icon.title}>
            {icon.value}
          </div>
        ))}
      </div>
    );
  }
}
