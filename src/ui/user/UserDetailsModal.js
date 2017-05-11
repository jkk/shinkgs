// @flow
import React, {PureComponent as Component} from 'react';
import moment from 'moment';
import localeString from 'locale-string';
import {
  A,
  Button,
  Spinner,
  RichContent,
  Modal
} from '../common';
import UserName from './UserName';
import UserAvatar from './UserAvatar';
import UserDetailsEditForm from './UserDetailsEditForm';
import GameSummaryList from '../game/GameSummaryList';
import {getUserStatusText, getUserAuthName} from '../../model/user';
import {isAncestor} from '../../util/dom';
import {formatLocaleDate, timeAgo} from '../../util/date';
import {InvariantError} from '../../util/error';
import type {
  UserDetailsRequest,
  User,
  UserDetails,
  GameSummary,
  Index,
  AppActions,
  RankGraph
} from '../../model';

let Chartist;
let ChartistGraph;

const MAX_GAME_SUMMARIES = 500;

type Props = {
  currentUser: ?User,
  userDetailsRequest: ?UserDetailsRequest,
  usersByName: Index<User>,
  rankGraphsByChannelId: Index<Object>,
  gameSummariesByUser: Index<Array<GameSummary>>,
  actions: AppActions
};

type State = {
  tab: 'bio' | 'games' | 'rankGraph',
  editing: boolean,
  graph: null
};

export default class UserDetailsModal extends Component {

  props: Props;

  state: State = {
    tab: 'bio',
    editing: false,
    graph: null
  };

  _mainDiv: ?HTMLElement;

  componentDidMount() {
    document.addEventListener('keyup', this._onKeyUp);
    if (document.body) {
      document.body.classList.add('no-scroll');
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this._onKeyUp);
    if (document.body) {
      document.body.classList.remove('no-scroll');
    }
  }

