import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const PrivateRoute = ({ children }) => {
  const [state] = useContext(AuthContext);
  console.log(state);
  if (!state.token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
