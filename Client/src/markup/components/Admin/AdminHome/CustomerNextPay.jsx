function CustomerNextPay({ data }) {

    const nextPayDate = data?.nextPayDate || "";
    const nextPayAmount = data?.nextPayAmount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "";
    const totalRemainingPay = data?.totalRemainingPay?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "";
    const dueDate = data?.dueDate || "";
    return (
        <div className="min-w-64 mx-auto px-5 mb-4 md:mb-0 md:mt-20  bg-white rounded-3xl shadow-lg min-h-64 max-w-[400px] ">
            <div className="max-w-[400px] mx-auto my-10">
                <div className="max-w-[400px] mx-auto my-10">
                    <div className="p-4 flex justify-between border-b-2 border-gray-300">
                        <div>
                            Next Payment
                        </div>
                        <div className="text-lg font-bold">
                            {nextPayAmount}
                        </div>
                    </div>
                    <div className="text-right px-4">
                        {nextPayDate}
                    </div>
                </div>
            </div>
            <div className="max-w-[400px] mx-auto my-10">
                <div className="max-w-[400px] mx-auto my-10">
                    <div className="p-4 flex justify-between border-b-2 border-gray-300">
                        <div>
                            Total Remaining Payment
                        </div>
                        <div className="font-bold remain-amount">
                            {totalRemainingPay}
                        </div>
                    </div>
                    <div className="due-date text-right px-4">
                        {dueDate}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerNextPay;
