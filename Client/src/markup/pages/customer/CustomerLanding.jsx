import { useEffect, useState } from "react"
import { useAuth } from '../../../Contexts/useHook'
import CustomerInfo from "../../components/Admin/AdminHome/CustomerInfo"
import CustomerNextPay from "../../components/Admin/AdminHome/CustomerNextPay"
import CustomerLoan from "../../components/Admin/AdminHome/CustomerLoan"
import loanData from "../../../services/loanData.service"
import bannerImg from "./../../../assets/images/banner/bannerImage.png"
import LoadingIndicator from '../../../util/LoadingIndicator';
import InfoDialog from "../../../util/InformationPage"
import { useNavigate } from "react-router"

function CustomerLanding() {
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState({});
    const [loading, setLoading] = useState(true);
    const { setOpenPage } = useAuth();
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [infoType, setInfoType] = useState('');
    const { user } = useAuth()

    const handleChange = (event) => {
        setSelectedData(event.target.value);
    };

    const handleCloseInfoDialog = () => {
        setShowInfoDialog(false);
    };
    useEffect(() => {
        setOpenPage("CustomerLanding");

        const fetchCustomerData = async () => {
            setLoading(true)
            try {
                const response = await loanData.getCustomerData(user?.token, user?.userHashId);
                if (response.status === 400) {
                    setLoading(false);
                    navigate("/500");
                    return;
                }
                const data = await response.json(); setCustomerData(data?.response);
                setLoading(false)
            } catch (error) {
                setServerError('An error occurred. Please try again later.');
                setInfoMessage("An error occurred. Please try again later");
                setInfoType('error');
                setShowInfoDialog(true);
                setLoading(false)
                navigate("/500")
                return;
            } finally {
                setLoading(false);
            }
        }
        fetchCustomerData();
    }, []);



    if (loading) {

        return <LoadingIndicator />
    }

    return (
        <div >
            <div className=" hidden md:block h-auto md:h-72 w-1/2 bg-center bg-cover mt-[-100px] ml-[30%]  transition-opacity duration-500 hover:opacity-75" style={{
                backgroundImage: `url(${bannerImg})`,
                boxShadow: "0px 0px 10px rgba(0, 200, 0, 0.1)"
            }}>
            </div>

            <div className=" mt-[-100px] md:mt-[-180px]">
                <div className="w-[100%] flex flex-col md:justify-content md:flex-col overflow-auto">
                    <div className="flex flex-col md:flex-row space-x-3 w-full md:w-[1200px] ">
                        <div className="flex-grew min-w-[400px] w-full md:w-full mt-8 mx-auto  rounded-3xl shadow-lg ">
                            <CustomerInfo data={customerData?.getCustomerDetail} width={650} height={300} />
                        </div>

                        <div className="flex-grew w-full md:w-full rounded-3xl justify-center shadow-lg ">
                            {customerData?.nextPaymentStatus?.length !== 0 ? <CustomerNextPay data={customerData?.nextPaymentStatus} width={300} height={300} /> : null}
                        </div>
                    </div>
                </div>

            </div>

            <div className="">
                <div className="w-[100%] flex flex-col md:justify-content md:flex-col overflow-auto">
                    <div className="flex-grew w-full md:w-[1200px]">
                        {customerData?.customerLoanList?.length !== 0 ?
                            <CustomerLoan loans={customerData?.customerLoanList} /> : <div className="text-red-300 italic  text-xl font-semibold px-12"> Notice: -  So far, You have no registered Loan</div>}
                    </div>
                </div>
            </div>
            {showInfoDialog && (
                <InfoDialog
                    message={infoMessage}
                    onClose={handleCloseInfoDialog}
                    type={infoType}
                />
            )}
        </div>
    )
}

export default CustomerLanding
