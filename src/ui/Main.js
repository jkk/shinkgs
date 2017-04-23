// @flow
import React, {PureComponent as Component} from 'react';
import Nav from './meta/Nav';
import OfflineAlert from './meta/OfflineAlert';
import NotImplementedModal from './meta/NotImplementedModal';
import UnderConstructionModal from './meta/UnderConstructionModal';
import WatchScreen from './WatchScreen';
import PlayScreen from './PlayScreen';
import SearchScreen from './SearchScreen';
import ChatScreen from './chat/ChatScreen';
import MoreScreen from './meta/MoreScreen';
import UserDetailsModal from './user/UserDetailsModal';
import type {
  AppState,
  AppActions
} from '../model';

export default class Main extends Component {

  props: {
    appState: AppState,
    actions: AppActions
  };

  render() {
    let {
      appState,
      actions
    } = this.props;
    let {
      nav,
      clientState,
      userDetailsRequest,
      showNotImplemented,
      showUnderConstruction
    } = appState;
    let screenProps = {...appState, actions};

    let content;
    if (nav === 'watch') {
      content = (
        <WatchScreen {...screenProps} />
      );
    } else if (nav === 'play') {
      content = (
        <PlayScreen {...screenProps} />
      );
    } else if (nav === 'chat') {
      content = (
        <ChatScreen {...screenProps} />
      );
    } else if (nav === 'search') {
      content = (
        <SearchScreen {...screenProps} />
      );
    } else if (nav === 'more') {
      content = (
        <MoreScreen {...screenProps} />
      );
    }

    let offline = clientState.status === 'loggedOut' || clientState.network !== 'online';

    return (
      <div className='Main'>
        {offline ?
          <OfflineAlert
            {...appState}
            onLogout={actions.onLogout} /> :
          null}
        <Nav
          {...appState}
          onChangeNav={actions.onChangeNav}
          onUserDetail={actions.onUserDetail}
          onLogout={actions.onLogout} />
        <div className={'Main-content Main-' + (offline ? 'offline' : 'online')}>
          {content}
        </div>
        {userDetailsRequest ?
          <UserDetailsModal {...screenProps} /> :
          null}
        {showNotImplemented ?
          <NotImplementedModal
            onClose={actions.onHideNotImplemented} /> :
          null}
        {showUnderConstruction ?
          <UnderConstructionModal
            onClose={actions.onHideUnderConstruction} /> :
          null}
      </div>
    );
  }

}
