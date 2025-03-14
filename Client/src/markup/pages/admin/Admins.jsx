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
               
                <div className="mt-40 2xl:mt-16 ">
                    <div className="w-[400px] lg:w-[1000px] 2xl:w-[1200px] max-w-full  relative flex justify-between text-4xl  font-semibold">
                        <div className="xs:ml-16 lg:ml-32" >Admin</div>
                        <div className="mt-[-5px]">
                            <button
                                onClick={handleAddUserClick}
                                className="bg-green__ text-white  text-sm md:text-base font-semibold py-2 px-6 md:px-6 rounded-lg hover:outline-none hover:ring-2 hover:ring-green-500 hover:ring-opacity-50 transition duration-300 ease-in-out hover:bg-green-200 hover:text-black_ lg:mr-16"
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
