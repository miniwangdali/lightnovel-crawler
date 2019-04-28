import React from 'react';
import classnames from 'classnames';
import { ISkeletonProps } from './props';

class Skeleton extends React.Component<ISkeletonProps, any> {
  render() {
    const {
      active,
      className,
      delay,
      ...rest
    } = this.props;
    return <div className={classnames('Skeleton__container', className, { active })} {...rest}>
      <div className="Skeleton__moving-block" style={{ WebkitAnimationDelay: `${delay}ms`, animationDelay: `${delay}ms` }}></div>
    </div>;
  }
}

export default Skeleton;