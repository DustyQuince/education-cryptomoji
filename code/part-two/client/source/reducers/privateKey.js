import Redux from "redux";

const privateKey = (state = null, action) => {
  switch (action.type) {
    case "USE_PRIVATE_KEY":
      return action.privateKey;
    default:
      return state;
  }
};

export default privateKey;
