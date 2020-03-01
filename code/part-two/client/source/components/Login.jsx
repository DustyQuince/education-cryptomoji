import React from "react";

const Login = props => {
  return (
    <div>
      <h1>Welcome to Cryptomoji!</h1>
      {/*TODO:CSS for vald/invalid*/}
      <input
        type="text"
        id="private-key"
        name="private-key"
        placeholder="Your collection private key here"
        required
        minlength="64"
        maxlength="64"
      />
    </div>
  );
};

export default Login;
