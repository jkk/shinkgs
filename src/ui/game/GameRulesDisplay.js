// @flow
import React, { PureComponent as Component } from "react";
import GameTimeSystem from "./GameTimeSystem";
import type { GameRules } from "../../model";

type Props = {
  rules: GameRules
};

export default class GameRulesDisplay extends Component<Props> {
  render() {
    let { rules } = this.props;
    return (
      <div className="GameRulesDisplay">
        {rules.timeSystem ? (
          <div className="GameRulesDisplay-time">
            <GameTimeSystem rules={rules} />
          </div>
        ) : null}
        {(rules.size && rules.size !== 19) || rules.handicap ? (
          <div className="GameRulesDisplay-size">
            {rules.size !== 19 ? `${rules.size}×${rules.size}` : ""}
            {rules.handicap ? " H" + rules.handicap : ""}
          </div>
        ) : null}
        {rules.komi ? (
          <div className="GameRulesDisplay-komi">Komi {rules.komi}</div>
        ) : null}
      </div>
    );
  }
}
