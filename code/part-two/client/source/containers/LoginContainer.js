import Login from "../components/Login.jsx";
import { connect } from "react-redux";
import { usePrivateKey, generateKey } from "../actions.js";

const mapDispatchToProps = (dispatch, ownProps) => ({
  usePrivateKey: pk => {
    dispatch(usePrivateKey(pk));
  },
  generateKey: pk => {
    dispatch(generateKey(pk));
  }
});

const LoginContainer = connect(null, mapDispatchToProps)(Login);

export default LoginContainer;
