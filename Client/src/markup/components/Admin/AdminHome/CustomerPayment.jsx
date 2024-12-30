import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteForever";
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "../../../../Contexts/useHook"
import PayInfo from "./PayInfo";
import deletedService from "../../../../services/delete.service";
import InfoDialog from "../../../../util/InformationPage";
import ConfirmationPanel from "../../../../util/ConfirmationPage";


const CustomerPayment = ({ payments, onDeletePayments }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedPaymentIds, setSelectedPaymentIds] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [amountRangeFilter, setAmountRangeFilter] = useState("All");
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState("normal");
    const [filterByCurrency, setFilterByCurrency] = useState("All");
    const [filterByStatus, setFilterByStatus] = useState("All");
    const [filterYear, setFilterYear] = useState("All");
    const [filterMonth, setFilterMonth] = useState("All");
    const [filtersChanged, setFiltersChanged] = useState(false);
    const [detailVisibility, setDetailVisibility] = useState([false]);
    const [loading, setLoading] = useState(false);
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [infoType, setInfoType] = useState('');
    const [status, setStatus] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const allVisible = detailVisibility.every((value) => value === true);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const showPopup = (event) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
        setPopupVisible(true);
    };

    const movePopup = (event) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const hidePopup = () => {
        setPopupVisible(false);
    };

    const controlAllDetail = () => {
        if (allVisible) {
            setDetailVisibility([false]);
            setFiltersChanged(false);
        } else {
            setDetailVisibility(Array(payments.length).fill(true))
            setFiltersChanged(true);
        }

    };
    const toggleDetail = (index) => {
        const updatedVisibility = [...detailVisibility];
        updatedVisibility[index] = !updatedVisibility[index];
        setDetailVisibility(updatedVisibility);
        setFiltersChanged(updatedVisibility[index]);
    };




    const handleItemsPerPageChange = (event) => {
        const newValue = event.target.value;
        setItemsPerPage(newValue === "All" ? payments.length : parseInt(newValue, 10));
        setStartIndex(0);
    };


    const editPayment = (payment) => {
        if (payment?.isRecent === "Recent")
            navigate(`/admin/edit/Payment/${payment?.PaymentHashID}`)
    };

    const viewDetailPayment = (index) => {
        toggleDetail(index);
    };


    const handleNext = () =>
        setStartIndex((prevIndex) => prevIndex + itemsPerPage);

    const handlePrevious = () =>
        setStartIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));


    const handleCheckboxChange = (payment) => {
        setSelectedPaymentIds((prevIds) =>
            prevIds.some((id) => id.PaymentHashID === payment.PaymentHashID)
                ? prevIds.filter((id) => id.PaymentHashID !== payment.PaymentHashID)
                : [...prevIds, payment]
        );
    };
    const handleFilterByStatusChange = (event) => {
        const newValue = event.target.value;
        setFilterByStatus(newValue);
        setFiltersChanged(true);
    };
    const handleFilterByCurrencyChange = (event) => {
        const newValue = event.target.value;
        setFilterByCurrency(newValue);
        setFiltersChanged(true);
    };
    const handleFilterByTermChange = (event) => {
        const newValue = event.target.value;
        setFiltersChanged(true);
    };
    const handleYearFilterChange = (event) => {
        setFilterYear(event.target.value);
        setFiltersChanged(true);
    };
    const handleMonthFilterChange = (event) => {
        setFilterMonth(event.target.value);
        setFiltersChanged(true);
    };

    const handleAmountRangeFilterChange = (event) => {
        const newValue = event.target.value;
        setAmountRangeFilter(newValue);
        setFiltersChanged(true);
    };


    const handleSelectAll = () => {
        if (selectedPaymentIds.length == payments.length) {
            setSelectedPaymentIds([])
            setFiltersChanged(false);
        } else {
            setSelectedPaymentIds(payments)
            setFiltersChanged(true);
        }
    };

    useEffect(() => {
        (selectedPaymentIds.length > 0) ?
            setFiltersChanged(true) :
            setFiltersChanged(false);
    }, [selectedPaymentIds])

    const handleDeleteSelectedPayments = () => {
        let recentPayments = [];
        if (selectedPaymentIds.length > 0) {
            recentPayments = selectedPaymentIds.map((payment) => payment.isRecent === "Recent")
        }
        if (!recentPayments?.includes(false)) {
            setConfirmMessage(`${`Are you sure you want to delete the selected payment?`}`);
            setDeleteConfirmation(selectedPaymentIds);
            setFiltersChanged(true);
        } else {
            setInfoMessage(`The selected Payment can't be deleted!
                <div class="text-black_"> 
                You can only delete <strong>Recent Payments</strong> </div> `);
            setInfoType('error');
            setShowInfoDialog(true);
            setStatus('error');
        }
    };

    const handleCancel = () => {
        setDeleteConfirmation(null);
    };

    const confirmDeletePayment = async () => {
        setLoading(true)
        const paymentHashIds = [];
        for (const selectedId of deleteConfirmation) {
            paymentHashIds.push(selectedId.PaymentHashID);
        }
        try {
            if (paymentHashIds.length > 0) {
                const tokenOnStorage = localStorage.getItem("user");
                const token = JSON.parse(tokenOnStorage);
                await deletedService.deletedPayment({ paymentHashIds }, token.token);
            }
            setInfoMessage("Selected payment has successfully deleted!");
            setInfoType('success');
            setStatus("success")
            setShowInfoDialog(true)
            setLoading(false)
        } catch (error) {
            setInfoMessage("Can't delete the payment!");
            setInfoType('error');
            setStatus("error")
            navigate("/500");
            setShowInfoDialog(true)
            setLoading(false)
        } finally {
            setSelectedPaymentIds([]);
            setDeleteConfirmation(null);
        }
    };

    const handleCloseInfoDialog = () => {
        if (status == "success") {
            onDeletePayments(selectedPaymentIds);
            setShowInfoDialog(false);
            setSelectedPaymentIds([]);
            setDeleteConfirmation(null);
        } else {
            setShowInfoDialog(false);
        }
    };



    const filterPaymentsByAmountRange = (payments) => {
        const amount = payments?.PaymentAmount;
        switch (amountRangeFilter) {
            case "0-1K":
                return amount >= 0 && amount <= 1000;
            case "1K-5K":
                return amount > 1000 && amount <= 5000;
            case "5K-10K":
                return amount > 5000 && amount <= 10000;
            case "10K-50K":
                return amount > 10000 && amount <= 50000;
            case "50K-100K":
                return amount > 50000 && amount <= 100000;
            case "100K-500K":
                return amount > 100000 && amount <= 500000;
            case "Above 500K":
                return amount > 500000;
            default:
                return true;
        }
    };


    const filteredPayments = payments.filter((payment) =>
        (filterByCurrency === "All" || payment.PaymentCurrency === filterByCurrency) &&
        (filterByStatus === "All" || payment.Status === filterByStatus) &&
        (filterYear === "All" || new Date(payment.PaymentDate).getFullYear().toString() === filterYear) &&
        (filterMonth === "All" || (new Date(payment.PaymentDate).getMonth() + 1).toString() === filterMonth) &&
        (filterPaymentsByAmountRange(payment))
    );
    const sortPayments = (column) => {
        if (sortBy === column) {
            toggleSortOrder();
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const toggleSortOrder = () => {
        if (sortOrder === 'asc') {
            setSortOrder('desc');
        } else if (sortOrder === 'desc') {
            setSortOrder(null);
            setSortBy(null);
        } else {
            setSortOrder('asc');
        }
    };

    let sortedPayments = [...filteredPayments];
    if (sortBy === "PaymentDate") {
        sortedPayments = [...filteredPayments].sort((a, b) => {
            const dateA = new Date(a.PaymentDate).getTime();
            const dateB = new Date(b.PaymentDate).getTime();
            if (dateA < dateB) return sortOrder === "asc" ? -1 : 1;
            if (dateA > dateB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "Amount") {
        sortedPayments = [...filteredPayments].sort((a, b) => {
            const amountA = a.PaymentAmount;
            const amountB = b.PaymentAmount;
            if (amountA < amountB) return sortOrder === "asc" ? -1 : 1;
            if (amountA > amountB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "Term") {
        sortedPayments = [...filteredPayments].sort((a, b) => {
            const termA = a.Term;
            const termB = b.Term;
            if (termA < termB) return sortOrder === "asc" ? -1 : 1;
            if (termA > termB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    const handleFirstPage = () => {
        setStartIndex(0);
    };

    const handleLastPage = () => {
        const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);
        const lastPageStartIndex = Math.max(0, (totalPages - 1) * itemsPerPage);
        setStartIndex(lastPageStartIndex);
    };
    const resetTable = () => {
        setDetailVisibility([false]);
        setItemsPerPage(10);
        setSelectedPaymentIds([]);
        setDeleteConfirmation(null);
        setAmountRangeFilter("All");
        setSortBy(null);
        setSortOrder("normal");
        setFilterByCurrency("All");
        setFilterByStatus("All");
        setFilterYear("All");
        setFilterMonth("All");
        setFiltersChanged(false);
    };

    const getIndicatorColor = (Status) => {
        switch (Status) {
            case 'ontime':
                return 'bg-lightgreen';
            case 'late':
                return 'bg-lightsalmon';
            default:
                return '';
        }
    };

    return (
        <div className="rounded-lg" >
            <main>
                <div className="flex-grow py-8">
                    <div className="flex w-full justify-between">
                        <div className="pl-10 text-lg font-semibold pb-4">All Payment Statuses for this Customer</div>
                        {filtersChanged && (
                            <button className="mr-10 py-1 px-3 text-center bg-green_ hover:bg-green-200 hover:text-color hover:font-bold rounded-lg text-md text-gray-700 mb-2" onClick={resetTable}>Reset</button>
                        )}
                    </div>

                    <div className=" overflow-x-auto  py-2">
                        <table className="w-full table-auto shadow-md bg-white rounded-3xl ">
                            <thead className="text-gray-500 p-10">
                                <tr>
                                    {user.userRoleId == 1 && <th className="px-6 py-2 border-b border-white flex flex-col ">
                                        <label className="inline-flex items-center border-b border-white">

                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedPaymentIds?.length === payments?.length && payments?.length > 0}
                                                className="hidden"
                                            />
                                            <span className="relative flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full cursor-pointer">
                                                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                    <span className={`block w-6 h-6 rounded-full ${selectedPaymentIds?.length === payments?.length && payments?.length > 0 ? 'bg-green_' : 'bg-transparent'}`}></span>
                                                </span>
                                            </span>
                                        </label>

                                        {selectedPaymentIds.length > 0 && (
                                            <div className="-ml-4 pt-1">
                                                <button
                                                    className="bg-red-300 hover:bg-red-600  px-1 py-1 text-white font-semibold  rounded ml-2 text-xs"
                                                    onClick={handleDeleteSelectedPayments}>
                                                    <DeleteIcon />
                                                </button>
                                            </div>

                                        )}
                                    </th>}

                                    <th ><div>No.</div></th>
                                    <th> <div>Currency</div>
                                        <Select
                                            value={filterByCurrency}
                                            onChange={handleFilterByCurrencyChange}
                                            displayEmpty
                                            className="text-base"
                                            sx={{
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                    fontWeight: "normal",
                                                    color: "#718096",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                },
                                            }}>
                                            <MenuItem value="All">All</MenuItem>
                                            <MenuItem value="COP">COP</MenuItem>
                                            <MenuItem value="USD">USD</MenuItem>
                                        </Select>
                                    </th>
                                    <th className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left cursor-pointer">
                                        <div onClick={() => sortPayments("Amount")}>Amount</div>
                                        <Select
                                            value={amountRangeFilter}
                                            onChange={handleAmountRangeFilterChange}
                                            displayEmpty
                                            className="text-base"
                                            sx={{
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                    fontWeight: "normal",
                                                    color: "#718096",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                },
                                            }}>
                                            <MenuItem value="All">All</MenuItem>
                                            <MenuItem value="0-1K">from 0 - 1K</MenuItem>
                                            <MenuItem value="1K-5K">from 1K - 5K</MenuItem>
                                            <MenuItem value="5K-10K">from 5K - 10K</MenuItem>
                                            <MenuItem value="10K-50K">from 10K - 50K</MenuItem>
                                            <MenuItem value="50K-100K">from 50K - 100K</MenuItem>
                                            <MenuItem value="100K-500K">from 100K - 500K</MenuItem>
                                            <MenuItem value="Above 500K">Above 500K</MenuItem>
                                        </Select>
                                        <div>{sortBy === "Amount" && (
                                            <div>{sortOrder === "asc" ? " ▲Lowest" : sortOrder === "desc" ? " ▼Highest" : ""}</div>
                                        )}</div>


                                    </th>
                                    <th className="px-7 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left">
                                        <div className="flex flex-col">
                                            <div className="cursor-pointer" onClick={() => sortPayments("PaymentDate")}>Payment Given Date</div>
                                            <div className="flex flex-row ml-[-20px]">
                                                <div className="relative">
                                                    <Select
                                                        value={filterYear}
                                                        onChange={handleYearFilterChange}
                                                        className="text-base p-0"
                                                        style={{ padding: "0" }}
                                                        inputProps={{
                                                            className: "text-xs p-1",
                                                        }}
                                                        SelectDisplayProps={{
                                                            className: "text-xs p-1",
                                                        }}
                                                        MenuProps={{
                                                            classes: {
                                                                paper: "text-xs",
                                                            },
                                                        }}
                                                        sx={{
                                                            "& .MuiOutlinedInput-notchedOutline": {
                                                                border: "none",
                                                                fontWeight: "normal",
                                                                color: "#718096",
                                                            },
                                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                                border: "none",
                                                            },
                                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                                border: "none",
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value="All" >Year</MenuItem>
                                                        {Array.from(new Set(payments.map(payment => new Date(payment.PaymentDate).getFullYear()))).map(year => (
                                                            <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                                                        ))}
                                                    </Select>

                                                </div>
                                                <div className="relative">
                                                    <Select
                                                        value={filterMonth}
                                                        onChange={handleMonthFilterChange}
                                                        className="text-base p-0"
                                                        style={{ padding: "0" }}
                                                        inputProps={{
                                                            className: "text-xs p-1",
                                                        }}
                                                        SelectDisplayProps={{
                                                            className: "text-xs p-1",
                                                        }}
                                                        MenuProps={{
                                                            classes: {
                                                                paper: "text-xs",
                                                            },
                                                        }}

                                                        sx={{
                                                            "& .MuiOutlinedInput-notchedOutline": {
                                                                border: "none",
                                                                fontWeight: "normal",
                                                                color: "#718096",
                                                            },
                                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                                border: "none",
                                                            },
                                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                                border: "none",
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value="All">Month</MenuItem>
                                                        {Array.from(new Set(payments.map(payment => new Date(payment.PaymentDate).getMonth() + 1))).map(month => (
                                                            <MenuItem key={month} value={month.toString()}>{new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}</MenuItem>
                                                        ))}
                                                    </Select>

                                                </div>
                                            </div>
                                            <div>{sortBy === "PaymentDate" && (
                                                <div>{sortOrder === "asc" ? "▲ Oldest" : sortOrder === "desc" ? "▼ Newest" : ""}</div>
                                            )}</div>
                                        </div>
                                    </th>


                                    <th
                                        className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left cursor-pointer"
                                        onClick={() => sortPayments("Term")}>
                                        <div className="flex flex-col">
                                            <div>Term</div>

                                            <div>{sortBy === "Term" && (
                                                <span>{sortOrder === "asc" ? "▲Shortest" : sortOrder === "desc" ? "▼Longest" : ""}</span>
                                            )}</div>
                                        </div>
                                    </th>
                                    <th className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left ">
                                        <div>Status</div>
                                        <Select
                                            value={filterByStatus}
                                            onChange={handleFilterByStatusChange}
                                            displayEmpty
                                            className="text-base hidden"
                                            sx={{
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                    fontWeight: "normal",
                                                    color: "#718096",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    border: "none",
                                                },
                                                "& .MuiSelect-select": {
                                                    display: "",
                                                }
                                            }}>
                                            <MenuItem value="All">All</MenuItem>
                                            <MenuItem value="OnTime">OnTime</MenuItem>
                                            <MenuItem value="Late">Late</MenuItem>



                                        </Select>

                                    </th>
                                    {user.userRoleId === 1 && <th className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left">
                                        Edit
                                    </th>}
                                    <th className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left">
                                        <button onClick={controlAllDetail}>{allVisible ? "Hide All Details" : "Show All Details"}</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-200 border-t py-8">
                                {sortedPayments
                                    .filter(filterPaymentsByAmountRange)
                                    .slice(startIndex, startIndex + itemsPerPage)
                                    .map((payment, index) => (
                                        <React.Fragment key={index}>
                                            <tr>
                                                {user.userRoleId == 1 && <td className="px-6 py-2 border-b border-white" onClick={() => viewDetailPayment(index)} >
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            onChange={() => handleCheckboxChange(payment)}

                                                            checked={selectedPaymentIds.some((id) => id.PaymentHashID === payments.PaymentHashID)
                                                            }
                                                            className="hidden"
                                                        />

                                                        <span className="relative flex-shrink-0 w-6 h-6 border border-gray-300 rounded-full cursor-pointer">
                                                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">

                                                                <span className={`block w-4 h-4 rounded-full 
                                                            ${selectedPaymentIds?.some(item => item.PaymentHashID === payment.PaymentHashID)
                                                                        ? 'bg-green_'
                                                                        : 'bg-transparent'}
                                                            `}></span>

                                                            </span>
                                                        </span>
                                                    </label>

                                                </td>}
                                                <td className="px-10 py-2" onClick={() => viewDetailPayment(index)}>
                                                    {sortBy ? startIndex + index + 1 : startIndex + index + 1}
                                                </td>
                                                <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base" onClick={() => viewDetailPayment(index)}>
                                                    {payment?.PaymentCurrency}
                                                </td>
                                                <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base" onClick={() => viewDetailPayment(index)}>
                                                    {new Intl.NumberFormat(undefined, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(payment?.PaymentAmount)}
                                                </td>
                                                <td className="cursor-pointer whitespace-nowrap px-7 py-1 rounded text-xs sm:text-sm md:text-base text-balck_ lg:text-base xl:text-base" onClick={() => viewDetailPayment(index)}>
                                                    {payment?.PaymentDate}
                                                </td>
                                                <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base" onClick={() => viewDetailPayment(index)} >
                                                    {payment?.Term}

                                                </td>
                                                <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base" onClick={() => viewDetailPayment(index)}>
                                                    <span className={`h-2 w-4  inline-block mr-2 ${getIndicatorColor(payment?.Status?.toLowerCase())}`} />
                                                    {payment?.Status}
                                                </td>
                                                {user.userRoleId === 1 && <td className="px-4 py-2">
                                                    <button
                                                        className={`text-gray-400 hover:text-gray-600 focus:outline-none border border-gray-300 rounded px-1 md:mr-1 md:px-2 ${payment.isRecent !== "Recent" ? 'hover:text-red-500' : ''}`}
                                                        onClick={() => editPayment(payment)}
                                                        onMouseEnter={payment?.isRecent !== "Recent" ? showPopup : null}
                                                        onMouseMove={payment?.isRecent !== "Recent" ? movePopup : null}
                                                        onMouseLeave={payment?.isRecent !== "Recent" ? hidePopup : null}>
                                                        {payment?.isRecent !== "Recent" ? <BlockIcon fontSize="small" className="hover:text-red-300" /> : <EditIcon fontSize="small" />}
                                                    </button>


                                                </td>}
                                                <td className="px-4 pr-8 py-2">
                                                    <button
                                                        className="text-black_ hover:text-gray-600 focus:outline-none border border-gray-300 rounded-lg px-6 text-xs sm:text-sm md:text-base lg:text-base xl:text-base"
                                                        onClick={() => viewDetailPayment(index)}
                                                    >
                                                        {
                                                            detailVisibility[index] ? (
                                                                "Hide"
                                                            ) : (
                                                                "Detail"
                                                            )
                                                        }

                                                    </button>
                                                </td>
                                            </tr>
                                            {detailVisibility[index] && (
                                                <tr className={`transition-all duration-500 ease-in-out ${detailVisibility[index] ? 'h-auto' : 'h-0 overflow-hidden'}`}>
                                                    <td colSpan="11">
                                                        <PayInfo payments={payments[index]} />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}

                            </tbody>


                            <tfoot>
                                <tr>
                                    <td colSpan="10">
                                        <div className="flex justify-end px-4 py-1 bg-white pr-6">
                                            <div className="pt-4">Rows per page</div>
                                            <Select
                                                value={itemsPerPage}
                                                onChange={handleItemsPerPageChange}
                                                displayEmpty
                                                className="text-base"
                                                sx={{
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: "none",
                                                        fontWeight: "normal",
                                                        color: "#718096",
                                                    },
                                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                                        border: "none",
                                                    },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        border: "none",
                                                    },
                                                }}
                                            >
                                                <MenuItem value={5}>5</MenuItem>
                                                <MenuItem value={10}>10</MenuItem>
                                                <MenuItem value={20}>20</MenuItem>
                                                <MenuItem value={50}>50</MenuItem>
                                                <MenuItem value={100}>100</MenuItem>
                                                <MenuItem value="All">All</MenuItem>
                                            </Select>
                                            <div className="flex space-x-4 items-center">
                                                <button
                                                    className="text-gray-black_ text-lg"
                                                    onClick={handleFirstPage}
                                                    disabled={startIndex === 0}>
                                                    {'<<'}
                                                </button>
                                                <button
                                                    className="text-gray-black_ text-sm"
                                                    onClick={handlePrevious}
                                                    disabled={startIndex === 0}>
                                                    <ArrowBackIcon style={{ fontSize: 16 }} />
                                                </button>
                                                <div className="text-md text-gray-black_ font-semibold">
                                                    Page {Math.ceil((startIndex + 1) / itemsPerPage)} of{" "}
                                                    {Math.ceil(sortedPayments.length / itemsPerPage)}
                                                </div>
                                                <button
                                                    className="text-gray-black_ text-sm"
                                                    onClick={handleNext}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedPayments.length
                                                    }>
                                                    <ArrowForwardIcon style={{ fontSize: 16 }} />
                                                </button>
                                                <button
                                                    className="text-gray-black_ text-lg"
                                                    onClick={handleLastPage}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedPayments.length
                                                    }>
                                                    {'>>'}
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>

                        </table>

                    </div>
                </div>
            </main>
            {isPopupVisible && (
                <div
                    className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg transition-transform duration-150 ease-in-out transform"
                    style={{ top: mousePosition.y + 15, left: mousePosition.x + 15 }}
                >
                    <div className="p-2">
                        <p className="text-red-300">It's not recent Payment</p>
                    </div>
                </div>
            )}
            {deleteConfirmation !== null && (
                <ConfirmationPanel
                    message={confirmMessage}
                    onConfirm={confirmDeletePayment}
                    onCancel={handleCancel}
                    loading={loading}
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
    );
}

export default CustomerPayment;