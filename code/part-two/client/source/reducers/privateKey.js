import Redux from "redux";

const privateKey = (
  state = window.sessionStorage.getItem("user_priv_key"),
  action
) => {
  switch (action.type) {
    case "USE_PRIVATE_KEY":
      return action.privateKey;
    default:
      return state;
  }
};

export default privateKey;
