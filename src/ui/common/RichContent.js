// @flow
import React, { PureComponent as Component } from 'react';
import Autolinker from 'autolinker.js';
import { nl2br, escapeHtml } from '../../util/string';

type Props = {
  content: ?string,
  firstLineHeading?: ?boolean
};

export class RichContent extends Component<Props> {
  render() {
    let { content, firstLineHeading } = this.props;
    if (!content || !content.trim()) {
      return null;
    }
    let opts = {
      newWindow: true,
      stripPrefix: false,
      truncate: null,
      className: 'RichContent-link',
      urls: true,
      email: true,
      twitter: false
    };
    let html = nl2br(Autolinker.link(escapeHtml(content), opts));
    if (firstLineHeading) {
      html = html.replace(
        /(.+?)<br>/,
        '<div class="RichContent-heading">$1</div>'
      );
    }
    return (
      <div className='RichContent' dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
}
