// @flow

let _tempIdCounter = 0;

export function tempId() {
  // For compatibility with Java shorts used by KGS API
  if (_tempIdCounter > 32766) {
    _tempIdCounter = 0;
  }
  _tempIdCounter++;
  return -_tempIdCounter;
}

export function isTempId(id: number) {
  return id < 0;
}
