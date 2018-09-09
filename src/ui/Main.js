// @flow
import React, { PureComponent as Component } from "react";
import Nav from "./meta/Nav";
import OfflineAlert from "./meta/OfflineAlert";
import UnderConstructionModal from "./meta/UnderConstructionModal";
import FeedbackModal from "./meta/FeedbackModal";
import WatchScreen from "./WatchScreen";
import PlayScreen from "./PlayScreen";
import SearchScreen from "./SearchScreen";
import ChatScreen from "./chat/ChatScreen";
import MoreScreen from "./meta/MoreScreen";
import UserDetailsModal from "./user/UserDetailsModal";
import type { AppState, AppActions } from "../model";

type Props = {
  appState: AppState,
  actions: AppActions
};

export default class Main extends Component<Props> {
  render() {
    let { appState, actions } = this.props;
    let {
      nav,
      currentUser,
      conversationsById,
      channelMembership,
      gamesById,
      playChallengeId,
      clientState,
      logoutError,
      userDetailsRequest,
      showUnderConstruction,
      showFeedbackModal
    } = appState;
    let screenProps = { ...appState, actions };

    let content;
    if (nav === "watch") {
      content = <WatchScreen {...screenProps} />;
    } else if (nav === "play") {
      content = <PlayScreen {...screenProps} />;
    } else if (nav === "chat") {
      content = <ChatScreen {...screenProps} />;
    } else if (nav === "search") {
      content = <SearchScreen {...screenProps} />;
    } else if (nav === "more") {
      content = <MoreScreen {...screenProps} />;
    }

    let activeChallenge = playChallengeId ? gamesById[playChallengeId] : null;
    let offline =
      clientState.status === "loggedOut" || clientState.network !== "online";
    return (
      <div className="Main">
        {offline ? (
          <OfflineAlert
            logoutError={logoutError}
            clientState={clientState}
            onLogout={actions.onLogout}
          />
        ) : null}
        <Nav
          nav={nav}
          currentUser={currentUser}
          conversationsById={conversationsById}
          channelMembership={channelMembership}
          activeChallenge={activeChallenge}
          actions={actions}
        />
        <div
          className={"Main-content Main-" + (offline ? "offline" : "online")}>
          {content}
        </div>
        {userDetailsRequest ? <UserDetailsModal {...screenProps} /> : null}
        {showUnderConstruction ? (
          <UnderConstructionModal onClose={actions.onHideUnderConstruction} />
        ) : null}
        {showFeedbackModal ? (
          <FeedbackModal
            currentUser={currentUser}
            onClose={actions.onHideFeedbackModal}
          />
        ) : null}
      </div>
    );
  }
}
