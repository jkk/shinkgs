// @flow
import React, {PureComponent as Component} from 'react';
import {Modal, Button} from '../common';

export default class UnderConstructionModal extends Component {

  props: {
    onClose: Function
  };

  render() {
    let {onClose} = this.props;
    return (
      <Modal onClose={onClose}>
        <div className='UnderConstructionModal'>
          <div className='UnderConstructionModal-title'>
            Under Construction
          </div>
          <div className='UnderConstructionModal-desc'>
            <p>
              Shin KGS is still in beta.
              {' '}
              Send your feedback to <a href='https://twitter.com/jkkramer' target='_blank' rel='noopener'>@jkkramer</a>.
              {' '}
              To track progress or contribute, see the <a href='https://github.com/jkk/shinkgs' target='_blank' rel='noopener'>GitHub project</a>.
            </p>
            <Button primary onClick={onClose}>Got It</Button>
          </div>
        </div>
      </Modal>
    );
  }
}
