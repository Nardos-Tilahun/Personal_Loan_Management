import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../../Contexts/useHook';



function CustomerInfo({ data, setConfirm, loading }) {
    const { user } = useAuth();
    const fullName = `${data?.firstName} ${data?.lastName}`;
    const secondPhoneNumber = data?.secondPhoneNumber;
    const addressLine1 = data?.StreetAddress || "";
    const city = data?.City || "";
    const state = data?.State || "";
    const zipCode = data?.ZipCode || "";
    const country = data?.Country || "";
    const verify = data?.verify;
    let formattedAddress = "";

    if (addressLine1) {
        formattedAddress += addressLine1;
    }
    if (city) {
        formattedAddress += `${formattedAddress ? ', ' : ''}${city}`;
    }
    if (state) {
        formattedAddress += `${formattedAddress ? ', ' : ''}${state}`;
    }
    if (zipCode) {
        formattedAddress += `${formattedAddress ? ', ' : ''}${zipCode}`;
    }
    if (country) {
        formattedAddress += `${formattedAddress ? ', ' : ''}${country}`;
    }


    return (
        <div className="min-w-72 px-8 mx-8 ml-6 mt-60 sm:mt-36 md:my-10 bg-white rounded-3xl shadow-lg min-h-64 pb-2">
            <div className="title text-xl border-b-2 font-semibold py-2">Information</div>
            <div className="flex flex-col mt-4 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-[1fr,4fr] my-2">
                    <p className="text-sm py-1">Full Name</p>
                    <p className="text-sm md:w-84 bg-gray_light px-3 py-1 rounded-lg">{fullName}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,4fr] my-2">
                    <p className="text-sm py-1">Email</p>
                    <div className="flex items-center text-sm md:w-84 bg-gray_light px-3 py-1 rounded-lg">
                        <span>{data?.email}</span>
                        {user?.userRoleId == 1 && <span className="ml-2">
                            {verify === "Verified" ? (
                                <>
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" title="Verified" />
                                    <button
                                        className="ml-2 text-xs text-red-500 underline"
                                        onClick={() => setConfirm(verify)}
                                    >
                                        {loading ? "Loading..." : "Don't notify"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" title="Not Verified" />
                                    <button
                                        className="ml-2 text-xs text-blue-500 underline"
                                        onClick={() => setConfirm(verify)}
                                    >
                                        {loading ? `Loading...` : `Notify user`}
                                    </button>
                                </>
                            )}
                        </span>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr,4fr] my-2">
                    <p className="text-sm py-1">Phone No</p>
                    <p className="text-sm md:w-84 bg-gray_light px-3 py-1 rounded-lg">{data?.phoneNumber}</p>
                </div>
                {secondPhoneNumber && (
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,4fr] my-2">
                        <p className="text-sm py-1">Second Phone</p>
                        <p className="text-sm py-1 md:w-84 bg-gray_light px-3 rounded-lg">
                            {secondPhoneNumber}
                        </p>
                    </div>
                )}
                {formattedAddress && (
                    <div className="grid py-1 grid-cols-1 md:grid-cols-[1fr,4fr] my-2">
                        <p className="text-sm py-1">Address</p>
                        <p className="text-sm py-1 md:w-84 bg-gray_light px-3 rounded-lg">
                            {formattedAddress}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerInfo;