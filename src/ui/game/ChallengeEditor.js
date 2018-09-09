// @flow
import React, { PureComponent as Component } from 'react';
import { A, Button, Icon, TabNav, UnseenBadge } from '../common';
import ProposalForm from './ProposalForm';
import ChatMessages from '../chat/ChatMessages';
import ChatMessageBar from '../chat/ChatMessageBar';
import {
  getEvenProposal,
  getActionsForUser,
  createInitialProposal,
  getOtherPlayerName
} from '../../model/game';
import { InvariantError } from '../../util/error';
import type {
  GameChannel,
  GameProposal,
  ProposalVisibility,
  ProposalEditMode,
  User,
  Room,
  Conversation,
  Preferences,
  Index,
  AppActions
} from '../../model';

type Props = {
  currentUser: User,
  challenge: ?GameChannel,
  initialRoomId?: ?number,
  usersByName: Index<User>,
  roomsById: Index<Room>,
  conversation: ?Conversation,
  preferences: Preferences,
  actions: AppActions,
  onCancel: Function
};

type State = {
  initialProposal: GameProposal,
  proposal: GameProposal,
  visibility: ProposalVisibility,
  notes: string,
  selectedProposalIndex: number,
  activeTab: string
};

export default class ChallengeEditor extends Component<> {
  static defaultProps: Props;
  state: State = this._getInitialState(this.props);

