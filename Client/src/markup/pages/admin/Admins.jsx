import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import { useAuth } from "../../../Contexts/useHook";
import AdminList from "../../components/Admin/AdminHome/AdminList";
import bannerImg from "./../../../assets/images/banner/bannerImage.png";
import userService from "../../../services/users.service";
import deletedService from "../../../services/delete.service";
import LoadingIndicator from "../../../util/LoadingIndicator";


function Admins() {
    const [adminData, setAdminData] = useState({});
    const { setOpenPage, } = useAuth()
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const handleAddUserClick = () => {
        navigate("/admin/add-user")
    }


    const fetchAdminData = async () => {
        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);
        try {
            let response, responseObj, data;
            response = await userService.getAdminListData(token.token);
            if (response.status === 400) {
                setLoading(false);
                navigate("/500");
                return;
            }
            responseObj = await response?.json();
            data = await responseObj?.response;
            setAdminData(data)

            if (data) {
                setLoading(false);
            } else {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            navigate("/500");
            return;
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        setOpenPage("Admins")
        fetchAdminData();
    }, [setOpenPage]);


    const handleDeleteAdmins = async (selectedIds) => {
        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);
        try {
            await deletedService.deletedUser({ selectedIds }, token.token);
            fetchAdminData();
        } catch (error) {
            setLoading(false);
            navigate("/500");
            return;
        }
    };

    if (loading) {
        return <LoadingIndicator />
    }




    return (
        <div className="2xl:max-w-full 2xl:flex 2xl:justify-center">
            <div>
                <div className=" hidden md:block h-auto sm:h-72 w-full md:w-1/2 bg-center bg-cover mt-[-100px] lg:ml-[30%] max-w-[620px] transition-opacity duration-500" style={{
                    backgroundImage: `url(${bannerImg})`,
                    boxShadow: "0px 0px 10px rgba(0, 200, 0, 0.1)"
                }}>

                </div>
                <div className="mt-48 md:mt-0 lg:mt-[-50px]">
                    <div className="w-[400px]  relative flex justify-around text-4xl mx-7 font-semibold">
                        <div >Admin</div>
                        <div className="mt-[-5px]">
                            <button
                                onClick={handleAddUserClick}
                                className="bg-green__ text-white  text-sm md:text-base font-semibold py-2 px-6 md:px-6 rounded-lg hover:outline-none hover:ring-2 hover:ring-green-500 hover:ring-opacity-50 transition duration-300 ease-in-out hover:bg-green-200 hover:text-black_"
                            >
                                Add Admin
                            </button>
                        </div>


                    </div>
                    <div className="w-[100%] flex flex-col md:justify-content md:flex-col overflow-auto">
                        <div className="flex-grew w-full md:w-[1200px] relative">
                            <AdminList adminData={adminData} onDeleteAdmins={handleDeleteAdmins} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Admins
