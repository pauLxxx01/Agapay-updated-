import React from "react";
import { useLocation, useParams } from "react-router-dom";
import Responder from "../responder-registration/responder-register";

const ResponderWrapper = () => {
  const { isUpdate } = useParams(); // Extract dynamic parameter
  const isUpdateBool = isUpdate === "true"; 
  const location = useLocation();
  const userData = location.state?.userData; // Access passed dat
 
  console.log("from wrapper user data: ",userData)

  return (
    <Responder
      isUpdate={isUpdateBool}
      initialData={userData}
    />
  );
};

export default ResponderWrapper;
