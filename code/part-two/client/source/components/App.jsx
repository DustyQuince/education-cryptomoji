import React from "react";
import LoggedInApp from "./LoggedInApp.jsx";
import LoginContainer from "../containers/LoginContainer.js";

const App = props => {
  // if user has defined a private key, treat them as logged in

  let isLoggedIn;
  const user_priv_key = window.sessionStorage.getItem("user_priv_key");

  if (user_priv_key === null) {
    isLoggedIn = false;
  } else {
    isLoggedIn = true;
  }

  if (isLoggedIn) {
    return <LoggedInApp user_priv_key={user_priv_key} />;
  } else {
    return <LoginContainer />;
  }
};

export default App;
