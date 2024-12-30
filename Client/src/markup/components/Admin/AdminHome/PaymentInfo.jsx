import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from "../../../../Contexts/useHook";

function PaymentInfo({ data }) {
    const { user, openPage } = useAuth()
    const navigate = useNavigate()
    const paymentNote = data?.paymentNote;
    const latePaymentReason = data?.latePaymentReason;
    const penalityRate = data?.penalityRate;
    const penalityPayment = data?.penalityPayment;
    const paymentAmount = `${data?.paymentCurrency} ${data?.paymentAmount}` || "";
    const paymentDate = data?.paymentDate || "";
    const paymentMethod = data?.paymentMethod || "";
    const term = data?.term || "";
    const nextPaymentTerm = data?.nextPaymentTerm || "";
    const interestPaid = data?.interestPaid || "";
    const principalPaid = data?.principalPaid || "";
    const status = data?.status || "";
    const isLate = data?.isLate || "";

    const handleBack = () => {
        navigate(-1)
    }

    return (
        <div className="w-[90%] md:w-[1000px]  left-0 mt-64 sm:mt-44 md:mt-16  lg:px-8 lg:mx-8 lg:ml-6  bg-white rounded-3xl shadow-lg min-h-64 pb-2 ">
            <div className="flex justify-between">
                <div className="title text-xl border-b-2 font-semibold py-2">Term {term} - Payment Information</div>

                {openPage === "Payment" && user.userRoleId == 2 ? <button className="text-sm flex items-center bg-green__ pr-4 pl-2 text-white max-h-8 py-1 rounded-md outline-none hover:bg-green-200 hover:text-black_" onClick={handleBack}><ArrowBackIcon />Back </button> : null}</div>


            <div className="flex flex-col md:flex-row mt-4 font-sans ">
                <div className="flex flex-col mx-4  font-sans ">
                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1">Payment Term </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{term}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1">Payment Amount</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{paymentAmount}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1"> Payment Date</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{paymentDate}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1">Status </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{status}</p>
                    </div>
                </div>
                <div className="mx-4">
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1"> Paid Principal</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{principalPaid}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Paid Interest </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{interestPaid}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Payment Method</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{paymentMethod}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Next Payment Term</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{nextPaymentTerm}</p>
                    </div>

                    {paymentNote &&
                        <div className="grid py-1 grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                            <p className="text-sm py-1">Payment Note</p>
                            <p className="text-sm py-1 md:w-48 bg-gray_light px-3 rounded-lg font-extralight">
                                {paymentNote}
                            </p>
                        </div>}
                </div>

                {isLate &&
                    (<div className="mx-4">
                        {latePaymentReason &&
                            <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                                <p className="text-sm py-1 ">Reason for Late</p>
                                <p className="text-sm py-1 md:w-48 bg-gray_light px-3 rounded-lg font-extralight">
                                    {latePaymentReason}
                                </p>
                            </div>}

                        {penalityPayment &&
                            <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                                <p className="text-sm py-1 " >Penality Payment </p>
                                <p className="text-sm py-1 md:w-48 bg-gray_light px-3 rounded-lg font-extralight">
                                    {penalityPayment}
                                </p>
                            </div>}

                        {penalityRate &&
                            <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                                <p className="text-sm py-1 " > Penality Rate </p>
                                <p className="text-sm py-1 md:w-48 bg-gray_light px-3 rounded-lg font-extralight">
                                    {penalityRate}
                                </p>
                            </div>}
                    </div>)}
            </div>
        </div>
    );
}

export default PaymentInfo;