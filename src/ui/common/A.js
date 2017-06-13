// @flow
import React, {PureComponent as Component} from 'react';

export class A extends Component {

  props: {
    href?: string,
    button?: boolean,
    disabled?: boolean,
    onClick?: (e: Event) => void | Promise<any>,
    className?: string,
    children?: any
  };

  render() {
    let {href, button, disabled, className, children} = this.props;
    return href || !button ? (
      <a
        className={className}
        href={href || '#'}
        onClick={this._onClick}>
        {children}
      </a>
    ) : (
      <button
        className={className}
        disabled={disabled}
        onClick={this._onClick}>
        {children}
      </button>
    );
  }

  _onClick = (e: Event) => {
    let {href, onClick} = this.props;
    if (href && (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey)) {
      // Opening in new tab/window or some other special user action
      return;
    }
    e.preventDefault();
    if (onClick) {
      onClick(e);
    }
  }
}
