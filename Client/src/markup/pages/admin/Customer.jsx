import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useNavigate } from 'react-router';
import { useAuth } from '../../../Contexts/useHook'
import bannerImg from "./../../../assets/images/banner/bannerImage.png"
import CustomerInfo from "../../components/Admin/AdminHome/CustomerInfo"
import CustomerNextPay from "../../components/Admin/AdminHome/CustomerNextPay"
import CustomerLoan from "../../components/Admin/AdminHome/CustomerLoan"
import loanData from "../../../services/loanData.service"
import LoadingIndicator from '../../../util/LoadingIndicator';
import deletedService from "../../../services/delete.service";
import ConfirmationPanel from "../../../util/ConfirmationPage";
import InfoDialog from "../../../util/InformationPage";
import userService from "../../../services/users.service";


function Customer() {
    const { hashId } = useParams();
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState({});
    const [confirm, setConfirm] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [infoType, setInfoType] = useState('');
    const [loading, setLoading] = useState(true);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const { setOpenPage, setAddedData } = useAuth();



    const fetchCustomerData = async () => {
        setLoading(true);
        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);
        try {
            const response = await loanData.getCustomerData(token.token, hashId);
            if (response.status === 400) {
                setLoading(false);
                navigate("/500");
                return;
            }
            const data = await response.json();
            if (response.ok) {
                setCustomerData(data?.response);
                setAddedData(data?.response?.getCustomerDetail)
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
            setConfirm('')
        }
    }


    useEffect(() => {
        setOpenPage("Customer");
        fetchCustomerData();
    }, [setOpenPage]);


    useEffect(() => {
        if (confirm === "NotVerified") {
            setConfirmMessage(`
            Are you sure you want to send a confirmation link to <strong>${customerData?.getCustomerDetail?.email}</strong>?
            <br><br>
            This will allow the customer to confirm their email and receive notifications for new loans and repayments.<br>
        `);
            setShowConfirmation(true);
        } else if (confirm === "Verified") {
            setConfirmMessage(`
                Are you sure you want to disable notifications for <strong>${customerData?.getCustomerDetail?.email}</strong>?
                <br><br>
                This will stop the customer from receiving updates about new loans and repayments.
            `);
            setShowConfirmation(true);
        }
    }, [confirm]);

    const handleConfirmChange = async (event) => {
        setConfirmLoading(true)
        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);
        try {
            const response = await userService.updateVerification(customerData?.getCustomerDetail?.email, token.token, confirm);
            if (response.status === 400) {
                setLoading(false);
                navigate("/500");
                return;
            }
            const result = await response.json();

            if (result?.status === 'OK' && result?.msg == "Verification declined successfully") {
                setInfoMessage(`The customer has been successfully unverified and  will no longer receive email notifications.`);
                setInfoType("success");
            } else if (result?.status === 'error' && result?.msg == "Token already sent to the client.") {
                setInfoMessage(`Confirmation already sent to the customer.
                    
                    You can send another email 
                    after ${result?.data?.[0]} hours and ${result?.data?.[1]} minutes.`);
                setInfoType('error');
            } else if (result?.status === 'error' && result?.msg == "Token expired. Contact us to send it again and verify.") {
                setInfoMessage("Token expired. Contact us to send it again and verify.");
                setInfoType('error');
            } else if (result?.status === 'OK' && result?.msg == "Verification added successfully") {
                setInfoMessage(`
                A Registration Confirmation link has been sent to the provided email! <br>
                The link will expire after 24 hours!
                `);
                setInfoType("success")
            } else if (result?.status === 'error' && result?.msg == "Token exists but expired.") {
                setInfoMessage("Expired Token");
                setInfoType('error');
            } else if (result?.status === 'error' && result?.msg == "Already Verified account") {
                setInfoMessage("The account is already a verified account, Click Close to reload the page");
                setInfoType('error');

            } else if (result?.status === 'error' && result?.msg == "Already Not Verified account") {
                setInfoMessage("The accounts is not verified account, reload the page");
                setInfoType('error');
            } else {
                setInfoMessage("An error occurred. Please try again later.");
                setInfoType('error');
            }
            setShowInfoDialog(true);
            setConfirmLoading(false)

        } catch (error) {
            setInfoMessage("An error occurred. Please try again later.");
            setInfoType('error');
            setShowInfoDialog(true);
        } finally {
            setConfirmLoading(false);
            setShowConfirmation(false);
            setConfirm('')
        }
    };

    const handleCloseInfoDialog = () => {
        setShowInfoDialog(false);
        setConfirm("")
        window.location.reload();

    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setConfirm("")
    };


    const handleDeleteCustomers = async (hashIds) => {

        const tokenOnStorage = localStorage.getItem("user");
        const token = JSON.parse(tokenOnStorage);
        try {
            await deletedService.deletedLoan({ hashIds }, token.token);
            fetchCustomerData();

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
        <div>
            <div className="2xl:max-w-full 2xl:flex 2xl:justify-center">
                <div >
                    <div className=" hidden md:block h-auto md:h-72 w-1/2 bg-center bg-cover mt-[-100px] ml-[30%]  transition-opacity duration-500 " style={{
                        backgroundImage: `url(${bannerImg})`,
                        boxShadow: "0px 0px 10px rgba(0, 200, 0, 0.1)"
                    }}>
                    </div>

                    <div className=" mt-[-100px] md:mt-[-180px]">
                        <div className="w-[100%] flex flex-col md:justify-content md:flex-col overflow-auto">

                            <div className="flex flex-col md:flex-row space-x-3 w-full md:w-[1200px] ">
                                <div className="flex-grew min-w-[400px] w-full md:w-full mt-8 mx-auto  rounded-3xl shadow-lg ">
                                    <CustomerInfo data={customerData?.getCustomerDetail} setConfirm={setConfirm} loading={confirmLoading} width={650} height={300} />
                                </div>

                                <div className="flex-grew w-full md:w-full rounded-3xl shadow-lg ">
                                    {customerData?.nextPaymentStatus?.length !== 0 ? <CustomerNextPay data={customerData?.nextPaymentStatus} width={300} height={300} /> : null}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="">
                        <div className="w-[100%] flex flex-col md:justify-content md:flex-col overflow-auto">
                            <div className="flex-grew w-full md:w-[1200px]">
                                {customerData?.customerLoanList?.length !== 0 ?
                                    <CustomerLoan loans={customerData?.customerLoanList} onDeleteCustomers={handleDeleteCustomers} /> : <div className="text-red-300 italic  text-xl font-semibold px-12"> Notice: -  So far, there is No Registered Loan under this Customer</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showConfirmation && (
                <ConfirmationPanel
                    message={confirmMessage}
                    onConfirm={handleConfirmChange}
                    onCancel={handleCancel}
                    loading={confirmLoading}
                />
            )}
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

export default Customer
