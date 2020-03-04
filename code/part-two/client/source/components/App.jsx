import React from "react";
import LoggedInAppContainer from "../containers/LoggedInAppContainer.js";
import LoginContainer from "../containers/LoginContainer.js";

const App = props => {
  // if user has defined a private key, treat them as logged in

  let isLoggedIn;
  if (props.privateKey === null) {
    isLoggedIn = false;
  } else {
    isLoggedIn = true;
  }

  if (isLoggedIn) {
    return <LoggedInAppContainer />;
  } else {
    return <LoginContainer />;
  }
};

export default App;
