import React, { useState } from 'react';
import { useAuth } from '../../../../Contexts/useHook';
function ProfilePictureUpload({ formData, setFormData, formErrors }) {
    const { openPage } = useAuth();
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFormData({ ...formData, userImage: file });

        }
    };

    let error;
    if (formData?.userImage) {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(formData.userImage?.type)) {
            error = 'Only JPEG and PNG images are allowed';
        } else {
            const maxSizeInBytes = 500 * 1024;
            if (formData.userImage.size > maxSizeInBytes) {
                error = 'Image size exceeds 500KB limit';
            }
        }
    }

    const clearImage = () => {
        setFormData({ ...formData, userImage: null });
    };

    return (
        <div className={`border p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${openPage == "AddUserForm" ? 'w-full md:w-1/2' : 'w-full'} ${formErrors.userImage ? ' border-red-400 italic text-sm text-red-300' : ' '}`}>
            <label htmlFor="userImage" className="cursor-pointer" >
                <input
                    id="userImage"
                    name="profilePicture"
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/jpeg, image/png"
                    placeholder='only Jpeg, png'
                />
                <div className="flex items-center space-x-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 text-gray-400 ${formErrors.userImage ? 'text-red-400' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    {!formData?.userImage ? <span className="text-gray-500">Upload Profile Picture</span> : formData?.userImage.size <= 500 * 1024 ? (
                        <div className='flex'>
                            <img
                                src={URL.createObjectURL(formData.userImage)}
                                alt="User Profile"
                                className="mx-auto w-10 h-10 rounded-full"
                            />
                            <button onClick={clearImage} className="text-gray-500 px-2 italic">Clear</button>
                            <span className="pt-2 pl-4 text-gray-500 italic"> Picture Uploaded</span>
                        </div>
                    ) : <span className="text-red-400 italic text-sm">{error}</span>}
                </div>
            </label >
        </div >
    );
}

export default ProfilePictureUpload;
