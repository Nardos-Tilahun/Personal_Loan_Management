import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NotFoundImage from "../../assets/images/NotFound.png";
import { useAuth } from '../../Contexts/useHook';
function NotFound() {
    const { setOpenPage } = useAuth();
    useEffect(() => {
        setOpenPage('Error')
        }, [])
        return (
            <div className="flex flex-col items-center justify-center min-h-screen -mt-16 sm:-mt-24 md:-mt-48 z-50">
            <img
                src={NotFoundImage}
                alt="Page Not Found"
                className="mt-8 w-72 h-auto"
            />
            <div className="text-center">
                <h1 className="text-5xl font-bold text-gray-800 mb-6">Oops! Page Not Found</h1>
                <p className="text-lg text-gray-600 mb-8">
                    It seems like you've taken a wrong turn.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-300 ease-in-out"
                >
                    Go to Home Page
                </Link>
            </div>
        </div>
    );
}

export default NotFound;
