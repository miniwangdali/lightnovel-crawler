import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import messagesReducer from "./messages/reducers";

export const reducers = combineReducers({
  messages: messagesReducer
});

const store = createStore(reducers, applyMiddleware(thunk));

export default store;
