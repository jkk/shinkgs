// @flow
import React, {PureComponent as Component} from 'react';
import {Button, Icon} from '../common';
import ProposalForm from './ProposalForm';
import {
  getStartingProposal,
  getActionsForUser,
  createInitialProposal
} from '../../model/game';
import {InvariantError} from '../../util/error';
import type {
  GameChannel,
  GameProposal,
  ProposalVisibility,
  ProposalEditMode,
  User,
  Room,
  Index
} from '../../model';

type Props = {
  currentUser: User,
  challenge: ?GameChannel,
  initialRoomId?: ?number,
  usersByName: Index<User>,
  roomsById: Index<Room>,
  onUserDetail: string => any,
  onSubmit: GameProposal => any,
  onCancel: Function
};

type State = {
  initialProposal: GameProposal,
  proposal: GameProposal,
  visibility: ProposalVisibility,
  notes: string
};

export default class ChallengeEditor extends Component {
  
  props: Props;
  state: State = this._getState(this.props);

  _getState(props: Props): State {
    let {challenge, currentUser, usersByName} = props;
    let proposal;
    let visibility;
    let notes;
    if (challenge) {
      let challengeProposal = challenge.initialProposal;
      if (!challengeProposal || !currentUser) {
        throw new InvariantError('No initialProposal in challenge');
      }
      proposal = getStartingProposal(challengeProposal, currentUser, usersByName);
      visibility = proposal.private ? 'private' : (challenge.global ? 'public' : 'roomOnly');
      notes = challenge.name || '';
    } else {
      proposal = createInitialProposal(currentUser);
      visibility = 'public';
      notes = '';
    }
    return {
      proposal,
      initialProposal: proposal,
      visibility,
      notes
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    let {challenge} = nextProps;
    let sentProposal = challenge && challenge.sentProposal;
    let {proposal} = this.state;
    if (sentProposal && sentProposal.status !== proposal.status) {
      // Challenge sending
      this.setState({
        proposal: {...proposal, status: sentProposal.status}
      });
    } else if (challenge && !this.props.challenge) {
      // Challenge created
      this.setState({
        proposal: challenge.initialProposal
      });
    }
  }

  render() {
    let {
      currentUser,
      challenge,
      initialRoomId,
      usersByName,
      roomsById,
      onCancel,
      onUserDetail
    } = this.props;
    let {
      initialProposal,
      proposal,
      visibility,
      notes
    } = this.state;
    // let sentProposal = challenge && challenge.sentProposal;
    let creator = challenge ? challenge.players.challengeCreator : currentUser;
    let isCreator = creator && creator.name === currentUser.name;
    let {status} = proposal;
    let roomId = challenge ? challenge.roomId : initialRoomId;
    let room = roomId && roomsById[roomId];

    if (!room) {
      throw new InvariantError('Room cannot be absent');
    }

    let pending = status === 'pending';
    let actions = challenge ? getActionsForUser(challenge.actions, currentUser.name) : {};
    // let receivedProposals = challenge ? challenge.receivedProposals : [];

    let editMode: ProposalEditMode;
    let editProposal;
    let prevProposal;
    let submitLabel;
    if (!challenge) {
      editMode = 'creating';
      editProposal = proposal;
      submitLabel = 'Create Challenge';
    } else if (!pending) {
      editMode = 'proposing';
      editProposal = proposal;
      prevProposal = initialProposal;
      submitLabel = actions.CHALLENGE_ACCEPT ? 'Accept' : 'Send Proposal';
    } else {
      // TODO - check for received proposal
      editMode = 'readonly';
      editProposal = proposal;
      prevProposal = initialProposal;
      submitLabel = 'Awaiting Response';
    }

    // console.log({challenge, proposal, sentProposal, receivedProposals, actions, visibility, editMode});
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
        <ProposalForm
          editMode={editMode}
          proposal={editProposal}
          prevProposal={prevProposal}
          visibility={visibility}
          notes={notes}
          usersByName={usersByName}
          onUserDetail={onUserDetail}
          onChangeProposal={this._onChangeProposal}
          onChangeNotes={this._onChangeNotes}
          onChangeVisibility={this._onChangeVisibility} />
        <div className='ChallengeEditor-buttons'>
          <Button
            primary
            disabled={pending}
            loading={pending}
            onClick={this._onSubmit}>
            {submitLabel}
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

  _onChangeProposal = (proposal: GameProposal) => {
    this.setState({proposal});
  }

  _onChangeNotes = (notes: string) => {
    this.setState({notes});
  }

  _onChangeVisibility = (visibility: ProposalVisibility) => {
    this.setState({visibility});
  }

  _onSubmit = () => {
    this.props.onSubmit(this.state.proposal);
  }
}