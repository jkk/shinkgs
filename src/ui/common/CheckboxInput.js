// @flow
import React, { PureComponent as Component } from "react";

type Props = {
  label: any,
  checked: boolean,
  onChange: () => void,
  value?: string,
  name?: string,
};

export class CheckboxInput extends Component<Props> {
  render() {
    let { label, checked, onChange, value, name } = this.props;
    let className =
      "CheckboxInput " +
      (checked ? "CheckboxInput-checked" : "CheckboxInput-unchecked");
    return (
      <div className={className}>
        <label>
          <div className="CheckboxInput-control">
            <input
              type="checkbox"
              checked={checked}
              onChange={onChange}
              value={value}
              name={name}
            />
          </div>
          {label ? <div className="CheckboxInput-label">{label}</div> : null}
        </label>
      </div>
    );
  }
}
