import React, { useState, useEffect, useRef } from "react";


function DashInfo({ infoData }) {
    const [circle1Hovered, setCircle1Hovered] = useState(false);
    const [circle2Hovered, setCircle2Hovered] = useState(false);

    useEffect(() => {
        setCircle1Hovered(true);
        setCircle2Hovered(true);
    }, []);

    return (
        <div className="flex mt-64 md:mt-0 sm:mt-36 md:justify-around">

            <CircleInfo
                value={circle1Hovered ? infoData?.customer || 0 : infoData?.activeCustomer || 0}
                onHover={() => setCircle1Hovered(!circle1Hovered)}
                identity={circle1Hovered ? "Total Customers" : "Active Customers"}
                isHovered={circle1Hovered}
            />
            <CircleInfo
                value={circle2Hovered ? infoData?.totalLoanUSD || 0 : infoData?.outstandingLoanUSD || 0}
                onHover={() => setCircle2Hovered(!circle2Hovered)}
                identity={circle2Hovered ? "Total Lend" : "Outstanding Loan"}
                isHovered={circle2Hovered}
            />
        </div>
    );
}

function CircleInfo({ identity, value, onHover, isHovered }) {
    const [displayedValue, setDisplayedValue] = useState("0");
    const prevValueRef = useRef();

    useEffect(() => {
        const start = parseInt(prevValueRef.current || 0, 10);
        const end = typeof value === 'number' ? value : parseInt(value, 10);
        const duration = 700;
        const startTime = Date.now();

        const animate = () => {
            const currentTime = Date.now();
            const elapsedTime = Math.min(duration, currentTime - startTime);
            const newValue = Math.round(start + (end - start) * (elapsedTime / duration));
            setDisplayedValue(formatNumber(newValue));
            if (elapsedTime < duration) {
                requestAnimationFrame(animate);
            }
        };

        prevValueRef.current = typeof value === 'number' ? value : parseInt(value, 10);
        animate();

        return () => { };
    }, [value]);

    const formatNumber = (number) => {
        return number.toLocaleString();
    };

    return (
        <div className="relative w-40 h-40 m-4" onMouseEnter={onHover} onMouseLeave={onHover}>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-36 h-36 bg-gradient-to-br  from-yellow-200 to-green-500 rounded-full flex items-center justify-center   text-gray-900 text-center text-lg font-bold cursor-pointer transition duration-300 ease-in-out relative transform hover:scale-105 ${isHovered && 'hover:bg-gradient-to-br from-green-300 to-violet-200'}`}>
                    <div className="flex flex-col">
                        <div className="">{identity}</div>
                        <div className="my-2">{displayedValue}</div>
                    </div>
                </div>
                <div className="absolute inset-0 border-8 border-green-200 rounded-full pointer-events-none"></div>
            </div>
        </div>
    );
}

export default DashInfo;