// @flow
import React, {PureComponent as Component} from 'react';
import {A, Icon} from '../common';
import {getKgsSgfUrl} from '../../model/game';
import {isAncestor} from '../../util/dom';
import type {GameChannel, AppActions, Index, Room} from '../../model';
import GameInfo from './GameInfo';
import {Modal} from '../common';

export default class GameMoreMenu extends Component {

  props: {
    game: GameChannel,
    actions: AppActions,
    roomsById: Index<Room>,
  };

  state = {
    moreShowing: (false: boolean),
    gameInfoShowing: (false: boolean),
  };

  _moreEl: ?HTMLElement;

  _onDocumentClick = (e: Object) => {
    if (this.state.moreShowing && this._moreEl) {
      if (e.target !== this._moreEl && !isAncestor(e.target, this._moreEl)) {
        this.setState({moreShowing: false});
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
    let {game, roomsById} = this.props;
    let {moreShowing, gameInfoShowing} = this.state;
    let sgfUrl = game.summary ? getKgsSgfUrl(game.summary) : '#';
    let eidogoUrl = 'http://eidogo.com/#url:' + sgfUrl;
    let gokibitzUrl = 'https://gokibitz.com/fetch#' + sgfUrl;

    let gameInfo = (
      <GameInfo game={game} roomsById={roomsById}>
        {game.rules ?
          <tr>
            <th>Size</th>
            <td>{`${game.rules.size} x ${game.rules.size}`}</td>
          </tr>
        : null}
        <tr>
          <th>ID</th>
          <td>{game.id}</td>
        </tr>
        <tr>
          <th>Time</th>
          <td>{new Date(game.time).toString()}</td>
        </tr>
        {game.over ?
          <tr>
            <th>Result</th>
            <td>{game.score}</td>
          </tr>
        : null}
      </GameInfo>
    );

    return (
      <div className='GameMoreMenu' ref={this._setMoreEl}>
        <A className='GameMoreMenu-trigger' onClick={this._onToggleDropdown}>
          <div className='GameMoreMenu-trigger-label'>
            More
          </div>
          <div className='GameMoreMenu-trigger-icon'>
            <Icon name='chevron-down' />
          </div>
        </A>
        {moreShowing ?
          <div className='GameMoreMenu-dropdown'>
            <a className='GameMoreMenu-dropdown-item' download href={sgfUrl} onClick={this._onToggleDropdown}>
              Download SGF
            </a>
            <a className='GameMoreMenu-dropdown-item' target='_blank' rel='noopener' href={gokibitzUrl} onClick={this._onToggleDropdown}>
              Open in GoKibitz
            </a>
            <a className='GameMoreMenu-dropdown-item' target='_blank' rel='noopener' href={eidogoUrl} onClick={this._onToggleDropdown}>
              Open in EidoGo
            </a>
            <a className='GameMoreMenu-dropdown-item' style={{ cursor: 'pointer' }} onClick={this._onToggleGameInfo}>
              Game Info
            </a>
          </div> : null}
        {gameInfoShowing ?
          <Modal title='Game Info' onClose={this._onToggleGameInfo}>
            <div className='GameMoreMenu-game-info'>
              {gameInfo}
            </div>
          </Modal>
        : null}
      </div>
    );
  }

  _setMoreEl = (ref: HTMLElement) => {
    this._moreEl = ref;
  }

  _onToggleDropdown = () => {
    this.setState({moreShowing: !this.state.moreShowing});
  }

  _onToggleGameInfo = () => {
    this.setState({gameInfoShowing: !this.state.gameInfoShowing});
  }
}
