import Login from "../components/Login.jsx";
import { connect } from "react-redux";
import { usePrivateKey, generateKey } from "../actions.js";

const mapDispatchToProps = dispatch => ({
  usePrivateKey: pk => {
    dispatch(usePrivateKey(pk));
  },
  generateKey: () => {
    dispatch(generateKey());
  }
});

const LoginContainer = connect(null, mapDispatchToProps)(Login);

export default LoginContainer;
