import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import messagesReducer from "./messages/reducers";
import imagesReducer from "./images/reducers";

export const reducers = combineReducers({
  messages: messagesReducer,
  images: imagesReducer
});

const store = createStore(reducers, applyMiddleware(thunk));

export default store;
