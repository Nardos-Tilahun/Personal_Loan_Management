import React, { useRef, useState } from 'react';

function LoanNextPay() {
    const containerRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);

    const startScroll = (direction) => {
        setIsScrolling(true);
        const scrollAmount = direction === 'up' ? -40 : 40;
        const animationDuration = 500;
        const startTime = performance.now();

        const scrollAnimation = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            containerRef.current.scrollTop += scrollAmount * progress;

            if (progress < 1) {
                requestAnimationFrame(scrollAnimation);
            } else {
                setIsScrolling(false);
            }
        };

        requestAnimationFrame(scrollAnimation);
    };

    const handleMouseDown = (direction) => {
        if (!isScrolling) {
            setIsScrolling(true);
            startScroll(direction);
        }
    };

    const stopScroll = () => {
        setIsScrolling(false);
    };

    const data = {
        period: "week",
        term: 40,
        loanStartedDate: "Wednesday, Sep 16, 2024",
        NextPaymentTerm: "10",
        nextPaymentAmount: 100000,
        LoanCurrency: "USD",
    };

    function formatDate(date) {
        const month = date.toLocaleString('default', { month: 'long' });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    }

    function calculateNextPaymentDate(startDate, nextPaymentTerm, period) {
        const startDateObj = new Date(startDate);
        let nextPaymentDateObj = new Date(startDate);

        if (period === "week") {
            nextPaymentDateObj.setDate(nextPaymentDateObj.getDate() + (parseInt(nextPaymentTerm) * 7));
        } else if (period === "bi-week") {
            nextPaymentDateObj.setDate(nextPaymentDateObj.getDate() + (parseInt(nextPaymentTerm) * 14));
        } else if (period === "month") {
            nextPaymentDateObj.setMonth(nextPaymentDateObj.getMonth() + parseInt(nextPaymentTerm));
        } else if (period === "6-month") {
            nextPaymentDateObj.setMonth(nextPaymentDateObj.getMonth() + (parseInt(nextPaymentTerm) * 6));
        } else if (period === "annually") {
            nextPaymentDateObj.setFullYear(nextPaymentDateObj.getFullYear() + parseInt(nextPaymentTerm));
        }

        return formatDate(nextPaymentDateObj);
    }

    const nextPaymentDate = calculateNextPaymentDate(data.loanStartedDate, data.NextPaymentTerm, data.period);

    const generatePeriods = () => {
        const periods = [];
        const startDateObj = new Date(data.loanStartedDate);

        for (let i = 0; i < data.term; i++) {
            periods.push(formatDate(new Date(startDateObj)));
            if (data.period === "week") {
                startDateObj.setDate(startDateObj.getDate() + 7);
            } else if (data.period === "bi-week") {
                startDateObj.setDate(startDateObj.getDate() + 14);
            } else if (data.period === "month") {
                startDateObj.setMonth(startDateObj.getMonth() + 1);
            } else if (data.period === "6-month") {
                startDateObj.setMonth(startDateObj.getMonth() + 6);
            } else if (data.period === "annually") {
                startDateObj.setFullYear(startDateObj.getFullYear() + 1);
            }
        }

        return periods;
    };

    const periods = generatePeriods();

    return (
        <div className="min-w-64 ml-auto mr-10 mt-20 bg-white rounded-3xl shadow-lg min-h-64 max-w-[450px]">
            <div className="max-w-[450px]">
                <div className="max-w-[450px]">
                    <div className="p-2 border-b-2 border-gray-300">
                        Due Date
                    </div>
                    <div className="flex justify-between">
                        <div className="mt-4 border-r-2 pr-4 text-center w-1/2">
                            <div className="py-4">
                                <div className="p-3">
                                    Next Payment Date
                                </div>
                                <div className="p-3 bg-gray_light">{nextPaymentDate}</div>
                            </div>
                            <div className="p-4">
                                <div className="pb-3">
                                    Amount
                                </div>
                                <div className="bg-gray_light">{data?.nextPaymentAmount} {data?.LoanCurrency}</div>
                            </div>
                        </div>
                        <div className="ml-4 mt-6 justify-content w-1/2">
                            <button className="mr-2 p-3" onMouseDown={() => handleMouseDown('up')} onMouseUp={stopScroll}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                            <div className="py-2 flex flex-col justify-between border-b-2 border-t-2 border-gray-300" style={{ height: '120px', overflowY: 'auto' }} ref={containerRef}>
                                {periods.map((term, index) => (
                                    <div className="cursor-pointer p-3" key={index} data-date={term}>{term}</div>
                                ))}
                            </div>

                            <button className="mr-2 p-3" onMouseDown={() => handleMouseDown('down')} onMouseUp={stopScroll}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoanNextPay;
