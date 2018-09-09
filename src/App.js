// @flow
import React, {Component} from 'react';
import createHistory from 'history/createBrowserHistory';
import LoginScreen from './ui/LoginScreen';
import {
  getInitialState,
  handleMessage,
  isValidNav,
  AppStore,
  KgsClient,
  AppActions
} from './model';
import type { KgsClientState, NavOption} from './model';

class App extends Component<> {
  static defaultProps: any;
  _store: AppStore;
  _client: KgsClient;
  _actions: AppActions;

  _history: Object;
  _unlistenHistory: ?Function;

  _mainComponent: any;

  constructor(props: any, context: any) {
    super(props, context);

    this._history = createHistory();

    this._client = new KgsClient();
    this._store = new AppStore(handleMessage, getInitialState(this._client.state));
    this._actions = new AppActions(this._store, this._client, this._history);

    this.state = {appState: this._store.getState()};

    if (process.env.NODE_ENV === 'development') {
      window.App = this;
      window.store = this._store;
      window.kgs = this._client;
      window.actions = this._actions;
    }
  }

  _onUnload = () => {
    this._actions.onSaveAppState();
  }

  _onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this._actions.onSaveAppState();
    }
  }

  _onStoreChange = () => {
    let nextState = this._store.getState();
    if (!this.state.appState.initialized && nextState.initialized) {
      // Just loaded - sync URL with state if necessary
      this._syncNav();
    }
    this.setState({appState: nextState});
  }

  _onClientChange = (clientState: KgsClientState) => {
    this._store.dispatch({type: 'CLIENT_STATE_CHANGE', clientState});
  }

  _onHistoryChange = (loc: Object, action: string) => {
    let path: NavOption = loc.pathname.substring(1);
    if (action === 'POP') {
      this._actions.onChangeNav(path, {push: false});
    }
  }

  componentDidMount() {
    this._store.subscribe(this._onStoreChange);
    this._client.setOnChange(this._onClientChange);
    this._client.setOnMessages(this._actions.onReceiveServerMessages);
    this._actions.onRestoreAppState();
    this._unlistenHistory = this._history.listen(this._onHistoryChange);
    window.addEventListener('beforeunload', this._onUnload);
    document.addEventListener('visibilitychange', this._onVisibilityChange);

    this._loadMainComponent();
  }

  componentWillUnmount() {
    this._store.unsubscribe();
    this._client.setOnChange(null);
    this._client.setOnMessages(null);
    if (this._unlistenHistory) {
      this._unlistenHistory();
    }
    window.removeEventListener('beforeunload', this._onUnload);
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
  }

  _syncNav = () => {
    let state = this._store.getState();
    if (!state.currentUser) {
      this._history.replace('/');
    } else {
      let path = this._history.location.pathname.slice(1);
      if (!isValidNav(path)) {
        this._history.replace('/' + state.nav);
      } else if (path !== state.nav) {
        this._actions.onChangeNav(path, {push: false});
      }
    }
  }

  _loadMainComponent = () => {
    import('./App').then(() => {
      this._mainComponent = require('./ui/Main').default;
      this.forceUpdate();
    });
  }

  render() {
    let {appState} = this.state;

    if (!appState.initialized) {
      return <div />;
    }

    if (!appState.currentUser) {
      return (
        <LoginScreen
          {...appState}
          actions={this._actions} />
      );
    }

    let Main = this._mainComponent;
    return Main ? (
      <Main
        appState={appState}
        actions={this._actions} />
    ) : <div />;
  }
}

export default App;
