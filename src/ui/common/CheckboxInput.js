// @flow
import React, { PureComponent as Component } from "react";

type Props = {
  label: any,
  checked: boolean,
};

export class CheckboxInput extends Component<Props> {
  render() {
    let { label, checked, ...inputProps } = this.props;
    let className =
      "CheckboxInput " +
      (checked ? "CheckboxInput-checked" : "CheckboxInput-unchecked");
    return (
      <div className={className}>
        <label>
          <div className="CheckboxInput-control">
            <input type="checkbox" checked={checked} {...inputProps} />
          </div>
          {label ? <div className="CheckboxInput-label">{label}</div> : null}
        </label>
      </div>
    );
  }
}
