import React from "react";

const LoggedInApp = props => (
  <div>
    <h1>Your Collection:</h1>
    <button class="logout" type="button" onClick={props.deleteKey}>
      Logout
    </button>
  </div>
);

export default LoggedInApp;
