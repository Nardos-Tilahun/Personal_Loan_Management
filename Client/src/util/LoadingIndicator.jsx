import React from 'react';
import loadingGIF from "../assets/GIF/loadGIF.gif";

function LoadingIndicator() {
    return (
        <div className={`relative flex flex-row items-center h-screen justify-center z-50 -mt-24 `}>
            <img
                src={loadingGIF}
                alt="Loading"
                className="relative w-6 h-6"
            />
            <span className="ml-2">{`Loading...`}</span>
        </div>
    );
}

export default LoadingIndicator;
