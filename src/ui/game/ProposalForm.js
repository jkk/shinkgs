// @flow
import React, { PureComponent as Component } from 'react';
import GameTypeIcon from './GameTypeIcon';
import GameTimeSystem from './GameTimeSystem';
import ProposalPlayers from './ProposalPlayers';
import ProposalFormInput from './ProposalFormInput';
import { SelectInput } from '../common';
import {
  formatDuration,
  formatGameType,
  formatGameRuleset
} from '../../model/game';
import type {
  GameProposal,
  ProposalVisibility,
  ProposalEditMode,
  User,
  Index
} from '../../model';

type Props = {
  currentUser: User,
  editMode: ProposalEditMode,
  proposal: GameProposal,
  prevProposal: ?GameProposal,
  notes: string,
  visibility: ProposalVisibility,
  usersByName: Index<User>,
  onUserDetail: string => any,
  onChangeProposal: GameProposal => any,
  onChangeNotes: string => any,
  onChangeVisibility: ProposalVisibility => any
};

const visibilityOptions = [
  { value: 'private', label: 'Private' },
  { value: 'roomOnly', label: 'Room Only' },
  { value: 'public', label: 'Public' }
];

const gameTypeOptions = [
  { value: 'ranked', label: 'Ranked Game' },
  { value: 'free', label: 'Free Game' }
];

const rulesetOptions = [
  { value: 'japanese', label: 'Japanese Rules' },
  { value: 'chinese', label: 'Chinese Rules' },
  { value: 'aga', label: 'AGA Rules' },
  { value: 'new_zealand', label: 'New Zealand Rules' }
];

const timeSystemOptions = [
  { value: 'none', label: 'No Time Limit' },
  { value: 'absolute', label: 'Absolute Time' },
  { value: 'byo_yomi', label: 'Byo-Yomi Time' },
  { value: 'canadian', label: 'Canadian Time' }
];

const sizeOptions = [9, 13, 19];

