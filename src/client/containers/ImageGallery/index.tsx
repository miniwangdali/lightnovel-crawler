import React from "react";
import Button from "../../components/Button";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { MapStateToProps, connect, MapDispatchToProps } from "react-redux";
import { ImageStateEntity } from "../../store/images/reducers";
import strings from "../../strings";
import { bindActionCreators } from "redux";
import { toggleImageSelection } from "../../store/images/actions";
import Checkbox from "../../components/Checkbox";
import ImageView from "../../components/ImageView";

interface ImageGalleryProps {
  images: ImageStateEntity[];
  toggleImageSelection: (id: string, selected: boolean) => any;
}

interface ImageGalleryState {}

const name = "ImageGallery";

class ImageGallery extends React.PureComponent<
  ImageGalleryProps,
  ImageGalleryState
> {
  constructor(props: ImageGalleryProps) {
    super(props);
  }

  render() {
    const { images, toggleImageSelection } = this.props;
    return (
      <div className={`${name}`}>
        <section className={`${name}__container`}>
          <div className={`${name}__action-bar`}>
            <span className="description-item">
              {strings.ImageGallery.total}&nbsp;
              {images.length}&nbsp;
              {strings.ImageGallery.picNum}
            </span>
          </div>
          <ul className={`${name}__list--images`}>
            {images.map(i => (
              <li
                key={i.id}
                className={classnames("list-item--image-item")}
                // onClick={() => toggleImageSelection(i.id, !i.selected)}
              >
                <ImageView
                  id={i.id}
                  className={classnames("image-item")}
                  src={i.src}
                />
              </li>
            ))}
          </ul>
          <Link className={`${name}__button--close`} to="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path fill="none" d="M0 0h24v24H0V0z" />
              <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
            </svg>
          </Link>
        </section>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<
  any,
  ImageGalleryProps,
  any
> = state => ({
  images: state.images.list
});

const mapDispatchToProps = dispatch => ({
  toggleImageSelection: bindActionCreators(toggleImageSelection, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageGallery);
