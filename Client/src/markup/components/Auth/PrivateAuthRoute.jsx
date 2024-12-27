import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import getAuth from '../../../util/auth';

const PrivateAuthRoute = ({ roles, children }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedInUser = await getAuth();

      if (loggedInUser.token) {
        setIsLogged(true);
        if (roles && roles.length > 0 && roles.includes(loggedInUser.userRoleId)) {
          setIsAuthorized(true);
        }
      }
      setIsChecked(true);
    };

    checkAuth();
  }, [roles]);

  if (!isChecked) {
    return null;
  }

  if (!isLogged) {
    return <Navigate to="/401" />;
  }

  if (!isAuthorized) {
    return <Navigate to="/401" />;
  }

  return children;
};


export default PrivateAuthRoute;