// @flow
import React, {PureComponent as Component} from 'react';
import {Modal, Button} from '../common';
import type {User} from '../../model';

export default class FeedbackModal extends Component<{
  currentUser: ?User,
  onClose: Function
}, {
  status: 'pending' | 'submitted' | 'done'
}> {
  state: {
    status: 'pending' | 'submitted' | 'done'
  } = {
    status: 'pending'
  };

  render() {
    let {onClose, currentUser} = this.props;
    let {status} = this.state;
    let content;
    if (status === 'done') {
      content = <p>Thanks!</p>;
    } else {
      content = (
        <div>
          <p>Send bug reports and other feedback to
            {' '}
            <a
              className='FeedbackModal-twitter'
              href='https://twitter.com/jkkramer'
              target='_blank'
              rel='noopener noreferrer'>
              @jkkramer
            </a>,
            {' '}
            <a
              className='FeedbackModal-twitter'
              href='mailto:jkkramer@gmail.com'
              target='_blank'
              rel='noopener noreferrer'>
              jkkramer@gmail.com
            </a>
            , or use this handy form:
          </p>

          <form
            className='FeedbackModal-form'
            method='post'
            action='https://jkk-micromailer.now.sh/send'
            target='mailer'
            onSubmit={this._onSubmit}>
            <input type='hidden' name='subject' value='Shin KGS Feedback' />
            <div className='FeedbackModal-from'>
              <input
                className='FeedbackModal-input'
                type='text'
                name='fromName'
                placeholder='Your Name'
                defaultValue={currentUser && currentUser.details ? currentUser.details.personalName : undefined} />
              <input
                className='FeedbackModal-input'
                type='email'
                name='replyTo'
                placeholder='Your Email'
                defaultValue={currentUser && currentUser.details ? currentUser.details.email : undefined} />
            </div>
            <textarea className='FeedbackModal-input' name='body' rows={3} placeholder='Your Feedback' />
            <div className='FeedbackModal-buttons'>
              <Button loading={status === 'submitted'} disabled={status === 'submitted'} type='submit'>Send Feedback</Button>
              {' '}
              <Button muted onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </div>
      );
    }
    return (
      <Modal title='Feedback' onClose={onClose}>
        <div className='FeedbackModal'>
          {content}
          <iframe
            title='Feedback'
            name='mailer'
            src='https://jkk-micromailer.now.sh/'
            style={{position: 'absolute', width: 0, height: 0, border: 0}} />
        </div>
      </Modal>
    );
  }

  _onSubmit = () => {
    this.setState({status: 'submitted'});
    setTimeout(() => {
      this.setState({status: 'done'});
    }, 1000);
  }
}
