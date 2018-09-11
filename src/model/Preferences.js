// @flow
import type { User } from "./types";

type PrefsType = {
  enableSounds: boolean,
};

export default class Preferences {
  _prefMasterKey: string = "shinkgs";
  _prefKey: string;
  _currentUser: ?User;
  values: PrefsType;

  initUserPrefs(user: ?User) {
    this._currentUser = user;
    if (user) {
      this._prefKey = this._prefMasterKey + user.name;
    } else {
      // I guess this condition should never happen.
      this._prefKey = this._prefMasterKey + "default";
    }

    let storedPrefs = localStorage.getItem(this._prefKey);
    if (!storedPrefs) {
      // Create default preferences.
      this.values = {
        enableSounds: true,
      };
      this.savePrefs();

      console.info("Default preferences loaded.");
    } else {
      // Load preferences from local storage.
      this.values = JSON.parse(storedPrefs);

      console.info("Preferences loaded from local storage.");
    }
    console.info(this.values);
  }

  savePrefs() {
    if (this._prefKey && this.values) {
      localStorage.setItem(this._prefKey, JSON.stringify(this.values));
    }
  }
}
