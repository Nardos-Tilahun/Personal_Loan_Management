import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import unauthorizedImage from "../../assets/images/SessionExpired.png"
import { useAuth } from '../../Contexts/useHook';
function Unauthorized() {
  const { setOpenPage } = useAuth();

  useEffect(() => {
    setOpenPage('Error')
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-24 bg-gray-100">
      <div className="text-center">
        <img
          src={unauthorizedImage}
          alt="Unauthorized Access"
          className="mt-8 w-72 h-auto"
        />
        <h1 className="text-5xl font-bold text-gray-800 mb-6">Expired Session</h1>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, you have to login to access this page.
        </p>
        <Link
          to="/login"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-300 ease-in-out"
        >
          Login with credential
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
