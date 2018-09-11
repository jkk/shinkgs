// @flow
import React, { PureComponent as Component } from "react";
import { A, Icon } from "../common";
import { isAncestor } from "../../util/dom";
import { getGamePlayerOtherRole } from "../../model/game";
import type { GameChannel, GameRole, User } from "../../model";

type Props = {
  currentUser: User,
  game: GameChannel,
  isOurMove: boolean,
  scoring: boolean,
  onPass: GameChannel => any,
  onUndo: GameChannel => any,
  onResign: GameChannel => any,
  onLeaveGame: Function,
  onAddTime: (game: GameChannel, role: GameRole, seconds: number) => any,
  onDoneScoring: GameChannel => any,
};

type State = {
  moreShowing: boolean,
};

export default class GamePlayActions extends Component<Props, State> {
  state = {
    moreShowing: false,
  };

  _moreEl: any;

  _onDocumentClick = (e: Object) => {
    if (this.state.moreShowing && this._moreEl) {
      if (e.target !== this._moreEl && !isAncestor(e.target, this._moreEl)) {
        this.setState({ moreShowing: false });
      }
    }
  };

  componentDidMount() {
    document.addEventListener("click", this._onDocumentClick);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this._onDocumentClick);
  }

  render() {
    let { isOurMove, scoring } = this.props;
    let { moreShowing } = this.state;
    let passClassName =
      "GamePlayActions-item-button GamePlayActions-pass" +
      (isOurMove ? "" : " GamePlayActions-pass-disabled");
    return (
      <div className="GamePlayActions">
        {scoring ? (
          <div className="GamePlayActions-item">
            <A
              className="GamePlayActions-item-button GamePlayActions-done"
              onClick={this._onDone}>
              Done
            </A>
          </div>
        ) : (
          <div className="GamePlayActions-item">
            <A className={passClassName} onClick={this._onPass}>
              Pass
            </A>
          </div>
        )}
        <div className="GamePlayActions-item">
          <A
            className="GamePlayActions-item-button GamePlayActions-undo"
            onClick={this._onUndo}>
            Undo
          </A>
        </div>
        <div className="GamePlayActions-item">
          <A
            className="GamePlayActions-item-button GamePlayActions-resign"
            onClick={this._onResign}>
            Resign
          </A>
        </div>
        <div className="GamePlayActions-item">
          <div className="GamePlayActions-more-container" ref={this._setMoreEl}>
            <A
              className="GamePlayActions-item-button GamePlayActions-more"
              onClick={this._onToggleMore}>
              More <Icon name="angle-down" />
            </A>
            {moreShowing ? (
              <div className="GamePlayActions-more-menu">
                <A
                  className="GamePlayActions-more-item"
                  onClick={this._onAdd1Minute}>
                  Add 1 Minute
                </A>
                <A
                  className="GamePlayActions-more-item"
                  onClick={this._onAdd5Minutes}>
                  Add 5 Minutes
                </A>
                <div className="GamePlayActions-more-menu-separator" />
                <A
                  className="GamePlayActions-more-item GamePlayActions-leave"
                  onClick={this._onLeaveGame}>
                  Leave Game
                </A>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  _setMoreEl = (ref: HTMLElement) => {
    this._moreEl = ref;
  };

  _onPass = () => {
    if (this.props.isOurMove) {
      this.props.onPass(this.props.game);
    }
  };

  _onUndo = () => {
    this.props.onUndo(this.props.game);
  };

  _onResign = () => {
    this.props.onResign(this.props.game);
  };

  _onToggleMore = () => {
    this.setState({ moreShowing: !this.state.moreShowing });
  };

  _onAdd1Minute = () => {
    this._onToggleMore();
    let { currentUser, game, onAddTime } = this.props;
    let otherRole = getGamePlayerOtherRole(currentUser.name, game.players);
    if (otherRole) {
      onAddTime(game, otherRole, 60);
    }
  };

  _onAdd5Minutes = () => {
    this._onToggleMore();
    let { currentUser, game, onAddTime } = this.props;
    let otherRole = getGamePlayerOtherRole(currentUser.name, game.players);
    if (otherRole) {
      onAddTime(game, otherRole, 60 * 5);
    }
  };

  _onLeaveGame = () => {
    this._onToggleMore();
    this.props.onLeaveGame();
  };

  _onDone = () => {
    this.props.onDoneScoring(this.props.game);
  };
}
