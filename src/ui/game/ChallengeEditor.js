// @flow
import React, {PureComponent as Component} from 'react';
import {Button, Icon} from '../common';
import GameTypeIcon from './GameTypeIcon';
import GameTimeSystem from './GameTimeSystem';
import ChallengePlayers from './ChallengePlayers';
import {
  formatGameType,
  formatGameRuleset,
  getStartingProposal
} from '../../model/game';
import {InvariantError} from '../../util/error';
import type {
  GameChannel,
  GameProposal,
  ChallengeStatus,
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

  render() {
    let {
      challenge,
      usersByName,
      roomsById,
      onCancel,
      onUserDetail
    } = this.props;
    let {proposal} = this.state;
    let status: ChallengeStatus = challenge.challengeStatus || 'viewing';
    let {players, nigiri, rules} = proposal;
    let rows = [];
    let room = challenge.roomId && roomsById[challenge.roomId];
    if (rules.handicap) {
      rows.push(
        <tr key='handicap'>
          <th>Handi</th>
          <td>{rules.handicap}</td>
        </tr>
      );
    }
    rows.push(
      <tr key='komi'>
        <th>Komi</th>
        <td>{rules.komi}</td>
      </tr>
    );
    if (rules.timeSystem) {
      rows.push(
        <tr key='time'>
          <th>Time</th>
          <td><GameTimeSystem rules={rules} /></td>
        </tr>
      );
    }
    if (rules.rules) {
      rows.push(
        <tr key='rules'>
          <th>Rules</th>
          <td></td>
        </tr>
      );
    }
    let waiting = status !== 'viewing' && status !== 'declined';
    return (
      <div className='ChallengeEditor'>
        {status === 'declined' ?
          <div className='ChallengeEditor-declined'>
            Your proposal was declined
          </div> : null}
        {status === 'accepted' ?
          <div className='ChallengeEditor-accepted'>
            <Icon name='check' /> Starting game...
          </div> : null}
        <div className='ChallengeEditor-proposal'>
          <div className='ChallengeEditor-intro'>
            <div className='ChallengeEditor-game-type'>
              <div className='ChallengeEditor-game-type-icon'>
                <GameTypeIcon type={proposal.gameType} />
              </div>
              <div className='ChallengeEditor-game-type-name'>
                {proposal.private ? 'Private ' : null}
                {formatGameType(proposal.gameType)} Challenge
              </div>
            </div>
            {room && room.name ?
              <div className='ChallengeEditor-room-name'>
                {room.name}
              </div> : null}
          </div>
          <div className='ChallengeEditor-proposal-main'>
            <div className='ChallengeEditor-proposal-players'>
              <ChallengePlayers
                gameType={proposal.gameType}
                players={players}
                nigiri={nigiri}
                usersByName={usersByName}
                onUserDetail={onUserDetail} />
            </div>
            <div className='ChallengeEditor-proposal-rules'>
              <table className='ChallengeEditor-proposal-table'>
                <tbody>
                  {challenge.name ?
                    <tr>
                      <th>Notes</th>
                      <td>
                        <div className='ChallengeEditor-game-name'>
                          {challenge.name}
                        </div>
                      </td>
                    </tr> : null}
                  <tr>
                    <th>Rules</th>
                    <td>
                      {rules.handicap ? <div>Handicap {rules.handicap}</div> : null}
                      <div>Komi {rules.komi}</div>
                      <div><GameTimeSystem rules={rules} /></div>
                      {rules.rules ? <div>{formatGameRuleset(rules.rules)}</div> : null}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className='ChallengeEditor-buttons'>
          <Button
            primary
            disabled={waiting}
            loading={waiting}
            onClick={this._onSubmit}>
            Send Challenge
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