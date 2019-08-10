import { Reducer } from "redux";
import * as actionTypes from "./actionTypes";
import { MessageType } from "./factory";

const initialState = {
  list: [] as MessageType[]
};

const reducer: Reducer<typeof initialState> = (
  state: typeof initialState = initialState,
  action
) => {
  switch (action.type) {
    case actionTypes.ADD_MESSAGE: {
      return { ...state, list: [...state.list, action.message] };
    }
    case actionTypes.REMOVE_MESSAGE: {
      const targetIndex = state.list.findIndex(m => m.id === action.message.id);
      state.list.splice(targetIndex, 1);
      return { ...state, list: [...state.list] };
    }
    default:
      return state;
  }
};

export default reducer;
