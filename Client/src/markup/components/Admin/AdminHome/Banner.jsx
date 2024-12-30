import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from "../../../../Contexts/useHook"
import BannerButton from "./Button";
import getAuth from "../../../../util/auth"
import ProfileImage from "../../../../util/profileImage";

import Logo from "../../../../assets/images/FinancialLogo.png";

const Banner = () => {


    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState({})
    const [scrollPosition, setScrollPosition] = useState(0);
    const { user, openPage } = useAuth();
    ;
    useEffect(() => {
        const setName = async () => {
            const userBanner = await getAuth();
            setUserInfo(userBanner);
        };
        setName();
    }, []);
    const handleBack = () => {
        navigate(-1)
    }



    useEffect(() => {

        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };





    return (
        <div className={`fixed top-0 left-0  z-30 w-full pb-3 bg-gray_ transition-opacity duration-500 ${scrollPosition > 0 ? 'bg-green_ opacity-95' : 'bg-transparent'}`}>
            <div className={` mx-auto ${user.userRoleId == 2 ? "max-w-[1200px]" : "max-w-[1500px]"}`}>
                <div className="sm:justify-end  justify-between  items-center px-4 py-1 gap-3 md:gap-5">
                    <div className={`flex items-center gap-2 mt-4 md:mt-0 md:space-x-5 ${user.userRoleId == 2 ? "justify-between" : "justify-end"}`}>
                        <div className={`text-xl pl-4 font-semibold ${user.userRoleId == 2 ? "flex" : ""}`}>
                            {user.userRoleId == 2 ? <div className="flex justify-center items-center h-10 mb-16">
                                <img
                                    src={Logo}
                                    className="w-[90px] mt-24 z-50 pb-10 cursor-pointer hidden md:block"
                                    alt="Logo"
                                    onClick={() => navigate("/")}
                                />
                            </div> : null}
                            <div className={` flex space-x-2 ${user.userRoleId == 2 ? "flex-col text-l sm:text-xl md:text-2xl lg:text-4xl mx-12" : ""}`}>
                                <span className={`bg-gradient-to-r from-blue-900 to-green-900 bg-clip-text text-transparent ${user.userRoleId == 2 ? "p-2" : ""}`}>{`${user.userRoleId == 2 ? "Hello, " : "Welcome, "}`} </span>
                                <div className="m-0 p-0">
                                    <span className="bg-gradient-to-r from-yellow-700 to-blue-600 bg-clip-text text-transparent">{` ${userInfo?.firstName}`} </span>
                                    <span className="bg-gradient-to-r from-blue-900 to-green-900 bg-clip-text text-transparent">{userInfo?.lastName}</span>
                                </div>
                            </div>
                        </div>
                        <div className={user.userRoleId == 2 ? `flex  items-center space-x-4` : ``}>
                            {user.userRoleId == 2 ? (<button
                                className="bg-green-200 text-black_  text-sm md:text-base font-semibold py-1 px-4 md:px-6 rounded-xl hover:outline-none hover:ring-2 hover:ring-green-500 hover:ring-opacity-50 transition duration-300 ease-in-out hover:bg-green__ hover:text-white" onClick={handleLogout}
                            >
                                Log out
                            </button>) : null}

                            <ProfileImage name={userInfo?.firstName} userImage={userInfo?.userImage} index={-1} />
                        </div>
                    </div>
                </div >
                <div className={`flex  ${openPage !== "Home" ? "justify-between" : "justify-end"}`}>
                    {openPage !== "Home" && openPage !== "Error" && user.userRoleId === 1 ? <button className="ml-24 sm:ml-48 md:ml-64 lg:ml-80 mt-10 text-sm flex items-center bg-green__ pr-4 pl-2 text-white py-1 rounded-md outline-none hover:bg-green-200 hover:text-black_" onClick={handleBack}> <ArrowBackIcon />Back </button> : null}
                    <div className="flex justify-end mt-4">
                        {openPage === "Home" && openPage !== "Error" && user.userRoleId === 1 ? <BannerButton buttonName="Loan" /> : null}
                        {user.userRoleId === 1 && openPage !== "Error" && (openPage === "Home" || openPage === "Loan" || openPage === "Payment") ? <BannerButton buttonName="Payment" /> : null}
                        {openPage === "Customer" && openPage !== "Error" && user.userRoleId === 1 ? <BannerButton buttonName="Loan" /> : null}
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Banner;