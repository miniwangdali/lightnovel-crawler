import React from "react";
import classnames from "classnames";

interface LoadingProps {
  active: boolean;
  children?: React.ReactNode;
  className?: string;
  [x: string]: any;
}

const name = "Loading";

const Loading = (props: LoadingProps) => {
  const { active, children, className, ...rest } = props;
  return (
    <div className={classnames(name, { active }, className)} {...rest}>
      <div className={`${name}__overlay`} />
      <div className={`${name}__loading-spinner`} />
      {children}
    </div>
  );
};

export default Loading;
