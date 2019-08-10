import React, { MouseEventHandler, FocusEventHandler } from "react";
import classnames from "classnames";

interface TextInputProps {
  className?: string;
  id: string;
  label?: React.ReactNode;
  hasSubmit?: boolean;
  submitText?: React.ReactNode;
  onSubmit?: MouseEventHandler<HTMLButtonElement>;
  [x: string]: any;
}

interface TextInputState {
  active: boolean;
}

const name = "TextInput";

class TextInput extends React.PureComponent<TextInputProps, TextInputState> {
  constructor(props: TextInputProps) {
    super(props);
    this.state = {
      active: false
    };
  }

  private onInputFocus: FocusEventHandler<HTMLInputElement> = e => {
    this.setState({ active: true });
    if (typeof this.props.onFocus === "function") {
      this.props.onFocus();
    }
  };

  private onInputBlur: FocusEventHandler<HTMLInputElement> = e => {
    this.setState({ active: false });
    if (typeof this.props.onBlur === "function") {
      this.props.onBlur();
    }
  };

  render() {
    const {
      className,
      id,
      label,
      hasSubmit,
      submitText,
      onSubmit,
      ...rest
    } = this.props;
    const { active } = this.state;
    return (
      <div className={classnames(name, { active }, className)}>
        {label && (
          <React.Fragment>
            <label className={`${name}__label`}>{label}</label>
            <span className={`${name}__divider`} />
          </React.Fragment>
        )}
        <input
          className={`${name}__input--main`}
          {...rest}
          onFocus={this.onInputFocus}
          onBlur={this.onInputBlur}
        />
        {hasSubmit && (
          <button className={`${name}__button--submit`} onClick={onSubmit}>
            {submitText}
          </button>
        )}
      </div>
    );
  }
}

export default TextInput;
