import React from "react";
import classnames from "classnames";
import Message from "../../components/Message";
import { connect, MapStateToProps, MapDispatchToProps } from "react-redux";
import { bindActionCreators } from "redux";
import * as messagesAction from "../../store/messages/actions";
import { MessageType } from "../../store/messages/factory";

const name = "Messages";

interface MessagesProps {
  messagesList?: MessageType[];
  addMessage?: typeof messagesAction.addMessage;
  removeMessage?: typeof messagesAction.removeMessage;
}

class Messages extends React.PureComponent<MessagesProps, any> {
  public removeMessage = (m: MessageType) => {
    this.props.removeMessage(m);
  };

  render() {
    return (
      <section
        className={classnames(name, {
          show: this.props.messagesList.length > 0
        })}
      >
        <div className={`${name}__container`}>
          {this.props.messagesList.map(m => (
            <Message
              key={`message-${m.id}-${m.title}`}
              {...m}
              onDismiss={this.removeMessage.bind(this, m)}
            />
          ))}
        </div>
      </section>
    );
  }
}

const mapStateToProps: MapStateToProps<any, MessagesProps, any> = state => ({
  messagesList: state.messages.list
});

const mapDispatchToProps: MapDispatchToProps<
  any,
  MessagesProps
> = dispatch => ({
  ...bindActionCreators(messagesAction, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Messages);
