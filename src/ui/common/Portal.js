// Implementation from React BootStrap:
// https://github.com/react-bootstrap/react-bootstrap/blob/master/src/Portal.js
// @flow

import * as React from 'react';
import ReactDOM from 'react-dom';

function getOwnerDocument(componentOrElement) {
  let elem = ReactDOM.findDOMNode(componentOrElement);
  return (elem && elem.ownerDocument) || document;
}

export class Portal extends React.PureComponent<> {
  static defaultProps: $FlowFixMeProps;

  _isMounted = false;
  _overlayTarget: any;
  _overlayInstance: any;

  componentDidMount() {
    this._isMounted = true;
    this._renderOverlay();
  }

  componentDidUpdate() {
    this._renderOverlay();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this._unrenderOverlay();
    this._unmountOverlayTarget();
  }

  _mountOverlayTarget() {
    if (!this._overlayTarget) {
      this._overlayTarget = document.createElement('div');
      let container = this.getContainerDOMNode();
      if (container) {
        container.appendChild(this._overlayTarget);
      }
    }
  }

  _unmountOverlayTarget() {
    if (this._overlayTarget) {
      let container = this.getContainerDOMNode();
      if (container) {
        container.removeChild(this._overlayTarget);
      }
      this._overlayTarget = null;
    }
  }

  _renderOverlay() {

    let overlay = !this.props.children
    ? null
    : React.Children.only(this.props.children);

    // Save reference for future access.
    if (overlay !== null) {
      this._mountOverlayTarget();
      this._overlayInstance = ReactDOM.render(overlay, this._overlayTarget);
    } else {
      // Unrender if the component is null for transitions to null
      this._unrenderOverlay();
      this._unmountOverlayTarget();
    }
  }

  _unrenderOverlay() {
    if (this._overlayTarget) {
      ReactDOM.unmountComponentAtNode(this._overlayTarget);
      this._overlayInstance = null;
    }
  }

  render() {
    return null;
  }

  getOverlayDOMNode() {
    if (!this._isMounted) {
      throw new Error('getOverlayDOMNode(): A component must be mounted to have a DOM node.');
    }

    if (this._overlayInstance) {
      if (this._overlayInstance.getWrappedDOMNode) {
        return this._overlayInstance.getWrappedDOMNode();
      } else {
        return ReactDOM.findDOMNode(this._overlayInstance);
      }
    }

    return null;
  }

  getContainerDOMNode() {
    return ReactDOM.findDOMNode(this.props.container) || getOwnerDocument(this).body;
  }
}
