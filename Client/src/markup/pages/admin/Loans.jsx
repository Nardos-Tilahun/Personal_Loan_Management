import { useEffect, useState } from "react"
import { useNavigate } from "react-router";

import { useAuth } from '../../../Contexts/useHook'
import LoanList from "../../components/Admin/AdminHome/LoanList"
import loanData from "../../../services/loanData.service";
import bannerImg from "./../../../assets/images/banner/bannerImage.png"
import LoadingIndicator from '../../../util/LoadingIndicator';
import deletedService from "../../../services/delete.service";

function Loans() {
    const [loanListData, setLoanListData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setOpenPage } = useAuth();
    const navigate = useNavigate()


    const handleAddLoanClick = () => {
        navigate("/admin/add-loan")
    }

    const fetchLoanData = async () => {
        setLoading(true);
        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);
        try {
            const response = await loanData.getLoanListData(token.token);
            if (response.status === 400) {
                setLoading(false);
                navigate("/500");
                return;
            }
            const responseObj = await response?.json();
            const data = await responseObj?.response?.loanList;
            setLoanListData(data)
            setLoading(false);
        } catch (error) {
            navigate("/500");
            setLoading(false);
            return;
        }
    };

    useEffect(() => {
        setOpenPage("Loans")
        fetchLoanData();
    }, [setOpenPage]);

    const handleDeleteLoans = async (hashIds) => {
        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);
        try {
            await deletedService.deletedLoan({ hashIds }, token.token);

            fetchLoanData();
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
            <div >
            <div className="mt-40 2xl:mt-16 ">
            <div className="w-[400px] lg:w-[1000px] 2xl:w-[1200px] max-w-full flex justify-between text-4xl  font-semibold">
                        <div className="xs:ml-16 lg:ml-32">Loans</div>
                        <div className="mt-[-5px]">
                            <button
                                onClick={handleAddLoanClick}
                                className="bg-green__ text-white  text-sm md:text-base font-semibold py-2 px-6 md:px-6 rounded-lg hover:outline-none hover:ring-2 hover:ring-green-500 hover:ring-opacity-50 transition duration-300 ease-in-out hover:bg-green-200 hover:text-black_ lg:mr-16"
                            >
                                Add Loan
                            </button>
                        </div>

                    </div>
                    <div className="w-[100%] flex flex-col md:justify-content md:flex-col overflow-auto">
                        <div className="flex-grew w-full md:w-[1200px] mt-8">
                            <LoanList loans={loanListData} onDeleteLoans={handleDeleteLoans} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loans
