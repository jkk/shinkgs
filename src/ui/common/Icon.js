// @flow
import React, {PureComponent as Component} from 'react';

export class Icon extends Component<{
  name: string
}> {
  render() {
    let {name} = this.props;
    return <i className={('Icon fa fa-' + name)} />;
  }
}
