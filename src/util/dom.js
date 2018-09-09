// @flow

export function isAncestor(target: HTMLElement, ancestor: HTMLElement) {
  let parent = target.parentNode;
  while (parent) {
    if (parent === ancestor) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}

export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    (navigator: Object).MaxTouchPoints > 0 ||
    (navigator: Object).msMaxTouchPoints > 0
  );
}

const MOBILE_WIDTH = 736;

export function isMobileScreen() {
  return window.innerWidth <= MOBILE_WIDTH;
}
