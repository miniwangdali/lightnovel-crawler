import React from "react";
import classnames from "classnames";

export interface IButtonProps {
  className?: string;
  children?: React.ReactNode;
  [x: string]: any;
}

const name = "Button";

const Button = (props: IButtonProps) => {
  const { className, children, ...rest } = props;
  return (
    <button className={classnames(name, className)} {...rest}>
      {children}
    </button>
  );
};

export default Button;