  render() {
    let {
      currentUser,
      userDetailsRequest,
      usersByName,
      gameSummariesByUser,
      actions
    } = this.props;
    if (!currentUser || !userDetailsRequest) {
      throw new InvariantError('currentUser and userDetailsRequest required');
    }
    let {tab, editing} = this.state;
    let content;
    let offline;
    let user = usersByName[userDetailsRequest.name];
    let gameSummaries = gameSummariesByUser[userDetailsRequest.name];
    let details = user && user.details;

    if (tab === 'rankGraph' && !this.state.graph) {
      this._createGraph();
    }

    if (editing && user && user.details) {
      return (
        <Modal title='Edit Profile' onClose={this._onDoneEditing}>
          <UserDetailsEditForm
            user={user}
            details={details}
            onSave={this._onSaveUserDetails}
            onCancel={this._onDoneEditing} />
        </Modal>
      );
    }

    if (user) {
      offline = user.flags && !user.flags.connected;
      if (details) {
        let persName = details.personalName && details.personalName !== user.name ? details.personalName : null;
        let authName = getUserAuthName(user);
        let locale: Object = localeString.parse(details.locale.replace('_', '-'));
        let joinedDate = new Date(details.regStartDate);
        let bio = details.personalInfo ? details.personalInfo.trim() : '';
        if (!bio) {
          tab = 'games';
        }
        content = (
          <div className='UserDetailsModal-user-info'>
            <div className='UserDetailsModal-subname'>
              {persName ?
                <div className='UserDetailsModal-realname'>
                  {persName}
                </div> : null}
              {authName ?
                <div className='UserDetailsModal-authname'>
                  {authName}
                </div> : null}
            </div>
            <div className='UserDetailsModal-info-bullets'>
              <div className='UserDetailsModal-joined'>
                Joined {formatLocaleDate(joinedDate)}
              </div>
              {locale ?
                <div className='UserDetailsModal-locale'>
                  {locale.language} / {locale.country.replace('United States', 'US')}
                </div> : null}
              {details.email && !details.privateEmail ?
                <div className='UserDetailsModal-email'>
                  <a href={`mailto:${details.email}`}>{details.email}</a>
                </div> : null}
            </div>
            {bio || gameSummaries ?
              <div className='UserDetailsModal-tabs-container'>
                <div className='UserDetailsModal-tabs'>
                  <div className='UserDetailsModal-tabs-inner'>
                    {bio ?
                      <A
                        className={'UserDetailsModal-tab' + (tab === 'bio' ? ' UserDetailsModal-tab-active' : '')}
                        onClick={this._onShowBio}>
                        Bio
                      </A> : null}
                    {gameSummaries ?
                      <A
                        className={'UserDetailsModal-tab' + (tab === 'games' ? ' UserDetailsModal-tab-active' : '')}
                        onClick={this._onShowGames}>
                        {gameSummaries.length} Games
                      </A> : null}
                    <A
                      className={'UserDetailsModal-tab' + (tab === 'rankGraph' ? ' UserDetailsModal-tab-active' : '')}
                      onClick={this._onShowRankGraph}>
                      Rank
                    </A>
                  </div>
                </div>
                <div className='UserDetailsModal-tab-content'>
                  {bio && tab === 'bio' ?
                    <div className='UserDetailsModal-bio'>
                      <RichContent content={bio} />
                    </div> : null}
                  {gameSummaries && gameSummaries.length && tab === 'games' ?
                    <div className='UserDetailsModal-games-list'>
                      <GameSummaryList
                        games={gameSummaries.slice(0, MAX_GAME_SUMMARIES)}
                        player={user.name}
                        onSelect={this._onSelectGame}/>
                    </div> : null}
                  {tab === 'rankGraph' ?
                    <div className='UserDetailsModal-rank-graph'>
                      {this.state.graph ?
                        this.state.graph
                        : <Spinner />
                      }
                    </div> : null}
                </div>
              </div> : null}
          </div>
        );
      } else {
        content = (
          <div className='UserDetailsModal-loading'>
            <Spinner />
          </div>
        );
      }
    } else if (userDetailsRequest.status === 'pending') {
      content = (
        <div className='UserDetailsModal-loading'>
          <Spinner />
        </div>
      );
    } else {
      content = (
        <div className='UserDetailsModal-not-found'>
          User not found
        </div>
      );
    }
    return (
      <div className='UserDetailsModal' onClick={this._onMaybeClose}>
        <div className='UserDetailsModal-main' ref={this._setMainRef}>
          <div className='UserDetailsModal-top-bar'>
            <A className='UserDetailsModal-close' onClick={actions.onCloseUserDetail}>
              &times;
            </A>
            <div className='UserDetailsModal-status'>
              {user ? getUserStatusText(user) + (offline && user.details ? ' - last on ' + timeAgo(new Date(user.details.lastOn)) : '') : null}
            </div>
            <div className='UserDetailsModal-avatar'>
              <UserAvatar user={user} />
            </div>
            {user ?
              <div className='UserDetailsModal-actions'>
                <div className='UserDetailsModal-friending'>
                  <label>
                    <input type='checkbox' /> Fan
                  </label>
                  <label>
                    <input type='checkbox' /> Buddy
                  </label>
                  <label>
                    <input type='checkbox' /> Censored
                  </label>
                </div>
                {user && (user.name !== currentUser.name && user.flags && user.flags.connected) ?
                  <div className='UserDetailsModal-message'>
                    <Button icon='comment' secondary onClick={this._onStartChat}>Message</Button>
                  </div> :
                  (user && user.name === currentUser.name ?
                    <div className='UserDetailsModal-edit-button'>
                      <Button icon='pencil' secondary onClick={this._onEdit}>Edit Profile</Button>
                    </div> : null)}
              </div> : null}
          </div>
          <div className='UserDetailsModal-details'>
            <div className='UserDetailsModal-name'>
              {user ? <UserName user={user} extraIcons /> : userDetailsRequest.name}
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }

  _createGraph = () => {
    const {
      userDetailsRequest,
      usersByName,
      rankGraphsByChannelId
    } = this.props;

    const user = userDetailsRequest && usersByName[userDetailsRequest.name];
    const channelId:string = String(user && user.details && user.details.channelId);
    const rankGraph = rankGraphsByChannelId[channelId];

    if (!rankGraph) {
      return;
    }

    // $FlowFixMe: Flow doesn't know what require.ensure is
    require.ensure([], require => {
      ChartistGraph =  require('react-chartist').default;
      Chartist = require('chartist');

      const options = {
        height: '300px',
        axisY: {
          type: Chartist.FixedScaleAxis,
          low: -300,
          high: 0,
          ticks: [-300, -200, -100, 0],
          labelInterpolationFnc: function(value) {
            let label = value < 0 ? 'k' : 'd';
            let rank = Math.abs(value/100);
            if (label === 'd') {
              rank += 1;
            }

            return `${rank}${label}`;
          }
        },
        axisX: {
          type: Chartist.FixedScaleAxis,
          divisor: rankGraph.data.series[0].length,
          labelInterpolationFnc: function(value, index) {
            const day = moment(value).format('DD');
            const month = moment(value).format('MMM');
            const format = (index === 0 || month === 'Jan')
              ? 'MMM YYYY'
              : 'MMM';

            return index === 0 || day === '01'
              ? moment(value).format(format)
              : null;
          }
        },
        fullWidth: true,
        showPoint: false,
        chartPadding: {
          right: 40
        }
      };

      const type = 'Line';

      this.setState({
        graph: <ChartistGraph
          data={rankGraph.data}
          options={options}
          type={type}
        />
      });
    });
  }

  _setMainRef = (ref: HTMLElement) => {
    this._mainDiv = ref;
  }

  _onKeyUp = (e: Object) => {
    if (e.key === 'Escape' || e.keyCode === 27) {
      this.props.actions.onCloseUserDetail();
    }
  }

  _onMaybeClose = (e: Object) => {
    let insideModal = (
      this._mainDiv && (
        e.target === this._mainDiv ||
        isAncestor(e.target, this._mainDiv)
      )
    );
    if (insideModal) {
      return;
    }
    this.props.actions.onCloseUserDetail();
  }

  _onShowBio = () => {
    this.setState({tab: 'bio'});
  }

  _onShowGames = () => {
    this.setState({tab: 'games'});
  }

  _onShowRankGraph = () => {
    const {
      actions,
      userDetailsRequest,
      usersByName
    } = this.props;

    const user = userDetailsRequest && usersByName[userDetailsRequest.name];
    const channelId:string = String(user && user.details && user.details.channelId);

    actions.onRequestRankGraph(channelId);
    this.setState({tab: 'rankGraph'});
  }

  _onSelectGame = (game: GameSummary) => {
    this.props.actions.onCloseUserDetail();
    if (game.inPlay) {
      this.props.actions.onJoinGame(game.timestamp);
    } else {
      this.props.actions.onLoadGame(game.timestamp);
    }
  }

  _onStartChat = () => {
    let {userDetailsRequest, usersByName} = this.props;
    if (userDetailsRequest) {
      let user = usersByName[userDetailsRequest.name];
      if (user) {
        this.props.actions.onStartChat(user);
      }
    }
  }

  _onEdit = () => {
    this.setState({editing: true});
  }

  _onDoneEditing = () => {
    this.setState({editing: false});
  }

  _onSaveUserDetails = (user: User, details: UserDetails, newPassword: string) => {
    this.props.actions.onUpdateProfileDetails(user, details);
    if (newPassword) {
      this.props.actions.onUpdatePassword(user, newPassword);
    }
    this._onDoneEditing();
  }
}
