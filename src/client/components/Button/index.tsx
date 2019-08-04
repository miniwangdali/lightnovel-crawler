import React from "react";
import classnames from "classnames";

export interface IButtonProps {
  className?: string;
  children?: React.ReactNode;
  [x: string]: any;
}

const Button = (props: IButtonProps) => {
  const { className, children, ...rest } = props;
  return (
    <button className={classnames("Button", className)} {...rest}>
      {children}
    </button>
  );
};

export default Button;
