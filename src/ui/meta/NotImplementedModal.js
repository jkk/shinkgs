// @flow
import React, {PureComponent as Component} from 'react';
import {Modal} from '../common';

export default class NotImplementedModal extends Component {

  props: {
    onClose: Function
  };

  render() {
    let {onClose} = this.props;
    return (
      <Modal onClose={onClose}>
        <div className='NotImplementedModal'>
          <div className='NotImplementedModal-title'>
            Not Implemented Yet
          </div>
          <div className='NotImplementedModal-desc'>
            <p>Want to help? Shin KGS is open source:</p>
            <p>
              <a
                href='https://github.com/jkk/shinkgs'
                target='_blank'
                rel='noopener'>
                https://github.com/jkk/shinkgs
              </a>
            </p>
          </div>
        </div>
      </Modal>
    );
  }
}
