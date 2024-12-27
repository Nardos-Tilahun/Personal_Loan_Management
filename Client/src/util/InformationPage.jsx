import React from 'react';
import PropTypes from 'prop-types';
import 'tailwindcss/tailwind.css';

function InfoDialog({ message, onClose, type }) {
    const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';
    const messageColor = type === 'success' ? 'text-gray-800' : 'text-red-300';
    const buttonClass = type === 'success' ? 'bg-green-500 hover:bg-green-300' : 'bg-red-500 hover:bg-red-600';

    const formattedMessage = message.replace(/\n/g, '<br />');

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 sm:mx-auto animate-foldIn">
                <div className="flex items-center mb-4">
                    <svg className={`w-10 h-10 ${iconColor} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20h.01M20 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z"></path>
                    </svg>
                    <p className={`text-lg text-center font-semibold ${messageColor}`} dangerouslySetInnerHTML={{ __html: formattedMessage }}></p>
                </div>
                <div className="flex justify-center">
                    <button onClick={onClose} className={`${buttonClass} text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-200`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

InfoDialog.propTypes = {
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['success', 'error']).isRequired,
};

export default InfoDialog;
