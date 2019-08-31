import React from "react";
import classnames from "classnames";

interface ImageViewState {
  open: boolean;
}

interface ImageViewProps {
  className?: string;
  src: string;
  [x: string]: any;
}

const name = "ImageView";

class ImageView extends React.PureComponent<ImageViewProps, ImageViewState> {
  private imageRef = React.createRef<HTMLImageElement>();
  private isMouseDown = false;
  private originalMousePos = {
    top: 0,
    left: 0
  };
  private originalImagePos = {
    top: 0,
    left: 0
  };
  private originalDivPosition = {
    top: "",
    left: "",
    width: "",
    height: ""
  };
  private imageScale = 1;

  constructor(props: ImageViewProps) {
    super(props);
    this.state = {
      open: false
    };
  }

  private openView: React.MouseEventHandler<HTMLDivElement> = e => {
    const target = e.currentTarget;
    const { left, top, width, height } = target.getBoundingClientRect();
    this.originalDivPosition = {
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px"
    };
    target.style.left = left + "px";
    target.style.top = top + "px";
    target.style.width = width + "px";
    target.style.height = height + "px";
    this.setUpImageOperations();
    this.setState({ open: true }, () => {
      setTimeout(() => {
        target.style.left = "0px";
        target.style.top = "0px";
        target.style.width = "100%";
        target.style.height = "100%";
      }, 250);
    });
  };

  private closeView = () => {
    this.removeImageOperations();
    this.resetImage().then(() => {
      this.setState({ open: false });
    });
  };

  private outboundClick: React.MouseEventHandler<HTMLDivElement> = e => {
    if (e.target !== this.imageRef.current) {
      this.closeView();
    }
  };

  private setUpImageOperations = () => {
    this.imageRef.current.addEventListener(
      "mousemove",
      this.imageMouseMoveListener
    );
    this.imageRef.current.addEventListener(
      "mousedown",
      this.imageMouseDownListener
    );
    this.imageRef.current.addEventListener(
      "mouseup",
      this.imageMouseUpListener
    );
    this.imageRef.current.addEventListener(
      "mouseleave",
      this.imageMouseUpListener
    );
    this.imageRef.current.addEventListener("wheel", this.imageZoomListener);
  };

  private removeImageOperations = () => {
    this.imageRef.current.removeEventListener(
      "mousemove",
      this.imageMouseMoveListener
    );
    this.imageRef.current.removeEventListener(
      "mousedown",
      this.imageMouseDownListener
    );
    this.imageRef.current.removeEventListener(
      "mouseup",
      this.imageMouseUpListener
    );
    this.imageRef.current.removeEventListener(
      "mouseleave",
      this.imageMouseUpListener
    );
    this.imageRef.current.removeEventListener("wheel", this.imageZoomListener);
  };

  private imageMouseMoveListener: EventListenerOrEventListenerObject = (
    e: MouseEvent
  ) => {
    if (this.isMouseDown) {
      const target = e.target as HTMLImageElement;
      const deltaLeft = e.screenX - this.originalMousePos.left;
      const deltaTop = e.screenY - this.originalMousePos.top;
      target.style.left = this.originalImagePos.left + deltaLeft + "px";
      target.style.top = this.originalImagePos.top + deltaTop + "px";
    }
  };

  private imageMouseDownListener: EventListenerOrEventListenerObject = (
    e: MouseEvent
  ) => {
    if (e.button === 0) {
      const target = e.target as HTMLImageElement;
      this.originalMousePos = {
        top: e.screenY,
        left: e.screenX
      };
      const { top, left } = getComputedStyle(target);
      this.originalImagePos = { top: parseFloat(top), left: parseFloat(left) };
      this.isMouseDown = true;
    }
  };

  private imageMouseUpListener: EventListenerOrEventListenerObject = (
    e: MouseEvent
  ) => {
    this.isMouseDown = false;
  };

  private imageZoomListener: EventListenerOrEventListenerObject = (
    e: WheelEvent
  ) => {
    e.preventDefault();
    const target = e.target as HTMLImageElement;

    this.imageScale += e.deltaY * -0.002 * this.imageScale;
    this.imageScale = Math.min(Math.max(1, this.imageScale), 4);
    target.style.transform = `scale(${this.imageScale})`;
    target.style.webkitTransform = `scale(${this.imageScale})`;
  };

  private resetImage = () => {
    const image = this.imageRef.current;
    const parent = image.parentElement;
    this.imageScale = 1;
    image.style.left = "0px";
    image.style.top = "0px";
    image.style.transform = `scale(${this.imageScale})`;
    image.style.webkitTransform = `scale(${this.imageScale})`;
    parent.style.top = this.originalDivPosition.top;
    parent.style.left = this.originalDivPosition.left;
    parent.style.width = this.originalDivPosition.width;
    parent.style.height = this.originalDivPosition.height;
    return new Promise(resolve => {
      setTimeout(() => {
        parent.style.left = "";
        parent.style.top = "";
        parent.style.width = "";
        parent.style.height = "";
        resolve();
      }, 250);
    });
  };

  public render() {
    const { className, src, ...rest } = this.props;
    const { open } = this.state;
    return (
      <div
        className={classnames(name, className, { open })}
        onClick={open ? this.outboundClick : this.openView}
      >
        <img
          ref={this.imageRef}
          className={`${name}__image`}
          src={src}
          draggable={false}
          {...rest}
        />
      </div>
    );
  }
}

export default ImageView;
