import { connect } from "react-redux";
import App from "../components/App.jsx";

const mapStateToProps = (state, ownProps) => ({
  privateKey: state.privateKey
});

const AppContainer = connect(mapStateToProps)(App);

export default AppContainer;
