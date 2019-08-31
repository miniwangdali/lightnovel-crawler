import { Reducer } from "redux";
import uuidv4 from "uuid/v4";
import * as actionTypes from "./actionTypes";

export interface ImageStateEntity {
  id: string;
  src: string;
  selected: boolean;
}

const initialState = {
  list: [] as ImageStateEntity[],
  loading: false
};

const reducer: Reducer<typeof initialState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case actionTypes.SET_IMAGE_LIST: {
      const list: ImageStateEntity[] = action.imageUrls.map(url => ({
        id: uuidv4(),
        src: url,
        selected: true
      }));
      return { ...state, list };
    }
    case actionTypes.TOGGLE_IMAGE_SELECTION: {
      const newList = [...state.list];
      newList.find(i => i.id === action.id).selected = action.selected;
      return { ...state, list: newList };
    }
    default:
      return state;
  }
};

export default reducer;
