import { combineReducers } from "redux";
import { privateKey } from "./privateKey.js";

const placeholder = (state = {}, action) => {
  return state;
};

const rootReducer = combineReducers({
  privateKey: privateKey
});

export default rootReducer;
