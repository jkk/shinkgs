// @flow
import React, {PureComponent as Component} from 'react';
import {Button, Icon} from '../common';
import GameTypeIcon from './GameTypeIcon';
import GameTimeSystem from './GameTimeSystem';
import ChallengePlayers from './ChallengePlayers';
import {
  formatGameType,
  formatGameRuleset,
  getStartingProposal,
  getActionsForUser
} from '../../model/game';
import {InvariantError} from '../../util/error';
import type {
  GameChannel,
  GameProposal,
  User,
  Room,
  Index
} from '../../model';

type Props = {
  currentUser: User,
  challenge: GameChannel,
  usersByName: Index<User>,
  roomsById: Index<Room>,
  onUserDetail: string => any,
  onSubmit: GameProposal => any,
  onCancel: Function
};

type State = {
  proposal: GameProposal
};

export default class ChallengeEditor extends Component {
  
  props: Props;
  state: State = this._getState(this.props);

  _getState(props: Props): State {
    let {challenge, currentUser, usersByName} = props;
    let initialProposal = challenge.initialProposal;
    if (!initialProposal || !currentUser) {
      throw new InvariantError('No initialProposal in challenge');
    }
    let proposal = getStartingProposal(initialProposal, currentUser, usersByName);
    return {
      proposal
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    let {challenge} = nextProps;
    let {sentProposal} = challenge;
    let {proposal} = this.state;
    if (sentProposal && sentProposal.status !== proposal.status) {
      this.setState({
        proposal: {...proposal, status: sentProposal.status}
      });
    }
  }

  render() {
    let {
      currentUser,
      challenge,
      usersByName,
      roomsById,
      onCancel,
      onUserDetail
    } = this.props;
    let {proposal} = this.state;
    // let {sentProposal} = challenge;
    let creator = challenge.players.challengeCreator;
    let isCreator = creator && creator.name === currentUser.name;
    let {players, nigiri, rules, status} = proposal;
    let room = challenge.roomId && roomsById[challenge.roomId];
    let pending = status === 'pending';
    // let actions = getActionsForUser(challenge.actions, currentUser.name);
    // let receivedProposals;
    // if (isCreator) {
    //   receivedProposals = challenge.receivedProposals;
    // }
    // let visibility;
    // if (proposal.private) {
    //   visibility = 'private';
    // } else if (challenge.global) {
    //   visibility = 'public';
    // } else {
    //   visibility = 'roomOnly';
    // }
    // console.log({challenge, proposal, sentProposal, receivedProposals, actions});
    return (
      <div className='ChallengeEditor'>
        <div className='ChallengeEditor-header'>
          {isCreator ? 'Create Challenge' : 'Challenge'}
          {room && room.name ?
            <div className='ChallengeEditor-room-name'>
              {room.name}
            </div> : null}
        </div>
        {status === 'declined' ?
          <div className='ChallengeEditor-declined'>
            Your proposal was declined
          </div> : null}
        {status === 'accepted' ?
          <div className='ChallengeEditor-accepted'>
            <Icon name='check' /> Starting game...
          </div> : null}
        <div className='ChallengeEditor-proposal'>
          <div className='ChallengeEditor-game-type'>
            <div className='ChallengeEditor-game-type-icon'>
              <GameTypeIcon type={proposal.gameType} />
            </div>
            <div className='ChallengeEditor-game-type-name'>
              {proposal.private ? 'Private ' : null}
              {formatGameType(proposal.gameType)} Game
            </div>
          </div>
          {challenge.name ?
            <div className='ChallengeEditor-field'>
              <div className='ChallengeEditor-field-label'>
                Notes
              </div>
              <div className='ChallengeEditor-field-value'>
                {challenge.name}
              </div>
            </div> : null}
          <div className='ChallengeEditor-proposal-players'>
            <ChallengePlayers
              gameType={proposal.gameType}
              players={players}
              nigiri={nigiri}
              usersByName={usersByName}
              onUserDetail={onUserDetail} />
          </div>
          <div className='ChallengeEditor-field'>
            <div className='ChallengeEditor-field-label'>
              Rules
            </div>
            <div className='ChallengeEditor-field-values'>
              {rules.handicap ? <div>Handicap {rules.handicap}</div> : null}
              <div>Komi {rules.komi}</div>
              <div><GameTimeSystem rules={rules} /></div>
              {rules.rules ? <div>{formatGameRuleset(rules.rules)}</div> : null}
            </div>
          </div>
        </div>
        <div className='ChallengeEditor-buttons'>
          <Button
            primary
            disabled={pending}
            loading={pending}
            onClick={this._onSubmit}>
            Send Proposal
          </Button>
          {' '}
          <Button
            secondary
            onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  _onSubmit = () => {
    this.props.onSubmit(this.state.proposal);
  }
}