// @flow
import type {KgsClientState, KgsMessage} from './types';
import {isJsError} from '../util/error';
import {escapeUnicode} from '../util/string';

const API_URL = process.env.REACT_APP_API_URL || '/json/access';

export class ApiError extends Error {
  type: string;
  xhr: XMLHttpRequest;
  constructor(message: string, type: string, xhr: XMLHttpRequest) {
    super(message);
    this.type = type;
    this.xhr = xhr;
  }
}

const initialClientState = {
  status: 'loggedOut',
  network: 'online',
  retryTimes: 0
};

type SendMessageOptions = {
  sync?: boolean
};

type StateChangeListener = (nextState: KgsClientState, prevState: KgsClientState) => any;

export class KgsClient {

  state: KgsClientState;

  _onChange: ?StateChangeListener = null;
  _onMessages: ?(messages: Array<KgsMessage>) => any;

  _debug: boolean = process.env.NODE_ENV === 'development';

  constructor(state?: KgsClientState = initialClientState) {
    this.state = state;
  }

  setState = (nextState: KgsClientState) => {
    let isSameState = (
      nextState.status === this.state.status &&
      nextState.network === this.state.network &&
      nextState.retryTimes === this.state.retryTimes
    );
    if (isSameState) {
      return;
    }
    let prevState = this.state;
    this.state = nextState;
    if (this._debug) {
      console.log('[KGS Client] State changed', {state: this.state, prevState});
    }
    if (this._onChange) {
      this._onChange(nextState, prevState);
    }
  }

  setOnChange = (listener: ?StateChangeListener) => {
    this._onChange = listener;
  }

  setOnMessages = (listener: ?(messages: Array<KgsMessage>) => any) => {
    this._onMessages = listener;
  }

  login = async (username: string, password: string, locale: string = 'en_US') => {
    this.setState({...this.state, status: 'loggingIn'});
    try {
      await this.sendMessage({
        type: 'LOGIN',
        name: username,
        password,
        locale
      });
      setTimeout(() => {
        if (this._debug) {
          console.log('[KGS Client] Starting polling');
        }
        this.poll();
      }, 0);
    } catch (err) {
      // Any login errors are available to callers via client state
      console.warn(err);
    }
  }

  logout = (opts?: SendMessageOptions = {}) => {
    // Sometimes network failure happens due to device sleeping or swiching
    // tasks. Attempt to go back online to avoid showing show the user a
    // network error on login screen. If we're truly offline, sendMessage
    // will put us back into that state.
    this.setState({
      ...this.state,
      network: 'online',
      status: 'loggingOut'
    });
    return this.sendMessage({type: 'LOGOUT'}, opts);
  }

  sendMessage = async (msg: KgsMessage, opts: SendMessageOptions = {}) => {
    if (this._debug) {
      console.log(
        '[KGS Client] >> ' + msg.type,
        msg.type === 'LOGIN' ? {...msg, password: '...'} : msg
      );
    }
    try {
      await this._sendMessage(msg, opts);
      this.setState({...this.state, network: 'online', retryTimes: 0});
    } catch (err) {
      if (isJsError(err)) {
        // Likely an error in the app, not with network or client
        throw err;
      }

      let nextState = {...this.state};
      if (err && err.type === 'noClient') {
        nextState.status = 'loggedOut';
        nextState.network = 'online';
        nextState.retryTimes = 0;
      } else {
        // TODO - detect bad request, don't change state
        nextState.network = 'error';
        if (this.state.status === 'loggingIn') {
          nextState.status = 'loggedOut';
        } else if (this.state.status === 'loggingOut') {
          // Log out failed - just pretend it worked
          nextState.status = 'loggedOut';
        }
      }
      this.setState(nextState);

      // Propogate anyway, so errors can be handled by appropriate UI
      throw err;
    }
  }

  poll = async () => {
    let messages;
    try {
      messages = await this._receiveMessages();
      if (this.state.retryTimes) {
        // Reconnected
        if (messages[messages.length - 1].type === 'LOGOUT') {
          // We reconnected only to be immediately logged out. Ensure an
          // appropriate error is shown to the user
          messages.push({type: 'SESSION_EXPIRED'});
        }
      }

      let nextState = {...this.state, network: 'online', retryTimes: 0};
      if (messages.find(msg => msg.type === 'LOGOUT')) {
        nextState.status = 'loggedOut';
      } else if (messages.find(msg => msg.type === 'LOGIN_SUCCESS')) {
        nextState.status = 'loggedIn';
      }
      this.setState(nextState);

      if (this._debug) {
        console.log('[KGS Client] << ', messages);
      }
      if (this._onMessages) {
        this._onMessages(messages);
      }

      if (nextState.status !== 'loggedOut') {
        setTimeout(() => {
          this.poll();
        }, 0);
      } else if (this._debug) {
        console.log('[KGS Client] Stopped polling');
      }
    } catch (err) {
      if (isJsError(err)) {
        // Likely an error in the app, not with network or client
        throw err;
      }

      let nextState = {...this.state};
      if (err && err.type === 'noClient') {
        nextState.status = 'loggedOut';
        nextState.network = 'online';
        nextState.retryTimes = 0;
      } else {
        let {retryTimes} = this.state;
        if (retryTimes < 10 && this.state.status !== 'loggedOut') {
          nextState.retryTimes = retryTimes + 1;
          nextState.network = 'error';
          if (this._debug) {
            console.log('[KGS Client] Poll failed - retry', nextState.retryTimes);
          }
          setTimeout(() => {
            this.poll();
          }, 3000);
        } else {
          nextState.network = 'error';
          nextState.retryTimes = 0;
          if (this.state.status === 'loggingIn') {
            nextState.status = 'loggedOut';
          } else if (this.state.status === 'loggingOut') {
            // Log out failed - just pretend it worked
            nextState.status = 'loggedOut';
          }
        }
      }
      this.setState(nextState);

      console.warn(err);
    }
  }

  _receiveMessages = (): Promise<Array<KgsMessage>> => {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let onError = () => {
        let errorType = xhr.status ? 'noClient' : 'networkError';
        let err = new ApiError('Receive failed', errorType, xhr);
        reject(err);
      };
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let resp = JSON.parse(xhr.responseText);
            resolve(resp.messages || []);
          } else {
            onError();
          }
        }
      };
      xhr.addEventListener('error', onError);
      xhr.addEventListener('abort', onError);
      xhr.addEventListener('timeout', onError);
      xhr.open('GET', API_URL, true);
      xhr.setRequestHeader('Accept', '*/*');
      xhr.withCredentials = true;
      xhr.send();
    });
  }

  _sendMessage = (msg: KgsMessage, opts: SendMessageOptions = {}) => {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let onError = () => {
        let errorType = xhr.status ? 'noClient' : 'networkError';
        let err = new ApiError('Send failed', errorType, xhr);
        reject(err);
      };
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve();
          } else {
            onError();
          }
        }
      };
      xhr.addEventListener('error', onError);
      xhr.addEventListener('abort', onError);
      xhr.addEventListener('timeout', onError);
      xhr.open('POST', API_URL, opts.sync === undefined ? true : opts.sync);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      xhr.send(escapeUnicode(JSON.stringify(msg)));
    });
  }

}
