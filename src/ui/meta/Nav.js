// @flow
import React, {PureComponent as Component} from 'react';
import MoreMenu from './MoreMenu';
import {A, Icon, StonesIcon} from '../common';
import ChatUnseenBadge from '../chat/ChatUnseenBadge';
import UserName from '../user/UserName';
import {isAncestor} from '../../util/dom';
import {InvariantError} from '../../util/error';
import type {
  User,
  NavOption,
  Conversation,
  Index
} from '../../model';

export default class Nav extends Component {

  props: {
    nav: NavOption,
    currentUser: ?User,
    conversationsById: Index<Conversation>,
    onChangeNav: NavOption => any,
    onUserDetail: string => any,
    onLogout: Function
  };

  state: {
    showingMoreMenu: boolean
  } = {
    showingMoreMenu: false
  };

  _moreEl: any;

  _onDocumentClick = (e: Object) => {
    if (this.state.showingMoreMenu && this._moreEl) {
      if (e.target !== this._moreEl && !isAncestor(e.target, this._moreEl)) {
        this.setState({showingMoreMenu: false});
      }
    }
  }

  componentDidMount() {
    document.addEventListener('click', this._onDocumentClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this._onDocumentClick);
  }

  render() {
    let {
      nav,
      currentUser,
      conversationsById,
      onLogout,
      onUserDetail
    } = this.props;
    let {showingMoreMenu} = this.state;
    if (!currentUser) {
      throw new InvariantError('currentUser is required');
    }
    return (
      <div className='MainNav'>
        <div className='MainNav-inner'>
          <div className='MainNav-tabs'>
            <div className={'MainNav-item' + (nav === 'watch' ? ' MainNav-item-selected' : '')}>
              <A onClick={this._onNavWatch}>
                <div className='MainNav-item-icon'>
                  <StonesIcon />
                </div>
                <div className='MainNav-item-label'>
                  Watch
                </div>
              </A>
            </div>
            <div className={'MainNav-item' + (nav === 'play' ? ' MainNav-item-selected' : '')}>
              <A onClick={this._onNavPlay}>
                <div className='MainNav-item-icon'>
                  <Icon name='hand-pointer-o' />
                </div>
                <div className='MainNav-item-label'>
                  Play
                </div>
              </A>
            </div>
            <div className={'MainNav-item' + (nav === 'chat' ? ' MainNav-item-selected' : '')}>
              <A onClick={this._onNavChat}>
                <div className='MainNav-item-icon'>
                  <Icon name='comment-o' />
                </div>
                <div className='MainNav-item-label'>
                  Chat
                </div>
                {nav === 'chat' ? null :
                  <div className='MainNav-item-badge'>
                    <ChatUnseenBadge
                      conversationsById={conversationsById} />
                  </div>}
              </A>
            </div>
            <div className={'MainNav-item' + (nav === 'search' ? ' MainNav-item-selected' : '')}>
              <A onClick={this._onNavSearch}>
                <div className='MainNav-item-icon'>
                  <Icon name='search' />
                </div>
                <div className='MainNav-item-label'>
                  Search
                </div>
              </A>
            </div>
            <div className={'MainNav-item MainNav-item-more ' + (nav === 'more' ? ' MainNav-item-selected' : '')}>
              <A onClick={this._onNavMore}>
                <div className='MainNav-item-icon'>
                  <Icon name='bars' />
                </div>
                <div className='MainNav-item-label'>
                  More
                </div>
              </A>
            </div>
          </div>
          <div className={'MainNav-account' + (showingMoreMenu ? ' MainNav-account-showing-menu' : '')} ref={this._setMoreEl}>
            <A className='MainNav-account-trigger' onClick={this._onToggleMoreMenu}>
              <UserName user={currentUser} />
              <div className='MainNav-account-trigger-icon'>
                <Icon name='chevron-down' />
              </div>

            </A>
            {showingMoreMenu ?
              <div className='MainNav-more-menu'>
                <MoreMenu
                  currentUser={currentUser}
                  onLogout={onLogout}
                  onUserDetail={onUserDetail} />
              </div> : null}
          </div>
        </div>
      </div>
    );
  }

  _onNavWatch = () => this.props.onChangeNav('watch');
  _onNavPlay = () => this.props.onChangeNav('play');
  _onNavChat = () => this.props.onChangeNav('chat');
  _onNavSearch = () => this.props.onChangeNav('search');
  _onNavMore = () => this.props.onChangeNav('more');

  _setMoreEl = (el: HTMLElement) => {
    this._moreEl = el;
  }

  _onToggleMoreMenu = () => {
    this.setState({showingMoreMenu: !this.state.showingMoreMenu});
  }
}
