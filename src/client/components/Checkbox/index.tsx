import React from "react";
import classnames from "classnames";

export interface ICheckboxProps {
  className?: string;
  checked?: boolean;
  [x: string]: any;
}

const name = "Checkbox";

const Checkbox = (props: ICheckboxProps) => {
  const { className, checked, ...rest } = props;
  return (
    <label className={classnames("Checkbox", className)}>
      <input type="checkbox" checked={checked} {...rest} />
      <span className={classnames("box", { checked })} />
    </label>
  );
};

Checkbox.defaultProps = {
  checked: false
};

export default Checkbox;
