import * as actionTypes from "./actionTypes";
import { MessageType, Message } from "./factory";

export const addMessage = (message: Partial<MessageType>) => dispatch => {
  const newMessage = Message(message);
  if (newMessage.timeout > 0) {
    setTimeout(() => {
      dispatch(removeMessage(newMessage));
    }, newMessage.timeout);
  }
  dispatch({
    type: actionTypes.ADD_MESSAGE,
    message: newMessage
  });
};

export const removeMessage = (message: MessageType) => ({
  type: actionTypes.REMOVE_MESSAGE,
  message
});
