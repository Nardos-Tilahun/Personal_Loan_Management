function AdminInfo({ adminData }) {
    const phoneNumber = adminData?.PhoneNumber || "";
    const createdBy = adminData?.createdBy || "";
    const secondPhoneNumber = adminData?.SecondPhoneNumber || "";
    const state = adminData?.State || "";
    const streetAddress = adminData?.StreetAddress || "";
    const zipCode = adminData?.ZipCode || "";
    const city = adminData?.City || "";
    const country = adminData?.Country || "";
    let formattedAddress = "";

    if (streetAddress) {
        formattedAddress += streetAddress;
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
        <div className="px-8 mx-16 bg-white rounded-3xl shadow-lg min-h-54 pb-12">
            <div className="flex flex-col mt-4 font-sans space-y-2">

                <div className="mx-4 flex">
                    <div className="m-2 grid grid-cols-2 md:grid-cols-[4fr,5fr] md:min-w-64 text-xs sm:text-sm md:text-base lg:text-base xl:text-base  ">
                        <p className="text-normal py-1">Phone Number </p>

                        <p className="text-normal w-32 bg-gray_light px-3 py-1 rounded-lg font-extralight">{phoneNumber}</p>
                    </div>

                    {secondPhoneNumber && <div className="m-2 grid grid-cols-1 md:grid-cols-[4fr,5fr] md:min-w-64 text-xs sm:text-sm md:text-base lg:text-base xl:text-base ">
                        <p className="text-normal py-1">Second Phone Number</p>

                        <p className="text-normal w-36 bg-gray_light px-3 py-1 rounded-lg font-extralight">{secondPhoneNumber}</p>
                    </div>}

                    <div className="m-2 grid grid-cols-2 md:grid-cols-[4fr,5fr] md:min-w-64 text-xs sm:text-sm md:text-base lg:text-base xl:text-base ">
                        <p className=" text-normal py-1">Created By </p>

                        <p className="text-normal w-36 bg-gray_light px-3 py-1 rounded-lg font-extralight">{createdBy}</p>
                    </div>

                </div>
                {formattedAddress && <div className=" mx-6 flex md:min-w-64  ">
                    <p className="  py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base ">Address</p>

                    <p className="ml-5 w-96 bg-gray_light px-3 py-1 rounded-lg font-extralight text-xs sm:text-sm md:text-base lg:text-base xl:text-base ">{formattedAddress}</p>
                </div>}
            </div>
        </div>
    );
}

export default AdminInfo;