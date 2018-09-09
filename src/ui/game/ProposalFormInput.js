// @flow
import React, {PureComponent as Component} from 'react';
import {A} from '../common';

type Props = {
  value: string | number,
  label: string,
  readonly?: boolean,
  hilited?: boolean,
  onMinus: Function,
  onPlus: Function
};

export default class ProposalFormInput extends Component<Props> {
  render() {
    let {value, label, readonly, hilited} = this.props;
    let className = 'ProposalForm-input' + (
      (readonly ? ' ProposalForm-input-readonly' : '') +
      (hilited ? ' ProposalForm-input-hilite' : '')
    );
    return (
      <div className={className}>
        <div className='ProposalForm-input-value'>
          {value}
          {' '}
          <div className='ProposalForm-input-value-label'>{label}</div>
        </div>
        <div className='ProposalForm-input-plusminus'>
          <A button className='ProposalForm-input-minus' onClick={this._onMinus}>
            –
          </A>
          <A button className='ProposalForm-input-plus' onClick={this._onPlus}>
            +
          </A>
        </div>
      </div>
    );
  }

  _onMinus = () => {
    if (!this.props.readonly) {
      this.props.onMinus();
    }
  }

  _onPlus = () => {
    if (!this.props.readonly) {
      this.props.onPlus();
    }
  }
}