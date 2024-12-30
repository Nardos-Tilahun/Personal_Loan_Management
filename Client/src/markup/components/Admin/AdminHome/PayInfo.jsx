function PayInfo({ payments }) {


    const nextPaymentTerm = payments?.NextPaymentTerm || "";
    const interestPaid = payments?.InterestPaid || "";
    const principalPaid = payments?.PrincipalPaid || "";
    const paymentNote = payments?.PaymentNote || "";
    const latePaymentReason = payments?.LatePaymentReason || "";;
    const penalityRate = payments?.PenalityRate || "";;
    const penaltyPayment = payments?.PenalityPayment || "";;
    const isLate = payments?.IsLate || "";


    return (
        <div className="px-8 mx-16 bg-white rounded-3xl shadow-lg min-h-54 pb-12">

            <div className="flex flex-col mt-4 font-sans space-y-2">

                <div className="mx-4 flex">

                    <div className="m-2 grid grid-cols-1 md:grid-cols-[4fr,5fr] md:min-w-64  ">
                        <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base py-1">Principal paid </p>
                        <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base w-24 bg-gray_light px-3 py-1 rounded-lg font-extralight">{principalPaid}</p>
                    </div>
                    <div className="m-2 grid grid-cols-1 md:grid-cols-[4fr,5fr] md:min-w-64">
                        <p className=" text-xs sm:text-sm md:text-base lg:text-base xl:text-base py-1">Interest Paid </p>
                        <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base w-24 bg-gray_light px-3 py-1 rounded-lg font-extralight">{interestPaid}</p>
                    </div>

                    <div className="m-2 grid grid-cols-1 md:grid-cols-[4fr,5fr] md:min-w-64">
                        <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base py-1">Next Term</p>
                        <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base w-24 bg-gray_light px-3 py-1 rounded-lg font-extralight">{nextPaymentTerm}</p>
                    </div>
                </div>
                {paymentNote && <div className=" mx-6 flex">
                    <p className=" text-xs sm:text-sm md:text-base lg:text-base xl:text-base py-1">Payment Note</p>
                    <p className="ml-5 text-xs sm:text-sm md:text-base lg:text-base xl:text-base w-96 bg-gray_light px-3 py-1 rounded-lg font-extralight">{paymentNote}</p>
                </div>}
                {isLate && (<div className="mx-4 flex">
                    {penalityRate &&
                        <div className="m-2 grid grid-cols-1 md:grid-cols-[4fr,5fr] md:min-w-64">
                            <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base py-1 ">Penality Rate</p>
                            <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base w-12 bg-gray_light px-3 py-1 rounded-lg font-extralight">
                                {penalityRate}
                            </p>
                        </div>}

                    {penaltyPayment &&
                        <div className="m-2 grid grid-cols-1 md:grid-cols-[5fr,5fr] md:min-w-64">
                            <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base py-1 " > Penality Amount </p>
                            <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base w-12 bg-gray_light px-3 py-1 rounded-lg font-extralight">
                                {penaltyPayment}
                            </p>
                        </div>}

                    {latePaymentReason &&
                        <div className="m-2 grid grid-cols-1 md:grid-cols-[2fr,5fr] md:min-w-96">
                            <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base py-1">Late Reason</p> <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-base w-72 bg-gray_light px-3 py-1 rounded-lg font-extralight">
                                {latePaymentReason}
                            </p>
                        </div>}

                </div>)}

            </div>
        </div>
    );
}

export default PayInfo;