// @flow
import React, { PureComponent as Component } from "react";
import MoreMenu from "./MoreMenu";
import { A, Icon, StonesIcon, UnseenBadge } from "../common";
import ChatUnseenBadge from "../chat/ChatUnseenBadge";
import UserName from "../user/UserName";
import { isAncestor } from "../../util/dom";
import { InvariantError } from "../../util/error";
import { AppActions } from "../../model";
import type {
  User,
  NavOption,
  Conversation,
  ChannelMembership,
  GameChannel,
  Index,
} from "../../model";

type Props = {
  nav: NavOption,
  currentUser: ?User,
  conversationsById: Index<Conversation>,
  channelMembership: ChannelMembership,
  activeChallenge: ?GameChannel,
  actions: AppActions,
};

type State = {
  showingMoreMenu: boolean,
};

export default class Nav extends Component<Props, State> {
  state = {
    showingMoreMenu: false,
  };

  _moreEl: any;

  _onDocumentClick = (e: Object) => {
    if (this.state.showingMoreMenu && this._moreEl) {
      if (e.target !== this._moreEl && !isAncestor(e.target, this._moreEl)) {
        this.setState({ showingMoreMenu: false });
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
    let {
      nav,
      currentUser,
      conversationsById,
      channelMembership,
      activeChallenge,
      actions,
    } = this.props;
    let { showingMoreMenu } = this.state;
    if (!currentUser) {
      throw new InvariantError("currentUser is required");
    }
    let challengeConversation = activeChallenge
      ? conversationsById[activeChallenge.id]
      : null;
    return (
      <div className="MainNav">
        <div className="MainNav-inner">
          <div className="MainNav-tabs">
            <div
              className={
                "MainNav-item" +
                (nav === "watch" ? " MainNav-item-selected" : "")
              }>
              <A onClick={this._onNavWatch}>
                <div className="MainNav-item-icon">
                  <StonesIcon />
                </div>
                <div className="MainNav-item-label">Watch</div>
              </A>
            </div>
            <div
              className={
                "MainNav-item" +
                (nav === "play" ? " MainNav-item-selected" : "")
              }>
              <A onClick={this._onNavPlay}>
                <div className="MainNav-item-icon">
                  <Icon name="hand-pointer-o" />
                </div>
                <div className="MainNav-item-label">Play</div>
                {nav === "play" || !activeChallenge ? null : (
                  <div className="MainNav-item-badge">
                    <UnseenBadge
                      majorCount={
                        activeChallenge.receivedProposals
                          ? activeChallenge.receivedProposals.length
                          : 0
                      }
                      minorCount={
                        (challengeConversation &&
                          challengeConversation.unseenCount) ||
                        0
                      }
                    />
                  </div>
                )}
              </A>
            </div>
            <div
              className={
                "MainNav-item" +
                (nav === "chat" ? " MainNav-item-selected" : "")
              }>
              <A onClick={this._onNavChat}>
                <div className="MainNav-item-icon">
                  <Icon name="comment-o" />
                </div>
                <div className="MainNav-item-label">Chat</div>
                {nav === "chat" ? null : (
                  <div className="MainNav-item-badge">
                    <ChatUnseenBadge
                      conversationsById={conversationsById}
                      channelMembership={channelMembership}
                    />
                  </div>
                )}
              </A>
            </div>
            <div
              className={
                "MainNav-item" +
                (nav === "search" ? " MainNav-item-selected" : "")
              }>
              <A onClick={this._onNavSearch}>
                <div className="MainNav-item-icon">
                  <Icon name="search" />
                </div>
                <div className="MainNav-item-label">Search</div>
              </A>
            </div>
            <div
              className={
                "MainNav-item MainNav-item-more " +
                (nav === "more" ? " MainNav-item-selected" : "")
              }>
              <A onClick={this._onNavMore}>
                <div className="MainNav-item-icon">
                  <Icon name="bars" />
                </div>
                <div className="MainNav-item-label">More</div>
              </A>
            </div>
          </div>
          <div
            className={
              "MainNav-account" +
              (showingMoreMenu ? " MainNav-account-showing-menu" : "")
            }
            ref={this._setMoreEl}>
            <A
              className="MainNav-account-trigger"
              onClick={this._onToggleMoreMenu}>
              <UserName user={currentUser} />
              <div className="MainNav-account-trigger-icon">
                <Icon name="chevron-down" />
              </div>
            </A>
            {showingMoreMenu ? (
              <div className="MainNav-more-menu">
                <MoreMenu currentUser={currentUser} actions={actions} />
              </div>
            ) : null}
          </div>
          <div className="MainNav-feedback">
            <A
              button
              className="MainNav-feedback-button"
              onClick={actions.onShowFeedbackModal}>
              <div className="MainNav-feedback-icon">
                <Icon name="envelope-o" />
              </div>
              <div className="MainNav-feedback-label">Feedback</div>
            </A>
          </div>
          <div className="MainNav-contribute">
            <A
              className="MainNav-contribute-button"
              onClick={actions.onClickContribute}>
              <div className="MainNav-contribute-icon">
                <Icon name="github" />
              </div>
              <div className="MainNav-contribute-label">Contribute</div>
            </A>
          </div>
        </div>
      </div>
    );
  }

  _onNavWatch = () => this.props.actions.onChangeNav("watch");
  _onNavPlay = () => this.props.actions.onChangeNav("play");
  _onNavChat = () => this.props.actions.onChangeNav("chat");
  _onNavSearch = () => this.props.actions.onChangeNav("search");
  _onNavMore = () => this.props.actions.onChangeNav("more");

  _setMoreEl = (el: HTMLElement | null) => {
    this._moreEl = el;
  };

  _onToggleMoreMenu = () => {
    this.setState({ showingMoreMenu: !this.state.showingMoreMenu });
  };
}
