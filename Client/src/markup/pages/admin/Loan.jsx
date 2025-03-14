import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../../Contexts/useHook";
import LoanInfo from "../../components/Admin/AdminHome/LoanInfo";
import CustomerPayment from "../../components/Admin/AdminHome/CustomerPayment"
import loanData from "../../../services/loanData.service";
import bannerImg from "./../../../assets/images/banner/bannerImage.png";
import deletedService from "../../../services/delete.service";
import LoadingIndicator from "../../../util/LoadingIndicator";


function Loan() {
    const { hashId } = useParams();
    const { setOpenPage, setAddedData } = useAuth()
    const [dataInfo, setDataInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const fetchLoanData = async () => {
        setLoading(true);
        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);
        try {
            let response, responseObj, data;

            response = await loanData.getLoanInfoData(hashId, token.token);
            if (response.status === 400) {
                setLoading(false);
                navigate("/500");
                return;
            }
            responseObj = await response?.json();

            data = await responseObj?.response;

            if (data) {
                setDataInfo(data);
                setAddedData(data?.loanList[0])
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
        setOpenPage("Loan")
        fetchLoanData();
    }, [setOpenPage]);

    const handleDeletePayments = async (hashIds) => {
        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);
        try {
            await deletedService.deletedPayment({ hashIds }, token.token);
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
            <div>
                <div className="mt-[10px] xs:mt-[20px] md:mt-[170px] 2xl:mt-[50px]">
                    <div className="lg:w-full  relative ">
                        <LoanInfo data={dataInfo?.loanList?.[0]} />
                    </div>
                </div>
                <div>
                    <div className="w-[100%] flex flex-col md:justify-content md:flex-col overflow-auto">
                        <div className="flex-grew w-full md:w-[1200px] mt-8">
                            {(dataInfo?.allPaymentInfo) ?
                                <CustomerPayment payments={dataInfo?.allPaymentInfo} onDeletePayments={handleDeletePayments} /> : <div className="text-red-300 italic  text-xl font-semibold px-12"> Notice: -  So far, there is No Payment Related to this Loan</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loan;