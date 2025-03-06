import { useLocation, useParams } from "react-router-dom";
import User from '../user-registration/user.jsx'

const UserWrapper = () => {
    const { isUpdate } = useParams(); // Extract dynamic parameter
    const isUpdateBool = isUpdate === "true"; 
    const location = useLocation();
    const userData = location.state?.userData; // Access passed dat
   
    console.log("from wrapper user data: ",userData)
  
    return (
      <User
        isUpdate={isUpdateBool}
        initialData={userData}
      />
    );
  };

  export default UserWrapper;