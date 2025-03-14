import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../../Contexts/useHook";
import LoanInfo from "../../components/Admin/AdminHome/LoanInfo";
import PaymentInfo from "../../components/Admin/AdminHome/PaymentInfo";
import paymentData from "../../../services/paymentData.service";
import bannerImg from "./../../../assets/images/banner/bannerImage.png";
import LoadingIndicator from "../../../util/LoadingIndicator";


function Payment() {
    const { hashId } = useParams();
    const [dataInfo, setDataInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const { setOpenPage, setAddedData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setOpenPage("Payment")
        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);

        const fetchDashboardData = async () => {
            try {
                let response, responseObj, data;
                response = await paymentData.getPaymentInfoData(hashId, token.token);
                if (response.status === 400) {
                    setLoading(false);
                    navigate("/500");
                    return;
                }
                responseObj = await response?.json();
                data = await responseObj?.response;
                if (data) {
                    setDataInfo(data);
                    setAddedData(data.allLoanInfo[0]);
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
        fetchDashboardData();
    }, []);

    if (loading) {
        return <LoadingIndicator />
    }

    return (
        <div className="2xl:max-w-full 2xl:flex 2xl:justify-center">
            <div>  
                <div className="mt-[10px] xs:mt-[20px] md:mt-[170px] 2xl:mt-[50px]">
                    <div className=" lg:w-full relative ">
                        <PaymentInfo data={dataInfo?.allPaymentInfo} />
                    </div>
                </div>
                <div >
                    <div className="w-[100%] flex flex-col md:justify-content md:flex-col overflow-auto">
                        <div className="flex-grew w-full md:w-[1200px] mt-8">
                            <LoanInfo data={dataInfo?.allLoanInfo[0]} isPayment={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Payment;