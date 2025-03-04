import { Navigate, redirect } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { toast } from "react-toastify";
import Loading from "../loading/loading";

const PrivateRoute = ({ children }) => {
  const [state] = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  console.log("from private route: " , state.token);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!state.token) {
      setLoading(false);
   
      const time = setTimeout(() => {
        toast.warning("You need to log in to access this page.");
        setRedirect(true);
      }, 3000);
      return () => clearTimeout(time);
    }
    setLoading(false);
  }, [state.token]);

  if (redirect) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <Loading />;
  }

  return children;
};

export default PrivateRoute;
