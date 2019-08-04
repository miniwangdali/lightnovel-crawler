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

class TextInput extends React.PureComponent<TextInputProps, TextInputState> {
  constructor(props: TextInputProps) {
    super(props);
    this.state = {
      active: false
    };
  }

  onInputFocus: FocusEventHandler<HTMLInputElement> = e => {
    this.setState({ active: true });
    if (typeof this.props.onFocus === "function") {
      this.props.onFocus();
    }
  };

  onInputBlur: FocusEventHandler<HTMLInputElement> = e => {
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
      <div className={classnames("TextInput", { active }, className)}>
        {label && (
          <React.Fragment>
            <label className="TextInput__label">{label}</label>
            <span className="TextInput__divider" />
          </React.Fragment>
        )}
        <input
          className="TextInput__input--main"
          {...rest}
          onFocus={this.onInputFocus}
          onBlur={this.onInputBlur}
        />
        {hasSubmit && (
          <button className="TextInput__button--submit" onClick={onSubmit}>
            {submitText}
          </button>
        )}
      </div>
    );
  }
}

export default TextInput;
