import React from "react";
import classnames from "classnames";

interface LoadingProps {
  active: boolean;
  children?: React.ReactNode;
  className?: string;
  [x: string]: any;
}

const Loading = (props: LoadingProps) => {
  const { active, children, className, ...rest } = props;
  return (
    <div className={classnames("Loading", { active }, className)} {...rest}>
      <div className="Loading__overlay" />
      <div className="Loading__loading-spinner" />
      {children}
    </div>
  );
};

export default Loading;
