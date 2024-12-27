import React from 'react';
import PropTypes from 'prop-types';
import 'tailwindcss/tailwind.css';

function ConfirmationPanel({ message, onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mt-[-5%] mx-4 sm:mx-auto animate-dialogScale">
                <p
                    className="text-lg font-semibold mb-4 text-center"
                    dangerouslySetInnerHTML={{ __html: message }}
                ></p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onConfirm}
                        className={`bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Confirm'}
                    </button>
                    <button
                        onClick={onCancel}
                        className="bg-red-500 text-white rounded-md px-4 py-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

ConfirmationPanel.propTypes = {
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

ConfirmationPanel.defaultProps = {
    loading: false,
};

export default ConfirmationPanel;
