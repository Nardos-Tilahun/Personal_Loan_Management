import { useNavigate } from "react-router";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from "../../../../Contexts/useHook";

function LoanInfo({ data, isPayment }) {
    const navigate = useNavigate()
    const { user } = useAuth()

    const fullName = `${data?.firstName}${data?.middleName ? ` ${data.middleName} ` : ""}${data?.lastName ? ` ${data.lastName} ` : ""
        }`;
    const collateral = data?.collateral;
    const loanPurpose = data?.loanPurpose;
    const penaltyPayment = data?.penaltyPayment;
    const loanAmount = `${data?.loanCurrency} ${data?.loanAmount}` || "";
    const loanBegin = data?.loanBegin || "";
    const loanDuration = `From ${data?.loanStartDate} to ${data?.loanExpirationDate}` || "";
    const loanTerm = `${data?.loanTerm} ${data?.loanTerm > 1 ? `${data?.loanPeriod}s` : ""} ` || "";
    const interest = `${data?.loanInterestRate}% -> [ ${data?.totalInterest} ${data?.loanCurrency} ]` || "";
    const totalInterestPaid = data?.totalInterestPaid || "";
    const interestLeft = data?.interestLeft || "";
    const loanPaymentMethod = data?.loanPaymentMethod || "";
    const fixedTermPayment = data?.fixedTermPayment || "";
    const lastTermPayment = data?.lastTermPayment || "";
    const payedPayment = data?.payedPayment || "";
    const remainingPayment = data?.remainingPayment || "";
    const nextPaymentAmount = data?.nextPaymentAmount || "";
    const nextPaymentExpirationDate = data?.nextPaymentExpirationDate || "";
    const status = data?.status || "";
    const latePaymentCount = data?.latePaymentCount || 0;

    const handleBack = () => {
        navigate(-1)
    }





    return (
        <div className={`w-[90%] left-0 md:w-[1150px] lg:[95%] lg:px-8 lg:mx-8 lg:ml-6  bg-white rounded-3xl shadow-lg min-h-64 pb-2 ${isPayment ? 'mb-12' : 'mt-64 sm:mt-44 md:mt-16'}`}>
            <div className={`title flex justify-between border-b-2 font-semibold py-2 ${isPayment ? "text-l" : "text-xl"}`}>
                <div>{`${isPayment ? "Loan Information Associated With This Payment" : "Loan Information"}`}</div>
                {user.userRoleId === 2 ? <button className="ml-24 sm:ml-48 md:ml-64 lg:ml-80 mt-10 text-sm flex items-center bg-green__ pr-4 pl-2 text-white py-1 rounded-md outline-none hover:bg-green-200 hover:text-black_" onClick={handleBack}> <ArrowBackIcon />Back </button> : null}
            </div>
            <div className="flex flex-col md:flex-row mt-4 font-sans ">
                <div className="flex flex-col mx-4  font-sans ">
                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1">Full Name</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{fullName}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1">Loan Amount</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{loanAmount}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1"> Accept on</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{loanBegin}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1"> Duration</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{loanDuration}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1">Loan Term</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{loanTerm}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[3fr,5fr] my-2">
                        <p className="text-sm py-1">Status </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{status}</p>
                    </div>

                </div>
                <div className="mx-4">
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Total Interest</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{interest}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Payed Payment </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{payedPayment}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Paid Interest</p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{totalInterestPaid}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Remaining Payment </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{remainingPayment}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Remaining Interest </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{interestLeft}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Loan Payment Method </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{loanPaymentMethod}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Fixed Term Payment </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{fixedTermPayment}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Last Term Payment </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{lastTermPayment}</p>
                    </div>
                </div>
                <div className="mx-4">
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Next Term Payment </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{nextPaymentAmount}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                        <p className="text-sm py-1">Next Term Expiration Date </p>
                        <p className="text-sm md:w-48 bg-gray_light px-3 py-1 rounded-lg font-extralight">{nextPaymentExpirationDate}</p>
                    </div>
                    {loanPurpose &&
                        <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                            <p className="text-sm py-1 ">Loan Purpose</p>
                            <p className="text-sm py-1 md:w-48 bg-gray_light px-3 rounded-lg font-extralight">
                                {loanPurpose}
                            </p>
                        </div>
                    }
                    {collateral &&
                        <div className="grid py-1 grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                            <p className="text-sm py-1">Collateral</p>
                            <p className="text-sm py-1 md:w-48 bg-gray_light px-3 rounded-lg font-extralight">
                                {collateral}
                            </p>
                        </div>
                    }

                    {latePaymentCount !== 0 &&
                        <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                            <p className="text-sm py-1 " >
                                Number of Late Payment
                            </p>
                            <p className="text-sm py-1 md:w-48 bg-gray_light px-3 rounded-lg font-extralight">
                                {latePaymentCount}
                            </p>
                        </div>
                    }
                    {penaltyPayment &&
                        <div className="grid grid-cols-1 md:grid-cols-[5fr,5fr] my-2">
                            <p className="text-sm py-1 " > Penality Payment </p>
                            <p className="text-sm py-1 md:w-48 bg-gray_light px-3 rounded-lg font-extralight">
                                {penaltyPayment}
                            </p>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default LoanInfo;