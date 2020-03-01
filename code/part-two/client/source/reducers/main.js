import { combineReducers } from "redux";

const placeholder = (state = {}, action) => {
  return state;
};

const rootReducer = combineReducers({
  placeholder: placeholder
});

export default rootReducer;
