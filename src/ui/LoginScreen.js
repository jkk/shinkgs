// @flow
import React, { PureComponent as Component } from "react";
import { get, set } from "idb-keyval";
import { Button, CheckboxInput } from "./common";
import { isTouchDevice } from "../util/dom";
import type { KgsClientState, Preferences, AppActions } from "../model";
import packageJson from "../../package.json";

type SavedLogin = {
  username: string | null,
  savePassword: boolean | null,
  password: string | null,
};

type Props = {
  loginError: ?string,
  clientState: KgsClientState,
  preferences: Preferences,
  actions: AppActions,
};

type State = {
  logoLoaded: boolean,
  username: string,
  savePassword: boolean,
  password: string,
};

export default class LoginScreen extends Component<Props, State> {
  state = {
    logoLoaded: false,
    username: this.props.preferences.username || "",
    savePassword: false,
    password: "",
  };

  componentDidMount() {
    if (document.body) {
      document.body.classList.add("LoginScreen-body");
    }
    // We store password in component-local state to make it less likely
    // to show up in logs and such
    get("savedLogin").then((savedLogin: ?SavedLogin) => {
      if (savedLogin) {
        let nextState = {};
        if (savedLogin.savePassword !== null) {
          nextState.savePassword = savedLogin.savePassword;
        }
        if (savedLogin.password !== null) {
          nextState.password = savedLogin.password;
        }
        if (savedLogin.username) {
          nextState.username = savedLogin.username;
        }
        if (Object.keys(savedLogin).length) {
          this.setState(nextState);
        }
      }
    });
  }

  componentWillUnmount() {
    if (document.body) {
      document.body.classList.remove("LoginScreen-body");
    }
  }

  render() {
    let { loginError, clientState } = this.props;
    let { logoLoaded, username, savePassword, password } = this.state;
    let loggingIn = clientState.status === "loggingIn";
    let publicUrl = process.env.PUBLIC_URL || "";
    let error = loginError;
    if (!error && clientState.network !== "online") {
      error =
        "Server unavailable. Try again or check your internet connection.";
    }
    return (
      <div className="LoginScreen">
        <div className="LoginScreen-header">
          <div
            className={
              "LoginScreen-title" +
              (logoLoaded ? " LoginScreen-title-logo-loaded" : "")
            }>
            <div className="LoginScreen-title-icon">
              <img
                src={publicUrl + "/apple-touch-icon.png"}
                width={48}
                height={48}
                alt=""
                onLoad={this._onLogoLoad}
              />
            </div>
            <div className="LoginScreen-title-text">
              Shin KGS
              <div className="LoginScreen-title-text-beta">Beta</div>
              <div className="LoginScreen-title-text-version">
                v{packageJson.version}
              </div>
            </div>
          </div>
        </div>
        <div className="LoginScreen-main">
          {error ? <div className="LoginScreen-error">{error}</div> : null}
          <form
            className="LoginScreen-form"
            action="#"
            method="post"
            onSubmit={this._onLogin}>
            <div className="LoginScreen-form-fields">
              <input
                type="text"
                placeholder="Username"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus={!isTouchDevice()}
                value={username}
                onChange={this._onChangeUsername}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={this._onChangePassword}
              />
              <div className="LoginScreen-save-password">
                <CheckboxInput
                  label="Save password"
                  checked={savePassword}
                  onChange={this._onChangeSavePassword}
                />
              </div>
            </div>
            <div className="LoginScreen-form-button">
              <Button type="submit" loading={loggingIn} disabled={loggingIn}>
                Log In
              </Button>
            </div>
          </form>
          <div className="LoginScreen-help">
            <a
              href="https://www.gokgs.com/register"
              target="_blank"
              rel="noopener noreferrer">
              Sign up
            </a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <a
              href="https://www.gokgs.com/password.jsp"
              target="_blank"
              rel="noopener noreferrer">
              Forgot password
            </a>
          </div>
        </div>
        <div className="LoginScreen-kgs-clients">
          For a complete user experience download the KGS client desktop
          software from one of these links:
          <p />
          <div className="LoginScreen-download-link">
            <a href="https://files.gokgs.com/javaBin/cgoban.exe">
              <Button type="button" className="LoginScreen-download-link">
                Windows Client
              </Button>
            </a>
            <a href="https://files.gokgs.com/javaBin/cgoban.dmg">
              <Button type="button" className="LoginScreen-download-link">
                Mac Client
              </Button>
            </a>
            <a href="https://files.gokgs.com/javaBin/cgoban.jar">
              <Button type="button" className="LoginScreen-download-link">
                Java JAR file
              </Button>
            </a>
          </div>
        </div>
        <div className="LoginScreen-footer">
          <a
            href="https://twitter.com/jkkramer"
            target="_blank"
            rel="noopener noreferrer">
            By @jkkramer
          </a>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <a
            href="https://github.com/jkk/shinkgs"
            target="_blank"
            rel="noopener noreferrer">
            GitHub
          </a>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <a
            href="https://www.gokgs.com/"
            target="_blank"
            rel="noopener noreferrer">
            Official KGS
          </a>
        </div>
      </div>
    );
  }

  _onLogin = (event: Event) => {
    event.preventDefault();
    let { username, savePassword, password } = this.state;
    if (username && password) {
      this.props.actions.onLogin(username, password);
      let savedLogin: SavedLogin = {
        username,
        savePassword,
        password: savePassword ? password : null,
      };
      set("savedLogin", savedLogin);
    }
  };

  _onLogoLoad = () => {
    this.setState({ logoLoaded: true });
  };

  _onChangeUsername = (e: Object) => {
    this.setState({ username: e.target.value });
  };

  _onChangePassword = (e: Object) => {
    this.setState({ password: e.target.value });
  };

  _onChangeSavePassword = (e: Object) => {
    this.setState({ savePassword: e.target.checked });
  };
}