export default class ProposalForm extends Component<> {
  static defaultProps: Props;
  render() {
    let {
      currentUser,
      editMode,
      proposal,
      prevProposal,
      notes,
      visibility,
      usersByName,
      onUserDetail
    } = this.props;
    let { players, nigiri, rules } = proposal;
    let ruleset = rules.rules || 'japanese';
    return (
      <div className='ProposalForm'>
        {editMode !== 'creating' ? (
          <div className='ProposalForm-players'>
            <ProposalPlayers
              currentUser={currentUser}
              gameType={proposal.gameType}
              players={players}
              prevPlayers={prevProposal ? prevProposal.players : null}
              nigiri={nigiri}
              prevNigiri={prevProposal ? prevProposal.nigiri : null}
              usersByName={usersByName}
              onUserDetail={onUserDetail}
              onToggleRole={this._onToggleRole}
            />
          </div>
        ) : null}
        {editMode === 'creating' ? (
          <div className='ProposalForm-field'>
            <div className='ProposalForm-field-content'>
              <input
                placeholder='Note to challengers'
                type='text'
                value={notes}
                onChange={this._onChangeNotes}
              />
            </div>
          </div>
        ) : null}
        {editMode !== 'creating' ? (
          <div className='ProposalForm-type-notes'>
            <div className='ProposalForm-game-type-icon'>
              <GameTypeIcon type={proposal.gameType} />
            </div>
            <div
              className={
                'ProposalForm-game-type-name' +
                (prevProposal && prevProposal.gameType !== proposal.gameType
                  ? ' ProposalForm-game-type-name-hilite'
                  : '')
              }>
              {visibility === 'private' ? 'Private ' : null}
              {formatGameType(proposal.gameType)}
            </div>
            {notes ? <div className='ProposalForm-notes'>{notes}</div> : null}
          </div>
        ) : null}
        {editMode === 'creating' ? (
          <div className='ProposalForm-type-visibility'>
            <div className='ProposalForm-field'>
              <div className='ProposalForm-field-label'>Game Type</div>
              <div className='ProposalForm-field-content'>
                <div className='ProposalForm-game-type'>
                  <SelectInput
                    value={proposal.gameType}
                    onChange={this._onChangeGameType}>
                    {gameTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <div className='ProposalForm-visibility'>
                  <SelectInput
                    value={visibility}
                    onChange={this._onChangeVisibility}>
                    {visibilityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </SelectInput>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {editMode === 'creating' ? (
          <div className='ProposalForm-rules-time'>
            <div className='ProposalForm-time'>
              <div>
                <div className='ProposalForm-field-label'>Time</div>
                <div className='ProposalForm-field-content'>
                  <div className='ProposalForm-input-select'>
                    <SelectInput
                      value={rules.timeSystem}
                      onChange={this._onChangeTimeSystem}>
                      {timeSystemOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  {rules.timeSystem !== 'none' ? (
                    <ProposalFormInput
                      value={formatDuration(rules.mainTime || 0)}
                      label='main'
                      onMinus={this._onMainTimeMinus}
                      onPlus={this._onMainTimePlus}
                    />
                  ) : null}
                  {rules.timeSystem === 'byo_yomi' ||
                  rules.timeSystem === 'canadian' ? (
                      <ProposalFormInput
                        value={formatDuration(rules.byoYomiTime || 0)}
                        label='overtime'
                        onMinus={this._onByoYomiMinus}
                        onPlus={this._onByoYomiPlus}
                      />
                    ) : null}
                  {rules.timeSystem === 'byo_yomi' ? (
                    <ProposalFormInput
                      value={rules.byoYomiPeriods || 0}
                      label='periods'
                      onMinus={this._onPeriodsMinus}
                      onPlus={this._onPeriodsPlus}
                    />
                  ) : null}
                  {rules.timeSystem === 'canadian' ? (
                    <ProposalFormInput
                      value={rules.byoYomiStones || 0}
                      label='stones'
                      onMinus={this._onStonesMinus}
                      onPlus={this._onStonesPlus}
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <div className='ProposalForm-rules'>
              <div className='ProposalForm-field'>
                <div className='ProposalForm-field-label'>Rules</div>
                <div className='ProposalForm-field-content'>
                  <div className='ProposalForm-input-select'>
                    <SelectInput
                      value={ruleset}
                      onChange={this._onChangeRuleset}>
                      {rulesetOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <ProposalFormInput
                    value={`${rules.size}×${rules.size}`}
                    label='board'
                    onMinus={this._onSizeMinus}
                    onPlus={this._onSizePlus}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {editMode !== 'creating' ? (
          <div className='ProposalForm-rules-time'>
            <div className='ProposalForm-rules-readonly'>
              <div className='ProposalForm-field'>
                <div className='ProposalForm-field-label'>Time</div>
                <div className='ProposalForm-field-content'>
                  <GameTimeSystem rules={rules} />
                </div>
              </div>
              {rules.rules ? (
                <div className='ProposalForm-field'>
                  <div className='ProposalForm-field-label'>Rules</div>
                  <div className='ProposalForm-field-content'>
                    {formatGameRuleset(rules.rules)}
                  </div>
                </div>
              ) : null}
              <div className='ProposalForm-field'>
                <div className='ProposalForm-field-label'>Board</div>
                <div className='ProposalForm-field-content'>
                  {rules.size}×{rules.size}
                </div>
              </div>
            </div>
            <div className='ProposalForm-handicap-komi'>
              <div className='ProposalForm-handicap-komi-heading'>Handicap</div>
              <ProposalFormInput
                value={rules.handicap || 0}
                label='handicap'
                readonly={editMode === 'waiting' || proposal.nigiri}
                hilited={
                  prevProposal
                    ? (prevProposal.rules.handicap || 0) !==
                      (rules.handicap || 0)
                    : false
                }
                onMinus={this._onHandiMinus}
                onPlus={this._onHandiPlus}
              />
              <ProposalFormInput
                value={rules.komi}
                label='komi'
                readonly={editMode === 'waiting' || proposal.nigiri}
                hilited={
                  prevProposal ? prevProposal.rules.komi !== rules.komi : false
                }
                onMinus={this._onKomiMinus}
                onPlus={this._onKomiPlus}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  _onChangeVisibility = (e: Object) => {
    if (e.target.value === 'private') {
      this.props.onChangeProposal({ ...this.props.proposal, gameType: 'free' });
    }
    this.props.onChangeVisibility(e.target.value);
  };

  _onChangeGameType = (e: Object) => {
    let gameType = e.target.value;
    let { visibility, proposal } = this.props;
    if (gameType === 'ranked' && visibility === 'private') {
      this.props.onChangeVisibility('public');
    }
    this.props.onChangeProposal({ ...proposal, gameType });
  };

  _onChangeNotes = (e: Object) => {
    this.props.onChangeNotes(e.target.value);
  };

  _onChangeRuleset = (e: Object) => {
    let proposal = this.props.proposal;
    let rules = e.target.value;
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, rules }
    });
  };

  _onChangeTimeSystem = (e: Object) => {
    let proposal = this.props.proposal;
    let timeSystem = e.target.value;
    let rules = { ...proposal.rules, timeSystem };
    if (timeSystem === 'canadian') {
      rules.byoYomiStones = 25;
      rules.byoYomiTime = 7 * 60;
    } else if (timeSystem === 'byo_yomi') {
      rules.byoYomiTime = 30;
      rules.byoYomiPeriods = 5;
    }
    this.props.onChangeProposal({ ...proposal, rules });
  };

  _onToggleRole = (name: string) => {
    let { editMode, proposal } = this.props;
    if (editMode !== 'negotiating' || proposal.players.length !== 2) {
      return;
    }
    let thisPlayerOld = proposal.players.find(p => p.name === name);
    let otherPlayerOld = proposal.players.find(p => p.name !== name);
    if (!thisPlayerOld || !otherPlayerOld) {
      return;
    }
    const thisPlayer = { ...thisPlayerOld };
    const otherPlayer = { ...otherPlayerOld };
    let newProposal = { ...proposal };
    if (proposal.nigiri) {
      newProposal.nigiri = false;
    } else if (thisPlayer.role === 'white') {
      thisPlayer.role = 'black';
      otherPlayer.role = 'white';
    } else if (thisPlayer.role === 'black') {
      newProposal.nigiri = true;
      newProposal.rules = { ...newProposal.rules, handicap: 0 };
      thisPlayer.role = 'white';
      otherPlayer.role = 'black';
    }
    // Maintain order for the sake of KGS API
    newProposal.players = proposal.players.map(
      p => (p.name === thisPlayer.name ? thisPlayer : otherPlayer)
    );
    this.props.onChangeProposal(newProposal);
  };

  _onSizeMinus = () => {
    let { proposal } = this.props;
    let idx = sizeOptions.indexOf(proposal.rules.size);
    if (idx > 0) {
      idx--;
    }
    let size = sizeOptions[idx];
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, size }
    });
  };

  _onSizePlus = () => {
    let { proposal } = this.props;
    let idx = sizeOptions.indexOf(proposal.rules.size);
    if (idx < sizeOptions.length - 1) {
      idx++;
    }
    let size = sizeOptions[idx];
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, size }
    });
  };

  _onHandiMinus = () => {
    let { proposal } = this.props;
    let oldHandi = proposal.rules.handicap || 0;
    let handicap;
    if (oldHandi <= 2) {
      handicap = 0;
    } else {
      handicap = oldHandi - 1;
    }
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, handicap }
    });
  };

  _onHandiPlus = () => {
    let { proposal } = this.props;
    let oldHandi = proposal.rules.handicap || 0;
    let handicap;
    if (oldHandi <= 1) {
      handicap = 2;
    } else {
      handicap = oldHandi < 9 ? oldHandi + 1 : 9;
    }
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, handicap }
    });
  };

  _onKomiMinus = () => {
    let { proposal } = this.props;
    let oldKomi = proposal.rules.komi;
    let komi;
    if (oldKomi === 10.5) {
      komi = 7.5;
    } else if (oldKomi === 7.5) {
      komi = 6.5;
    } else if (oldKomi === 6.5) {
      komi = 0.5;
    } else if (oldKomi === 0.5) {
      komi = -5.5;
    } else {
      komi = oldKomi - 5;
    }
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, komi }
    });
  };

  _onKomiPlus = () => {
    let { proposal } = this.props;
    let oldKomi = proposal.rules.komi;
    let komi;
    if (oldKomi === -5.5) {
      komi = 0.5;
    } else if (oldKomi === 0.5) {
      komi = 6.5;
    } else if (oldKomi === 6.5) {
      komi = 7.5;
    } else if (oldKomi === 7.5) {
      komi = 10.5;
    } else {
      komi = oldKomi + 5;
    }
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, komi }
    });
  };

  _onMainTimeMinus = () => {
    let { proposal } = this.props;
    let oldMainTime = proposal.rules.mainTime || 0;
    let mainTime;
    if (oldMainTime === 5 * 60) {
      mainTime = 60;
    } else {
      mainTime = Math.max(0, oldMainTime - 5 * 60);
    }
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, mainTime }
    });
  };

  _onMainTimePlus = () => {
    let { proposal } = this.props;
    let oldMainTime = proposal.rules.mainTime || 0;
    let mainTime;
    if (oldMainTime === 0) {
      mainTime = 60;
    } else if (oldMainTime === 60) {
      mainTime = 5 * 60;
    } else {
      mainTime = oldMainTime + 5 * 60;
    }
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, mainTime }
    });
  };

  _onByoYomiMinus = () => {
    let { proposal } = this.props;
    let oldByoYomi = proposal.rules.byoYomiTime || 0;
    let byoYomiTime;
    if (oldByoYomi <= 20) {
      byoYomiTime = Math.max(5, oldByoYomi - 5);
    } else if (oldByoYomi <= 60) {
      byoYomiTime = Math.max(5, oldByoYomi - 10);
    } else {
      byoYomiTime = Math.max(5, oldByoYomi - 60);
    }
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, byoYomiTime }
    });
  };

  _onByoYomiPlus = () => {
    let { proposal } = this.props;
    let oldByoYomi = proposal.rules.byoYomiTime || 0;
    let byoYomiTime = 0;
    if (oldByoYomi >= 60) {
      byoYomiTime = oldByoYomi + 60;
    } else if (byoYomiTime >= 20) {
      byoYomiTime = oldByoYomi + 10;
    } else {
      byoYomiTime = oldByoYomi + 5;
    }
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, byoYomiTime }
    });
  };

  _onPeriodsMinus = () => {
    let { proposal } = this.props;
    let byoYomiPeriods = Math.max(1, (proposal.rules.byoYomiPeriods || 5) - 1);
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, byoYomiPeriods }
    });
  };

  _onPeriodsPlus = () => {
    let { proposal } = this.props;
    let byoYomiPeriods = Math.min(
      100,
      (proposal.rules.byoYomiPeriods || 5) + 1
    );
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, byoYomiPeriods }
    });
  };

  _onStonesMinus = () => {
    let { proposal } = this.props;
    let byoYomiStones = Math.max(5, (proposal.rules.byoYomiStones || 25) - 5);
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, byoYomiStones }
    });
  };

  _onStonesPlus = () => {
    let { proposal } = this.props;
    let byoYomiStones = Math.min(100, (proposal.rules.byoYomiStones || 25) + 5);
    this.props.onChangeProposal({
      ...proposal,
      rules: { ...proposal.rules, byoYomiStones }
    });
  };
}
