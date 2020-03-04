import { combineReducers } from "redux";
import privateKey from "./privateKey.js";

const rootReducer = combineReducers({
  privateKey: privateKey
});

export default rootReducer;
