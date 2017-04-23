// @flow
import React, {PureComponent as Component} from 'react';
import {Icon} from './Icon';

export class Button extends Component {

  props: {
    type?: 'button' | 'submit',
    onClick?: (e: Event) => any,
    href?: string,
    target?: string,
    secondary?: boolean,
    danger?: boolean,
    muted?: boolean,
    small?: boolean,
    icon?: string,
    disabled?: boolean,
    loading?: boolean,
    children?: any,
    className?: string
  }

  render() {
    let {
      type,
      onClick,
      href,
      target,
      secondary,
      danger,
      muted,
      small,
      icon,
      disabled,
      loading,
      children
    } = this.props;
    let className = 'Button';
    if (secondary) {
      className += ' Button-secondary';
    }
    if (small) {
      className += ' Button-small';
    }
    if (danger) {
      className += ' Button-danger';
    }
    if (muted) {
      className += ' Button-muted';
    }
    if (loading) {
      className += ' Button-loading';
    }
    if (!children) {
      className += ' Button-no-label';
    }
    let iconEl = icon || loading ? (
      <div className='Button-icon'>
        <Icon name={loading ? 'spinner' : icon} />
      </div>
    ) : null;
    if (href) {
      return (
        <a
          className={className}
          href={href}
          target={target}>
          {iconEl} {children}
        </a>
      );
    } else {
      return (
        <button
          type={type || 'button'}
          className={className}
          disabled={disabled}
          onClick={onClick}>
          {iconEl} {children}
        </button>
      );
    }
  }
}