  _getInitialState(props: Props): State {
    let { challenge, currentUser, usersByName, preferences } = props;
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
        // Challenge we joined - create an even proposal
        proposal = getEvenProposal(
          challengeProposal,
          currentUser.name,
          usersByName
        );
      }
      visibility = proposal.private
        ? 'private'
        : challenge.global
          ? 'public'
          : 'roomOnly';
      notes = challenge.name || '';
    } else {
      let lastProposal = preferences.lastProposal;
      proposal = createInitialProposal(
        currentUser,
        lastProposal ? lastProposal.proposal : null
      );
      visibility = lastProposal ? lastProposal.visibility : 'public';
      notes = lastProposal && lastProposal.notes ? lastProposal.notes : '';
    }
    return {
      proposal,
      initialProposal: proposal,
      visibility,
      notes,
      selectedProposalIndex: 0,
      activeTab: 'proposal'
    };
  }

  componentDidUpdate(nextProps: Props) {
    let { challenge } = nextProps;
    let sentProposal = challenge && challenge.sentProposal;
    let { proposal } = this.state;
    let newProposal;
    if (sentProposal && sentProposal.status !== proposal.status) {
      // Challenge sending
      newProposal = { ...proposal, status: sentProposal.status };
    } else if (challenge && !this.props.challenge) {
      // Challenge created
      newProposal = { ...challenge.initialProposal, status: 'pending' };
    }

    // Check to see if our rank changed and, if so, correct the suggested
    // handicap and color (this can happen when you're new and your rank
    // hasn't settled)
    let { currentUser, usersByName } = nextProps;
    if (challenge && this.props.currentUser.rank !== currentUser.rank) {
      let creator = challenge.players.challengeCreator;
      if (
        proposal.status !== 'pending' &&
        creator &&
        creator.name !== currentUser.name &&
        challenge.initialProposal
      ) {
        newProposal = newProposal || { ...proposal };
        let evenProposal = getEvenProposal(
          challenge.initialProposal,
          currentUser.name,
          usersByName
        );
        newProposal.rules.handicap = evenProposal.rules.handicap;
        newProposal.players = evenProposal.players;
      }
    }
    if (newProposal) {
      this.setState({ proposal: newProposal });
    }
  }

  render() {
    let {
      currentUser,
      challenge,
      initialRoomId,
      usersByName,
      roomsById,
      conversation,
      actions,
      onCancel
    } = this.props;
    let {
      initialProposal,
      proposal,
      visibility,
      notes,
      selectedProposalIndex,
      activeTab
    } = this.state;
    // let sentProposal = challenge && challenge.sentProposal;
    let creator = challenge ? challenge.players.challengeCreator : currentUser;
    let isCreator = creator && creator.name === currentUser.name;
    let { status } = proposal;
    let roomId = challenge ? challenge.roomId : initialRoomId;
    let room = roomId && roomsById[roomId];

    if (!room) {
      throw new InvariantError('Room cannot be absent');
    }

    let pending = status === 'pending';
    let userActions = challenge
      ? getActionsForUser(challenge.actions, currentUser.name)
      : {};
    let receivedProposals = challenge ? challenge.receivedProposals : [];
    let proposalCount = receivedProposals ? receivedProposals.length : 0;

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
    } else if (!pending && !isCreator) {
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
          let challengerName = getOtherPlayerName(
            editProposal,
            currentUser.name
          );
          if (!challengerName) {
            throw new InvariantError('No challenger');
          }
          prevProposal = getEvenProposal(
            initialProposal,
            challengerName,
            usersByName
          );
          buttons = (
            <div className='ChallengeEditor-buttons-decision'>
              <Button primary onClick={this._onAcceptProposal}>
                &nbsp;&nbsp;Accept&nbsp;&nbsp;
              </Button>{' '}
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

    let proposalContent = (
      <div className='ChallengeEditor-proposal'>
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
          onChangeVisibility={this._onChangeVisibility}
        />
        <div className='ChallengeEditor-buttons'>
          {buttons}{' '}
          {editMode === 'creating' || editMode === 'negotiating' ? (
            <div className='ChallengeEditor-cancel'>
              <Button muted onClick={onCancel}>
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
        {proposalCount > 1 ? (
          <div className='ChallengeEditor-prevnext'>
            <A
              button
              disabled={selectedProposalIndex === 0}
              className='ChallengeEditor-prevnext-button'
              onClick={this._onPrevProposal}>
              <Icon name='chevron-left' />
            </A>
            <A
              button
              disabled={selectedProposalIndex === proposalCount - 1}
              className='ChallengeEditor-prevnext-button'
              onClick={this._onNextProposal}>
              <Icon name='chevron-right' />
            </A>
          </div>
        ) : null}
      </div>
    );

    let chatLabel = (
      <div className='ChallengeEditor-chat-label'>
        Chat
        <div className='ChallengeEditor-chat-label-badge'>
          <UnseenBadge
            majorCount={(conversation && conversation.unseenCount) || 0}
          />
        </div>
      </div>
    );
    let chatContent = conversation ? (
      <div className='ChallengeEditor-chat'>
        <div className='ChallengeEditor-chat-messages'>
          <ChatMessages
            currentUser={currentUser}
            messages={conversation.messages}
            onUserDetail={actions.onUserDetail}
            usersByName={usersByName}
          />
        </div>
        <div className='ChallengeEditor-chat-message-bar'>
          <ChatMessageBar conversation={conversation} onSubmit={this._onChat} />
        </div>
      </div>
    ) : null;

    return (
      <div className='ChallengeEditor'>
        <div className='ChallengeEditor-header'>
          {isCreator ? 'Create Challenge' : 'Challenge'}
          {room && room.name ? (
            <div className='ChallengeEditor-room-name'>{room.name}</div>
          ) : null}
        </div>
        {status === 'declined' ? (
          <div className='ChallengeEditor-declined'>
            Your proposal was declined
          </div>
        ) : null}
        {status === 'accepted' ? (
          <div className='ChallengeEditor-accepted'>
            <Icon name='check' /> Starting game...
          </div>
        ) : null}
        {editMode !== 'creating' ? (
          <div className='ChallengeEditor-tabs'>
            <TabNav
              activeTabId={activeTab}
              onSelectTab={this._onSelectTab}
              tabs={[
                { id: 'proposal', label: 'Proposal', content: proposalContent },
                { id: 'chat', label: chatLabel, content: chatContent }
              ]}
            />
          </div>
        ) : (
          proposalContent
        )}
      </div>
    );
  }

  _onChangeProposal = (proposal: GameProposal) => {
    this.setState({ proposal });
  };

  _onChangeNotes = (notes: string) => {
    this.setState({ notes });
  };

  _onChangeVisibility = (visibility: ProposalVisibility) => {
    this.setState({ visibility });
  };

  _onPrevProposal = () => {
    this.setState(state => ({
      selectedProposalIndex: state.selectedProposalIndex - 1
    }));
  };

  _onNextProposal = () => {
    this.setState(state => ({
      selectedProposalIndex: state.selectedProposalIndex + 1
    }));
  };

  _onSubmitProposal = () => {
    let { challenge } = this.props;
    let { proposal } = this.state;
    if (challenge) {
      this.props.actions.onSubmitChallengeProposal(challenge.id, proposal);
    }
  };

  _onCreateChallenge = () => {
    let { challenge, initialRoomId } = this.props;
    let { proposal, visibility, notes } = this.state;
    if (!challenge) {
      // Creating a challenge - we have no app state for it yet, so just
      // set the status here
      this.setState({ proposal: { ...proposal, status: 'pending' } });
    }
    let roomId = challenge ? challenge.roomId : initialRoomId;
    if (roomId) {
      this.props.actions.onCreateChallenge(proposal, roomId, visibility, notes);
    }
  };

  _onAcceptProposal = () => {
    let { selectedProposalIndex } = this.state;
    let { challenge } = this.props;
    let proposal =
      challenge &&
      challenge.receivedProposals &&
      challenge.receivedProposals[selectedProposalIndex];
    if (challenge && proposal) {
      this.props.actions.onAcceptChallengeProposal(challenge.id, proposal);
    }
  };

  _onDeclineProposal = () => {
    let { selectedProposalIndex } = this.state;
    let { currentUser, challenge } = this.props;
    let proposal =
      challenge &&
      challenge.receivedProposals &&
      challenge.receivedProposals[selectedProposalIndex];
    if (challenge && proposal) {
      let otherName = getOtherPlayerName(proposal, currentUser.name);
      if (otherName) {
        this.props.actions.onDeclineChallengeProposal(challenge.id, otherName);
        this.setState({ selectedProposalIndex: 0 });
      }
    }
  };

  _onSelectTab = (tab: string) => {
    let { challenge } = this.props;
    if (tab === 'chat' && challenge) {
      this.props.actions.markConversationSeen(challenge.id);
    }
    this.setState({ activeTab: tab });
  };

  _onChat = (body: string) => {
    let { challenge } = this.props;
    if (challenge) {
      this.props.actions.onSendChat(body, challenge.id);
    }
  };
}
