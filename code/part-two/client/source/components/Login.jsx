import React from "react";
import $ from "jquery";

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
      <button
        class="submit key"
        type="button"
        onClick={() => {
          props.usePrivateKey($("#private-key").val());
        }}
      >
        See my collection!
      </button>
      <h2>OR</h2>
      <button class="create new key" type="button" onClick={props.generateKey}>
        Create new collection!
      </button>
    </div>
  );
};

export default Login;
