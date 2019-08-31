import * as actionTypes from "./actionTypes";

export const setImageList = (imageUrls: string[]) => ({
  type: actionTypes.SET_IMAGE_LIST,
  imageUrls
});

export const toggleImageSelection = (id: string, selected: boolean) => ({
  type: actionTypes.TOGGLE_IMAGE_SELECTION,
  id,
  selected
});
