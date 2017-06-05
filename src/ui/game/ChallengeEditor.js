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
  Index,
  AppActions
} from '../../model';

type Props = {
  currentUser: User,
  challenge: ?GameChannel,
  initialRoomId?: ?number,
  usersByName: Index<User>,
  roomsById: Index<Room>,
  actions: AppActions,
  onCancel: Function
};

type State = {
  initialProposal: GameProposal,
  proposal: GameProposal,
  visibility: ProposalVisibility,
  notes: string,
  selectedProposalIndex: number
};

export default class ChallengeEditor extends Component {
  
  props: Props;
  state: State = this._getInitialState(this.props);

  _getInitialState(props: Props): State {
    let {challenge, currentUser, usersByName} = props;
    let proposal;
    let visibility;
    let notes;
    if (challenge) {
      let challengeProposal;
      if (challenge.sentProposal) {
        challengeProposal = challenge.sentProposal;
      } else {
        challengeProposal = challenge.initialProposal;
      }
      if (!challengeProposal) {
        throw new InvariantError('No proposal in challenge');
      }
      let creator = challenge.players.challengeCreator;
      if (creator && creator.name === currentUser.name) {
        // Challenge we created - use as-is
        proposal = challengeProposal;
      } else {
        // Challenge we joined - create a starting proposal
        proposal = getStartingProposal(challengeProposal, currentUser, usersByName);
      }
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
      notes,
      selectedProposalIndex: 0
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
        proposal: {...challenge.initialProposal, status: 'pending'}
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
      actions,
      onCancel
    } = this.props;
    let {
      initialProposal,
      proposal,
      visibility,
      notes,
      selectedProposalIndex
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
    let userActions = challenge ? getActionsForUser(challenge.actions, currentUser.name) : {};
    let receivedProposals = challenge ? challenge.receivedProposals : [];

    let editMode: ProposalEditMode;
    let editProposal;
    let prevProposal;
    let buttons;
    if (!challenge && !pending) {
      editMode = 'creating';
      editProposal = proposal;
      buttons = (
        <Button primary onClick={this._onCreateChallenge}>
          Create Challenge
        </Button>
      );
    } else if (!pending && !userActions.CHALLENGE_SETUP) {
      editMode = 'negotiating';
      editProposal = proposal;
      prevProposal = initialProposal;
      buttons = (
        <Button primary onClick={this._onSubmitProposal}>
          Send Proposal
        </Button>
      );
    } else {
      editMode = 'waiting';
      if (userActions.CHALLENGE_SETUP || !challenge) {
        if (receivedProposals && receivedProposals.length) {
          // Creator that can accept/decline challenges
          editProposal = receivedProposals[selectedProposalIndex];
          prevProposal = proposal;
          buttons = (
            <div className='ChallengeEditor-buttons-decision'>
              <Button primary onClick={this._onAcceptProposal}>
                &nbsp;&nbsp;Accept&nbsp;&nbsp;
              </Button>
              {' '}
              <Button danger onClick={this._onDeclineProposal}>
                Decline
              </Button>
            </div>
          );
        } else {
          // Creator awaiting challenges
          editProposal = proposal;
          prevProposal = proposal;
          buttons = (
            <Button primary disabled loading>
              Awaiting Challengers
            </Button>
          );
        }
      } else {
        // Sent proposal to creator
        editProposal = proposal;
        prevProposal = initialProposal;
        buttons = (
          <Button primary disabled loading>
            Awaiting Response
          </Button>
        );
      }
    }

    // console.log({challenge, proposal, receivedProposals, userActions, visibility, editMode});
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
          currentUser={currentUser}
          editMode={editMode}
          proposal={editProposal}
          prevProposal={prevProposal}
          visibility={visibility}
          notes={notes}
          usersByName={usersByName}
          onUserDetail={actions.onUserDetail}
          onChangeProposal={this._onChangeProposal}
          onChangeNotes={this._onChangeNotes}
          onChangeVisibility={this._onChangeVisibility} />
        <div className='ChallengeEditor-buttons'>
          {buttons}
          {' '}
          <Button
            muted
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

  _onSubmitProposal = () => {
    let {challenge} = this.props;
    let {proposal} = this.state;
    if (challenge) {
      this.props.actions.onSubmitChallengeProposal(challenge.id, proposal);
    }
  }

  _onCreateChallenge = () => {
    let {challenge, initialRoomId} = this.props;
    let {proposal, visibility, notes} = this.state;
    if (!challenge) {
      // Creating a challenge - we have no app state for it yet, so just
      // set the status here
      this.setState({proposal: {...proposal, status: 'pending'}});
    }
    let roomId = challenge ? challenge.roomId : initialRoomId;
    if (roomId) {
      this.props.actions.onCreateChallenge(proposal, roomId, visibility, notes);
    }
  }

  _onAcceptProposal = () => {
    let {selectedProposalIndex} = this.state;
    let {challenge} = this.props;
    let proposal = challenge
      && challenge.receivedProposals
      && challenge.receivedProposals[selectedProposalIndex];
    if (challenge && proposal) {
      this.props.actions.onAcceptChallengeProposal(challenge.id, proposal);
    }
  }

  _onDeclineProposal = () => {
    let {selectedProposalIndex} = this.state;
    let {currentUser, challenge} = this.props;
    let proposal = challenge
      && challenge.receivedProposals
      && challenge.receivedProposals[selectedProposalIndex];
    if (challenge && proposal) {
      let otherName;
      for (let player of proposal.players) {
        let name = player.user ? player.user.name : player.name;
        if (name && name !== currentUser.name) {
          otherName = name;
        }
      }
      if (otherName) {
        this.props.actions.onDeclineChallengeProposal(challenge.id, otherName);
      }
    }
  }
}