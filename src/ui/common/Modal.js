// @flow
import React, { PureComponent as Component } from "react";
import { A } from "./A";
import { Portal } from "./Portal";
import { isAncestor } from "../../util/dom";

type Props = {
  children?: any,
  title?: any,
  onClose: Function,
};

export class Modal extends Component<Props> {
  _mainDiv: ?HTMLElement;

  componentDidMount() {
    document.addEventListener("keyup", this._onKeyUp);
    if (document.body) {
      document.body.classList.add("no-scroll");
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this._onKeyUp);
    if (document.body) {
      document.body.classList.remove("no-scroll");
    }
  }

  render() {
    let { children, title, onClose } = this.props;
    let className = "Modal Modal-" + (title ? "with-title" : "without-title");
    return (
      <Portal>
        <div className={className} onClick={this._onMaybeClose}>
          <div className="Modal-main" ref={this._setMainRef}>
            {title ? <div className="Modal-title">{title}</div> : null}
            <A className="Modal-close" onClick={onClose}>
              &times;
            </A>
            <div className="Modal-content">{children}</div>
          </div>
        </div>
      </Portal>
    );
  }

  _setMainRef = (ref: HTMLElement | null) => {
    this._mainDiv = ref;
  };

  _onKeyUp = (e: Object) => {
    if (e.key === "Escape" || e.keyCode === 27) {
      this.props.onClose();
    }
  };

  _onMaybeClose = (e: Object) => {
    if (this._mainDiv && isAncestor(e.target, this._mainDiv)) {
      return;
    }
    this.props.onClose();
  };
}
