import { connect } from "react-redux";
import LoggedInApp from "../components/LoggedInApp.jsx";
import { deleteKey } from "../actions.js";

const mapStateToProps = state => ({
  privateKey: state.privateKey
});

const mapDispatchToProps = dispatch => ({
  deleteKey: () => dispatch(deleteKey())
});

const LoggedInAppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoggedInApp);

export default LoggedInAppContainer;
