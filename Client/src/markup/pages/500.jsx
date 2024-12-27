import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import serverErrorImage from "../../assets/images/500Error.png";
import { useAuth } from '../../Contexts/useHook';

function ServerError() {
    const { setOpenPage } = useAuth();

    useEffect(() => {
        setOpenPage('Error')
    }, [])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen -mt-16 sm:-mt-24 md:-mt-48 z-50">
            <img
                src={serverErrorImage}
                alt="Server Error"
                className="mt-8 w-72 h-auto"
            />
            <div className="text-center">
                <h1 className="text-5xl font-bold text-gray-800 mb-6">500 - Server Error</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Oops! Something went wrong on our end. Please try again later.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition duration-300 ease-in-out"
                >
                    Go to Home Page
                </Link>
            </div>
        </div>
    );
}

export default ServerError;
