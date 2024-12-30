import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteForever";
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import deletedService from "../../../../services/delete.service";
import ConfirmationPanel from "../../../../util/ConfirmationPage";
import InfoDialog from "../../../../util/InformationPage";

const PaymentList = ({ payments, onDeletePayments }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedPaymentIds] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [amountRangeFilter, setAmountRangeFilter] = useState("All");
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState("normal");
    const [filterByCurrency, setFilterByCurrency] = useState("All");
    const [filterByStatus, setFilterByStatus] = useState("All");
    const [filterYear, setFilterYear] = useState("All");
    const [filterMonth, setFilterMonth] = useState("All");
    const [filtersChanged, setFiltersChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [infoType, setInfoType] = useState('');
    const [status, setStatus] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const navigate = useNavigate();
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


    const handleItemsPerPageChange = (event) => {
        const newValue = event.target.value;
        if (newValue === "All") {
            setItemsPerPage(payments.length);
        } else {
            setItemsPerPage(parseInt(newValue, 10));
        }
        setStartIndex(0);
    };


    const editPayment = (payments) => {
        if (payments?.isRecent === "Recent")
            navigate(`/admin/edit/Payment/${payments?.hashId}`)
    };

    const viewPayments = (hashId) => {
        navigate(`/admin/Payment/${hashId}`)
    };


    const handleNext = () =>
        setStartIndex((prevIndex) => prevIndex + itemsPerPage);

    const handlePrevious = () =>
        setStartIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));

    const handleCheckboxChange = (payment) => {
        setSelectedPaymentIds((prevIds) =>
            prevIds.some((id) => id.hashId === payment.hashId)
                ? prevIds.filter((id) => id.hashId !== payment.hashId)
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
        if (selectedIds.length == payments.length) {
            setSelectedPaymentIds([])
            setFiltersChanged(false);
        } else {
            setSelectedPaymentIds(payments)
            setFiltersChanged(true);
        }
    };

    useEffect(() => {
        (selectedIds.length > 0) ?
            setFiltersChanged(true) :
            setFiltersChanged(false);
    }, [selectedIds])

    const handleSearchChange = (event) => setSearchTerm(event.target.value);



    const handleDeleteSelectedPayments = () => {
        let recentPayments = [];
        if (selectedIds.length > 0) {
            recentPayments = selectedIds.map((payment) => payment.isRecent === "Recent")
        }
        if (!recentPayments?.includes(false)) {
            setConfirmMessage(`${`Are you sure you want to delete the selected payment?`}`);
            setDeleteConfirmation(selectedIds);
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
            paymentHashIds.push(selectedId.hashId);
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
            setShowInfoDialog(false);
            onDeletePayments(selectedIds);
            setSelectedPaymentIds([]);
            setDeleteConfirmation(null);
        } else {
            setShowInfoDialog(false);
        }
    };


    const filterPaymentByAmountRange = (payments) => {
        const amount = payments?.amount;
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


    const filteredPayments = Array.isArray(payments) ?
        payments.filter((payment) =>
            payment?.fullName?.toLowerCase()?.includes(searchTerm.toLowerCase()) &&
            (filterByCurrency === "All" || payment.currency === filterByCurrency) &&
            (filterByStatus === "All" || payment.status === filterByStatus) &&
            (filterYear === "All" || new Date(payment.receivedDate).getFullYear().toString() === filterYear) &&
            (filterMonth === "All" || (new Date(payment.receivedDate).getMonth() + 1).toString() === filterMonth) &&
            (filterPaymentByAmountRange(payment))
        ) : [];

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
    let sortedPayment = Array.isArray(filteredPayments) ? [...filteredPayments] : [];
    if (sortBy === "receivedDate") {
        sortedPayment = [...filteredPayments].sort((a, b) => {
            const dateA = new Date(a.receivedDate).getTime();
            const dateB = new Date(b.receivedDate).getTime();
            if (dateA < dateB) return sortOrder === "asc" ? -1 : 1;
            if (dateA > dateB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "amount") {
        sortedPayment = [...filteredPayments].sort((a, b) => {
            const amountA = a.amount;
            const amountB = b.amount;
            if (amountA < amountB) return sortOrder === "asc" ? -1 : 1;
            if (amountA > amountB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }

    if (sortBy === "fullName") {
        sortedPayment = [...filteredPayments].sort((a, b) => {
            const fullNameA = a.fullName;
            const fullNameB = b.fullName;
            if (fullNameA < fullNameB) return sortOrder === "asc" ? -1 : 1;
            if (fullNameA > fullNameB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    const handleFirstPage = () => {
        setStartIndex(0);
    };

    const handleLastPage = () => {
        const totalPages = Math.ceil(sortedPayment.length / itemsPerPage);
        const lastPageStartIndex = Math.max(0, (totalPages - 1) * itemsPerPage);
        setStartIndex(lastPageStartIndex);
    };
    const resetTable = () => {
        setSearchTerm("");
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

    const getIndicatorColor = (status) => {
        switch (status) {
            case 'on time':
                return 'bg-lightgreen';
            case 'late':
                return 'bg-lightsalmon';
            default:
                return '';
        }
    };

    return (
        <div >
            <main>
                <div className="flex-grow rounded-3xl mt-4 pb-8">
                    <div className="flex w-full justify-between">
                        <input
                            type="text"
                            className="w-full max-w-md rounded-md text-base text-gray-black_ outline-none border-none px-2 py-2 pl-10"
                            placeholder="Search payments by name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {filtersChanged && (
                            <button className="mr-10 py-1 px-3  text-center bg-green_ hover:bg-green-200 hover:text-color hover:font-bold rounded-lg text-md text-gray-700 mb-2" onClick={resetTable}>Reset</button>
                        )}

                    </div>

                    <div className="overflow-x-auto px-6 py-2">
                        <table className="w-full table-auto shadow-md bg-white rounded-md">
                            <thead className="text-gray-500">
                                <tr>
                                    <th className="pl-6 py-2 border-b border-white flex flex-col ">
                                        <label className="inline-flex items-center border-b border-white">

                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedIds?.length === payments?.length && payments?.length > 0}
                                                className="hidden"
                                            />
                                            <span className="relative flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full cursor-pointer">
                                                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                    <span className={`block w-6 h-6 rounded-full ${selectedIds?.length === payments?.length && payments?.length > 0 ? 'bg-green_' : 'bg-transparent'}`}></span>
                                                </span>
                                            </span>
                                        </label>

                                        {selectedIds?.length > 0 && (
                                            <div className="-ml-10 pt-1">
                                                <button
                                                    className="bg-red-300 hover:bg-red-600  px-1 py-1 text-white font-semibold  rounded ml-2 text-xs"
                                                    onClick={handleDeleteSelectedPayments}>
                                                    <DeleteIcon />
                                                </button>
                                            </div>

                                        )}
                                    </th>

                                    <th><div>No.</div></th>
                                    <th
                                        className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left cursor-pointer"
                                        onClick={() => sortPayments("fullName")}
                                    >
                                        <div className="flex flex-col">
                                            <div>Full Name</div>
                                            <div>
                                                {sortBy === "fullName" && (
                                                    <span>
                                                        {sortOrder === "asc"
                                                            ? " ▲ A-Z"
                                                            : sortOrder === "desc"
                                                                ? " ▼ Z-A"
                                                                : ""}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th className="px-7 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left">
                                        <div className="flex flex-col">
                                            <div className="cursor-pointer" onClick={() => sortPayments("receivedDate")}>Issue Date</div>
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
                                                        {Array.isArray(payments) && payments.length > 0 && Array.from(new Set(payments.map(payment => new Date(payment?.receivedDate).getFullYear())))
                                                            .map(year => (
                                                                <MenuItem key={year} value={year?.toString()}>{year}</MenuItem>
                                                            ))
                                                        }

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
                                                        {Array.isArray(payments) && payments.length > 0 && Array.from(new Set(payments.map(payment => new Date(payment?.receivedDate).getMonth() + 1)))
                                                            .map(month => (
                                                                <MenuItem key={month} value={month?.toString()}>{new Date(2000, month - 1)?.toLocaleString('default', { month: 'short' })}</MenuItem>
                                                            ))
                                                        }

                                                    </Select>

                                                </div>
                                            </div>
                                            <div>{sortBy === "receivedDate" && (
                                                <div>{sortOrder === "asc" ? "▲ Oldest" : sortOrder === "desc" ? "▼ Newest" : ""}</div>
                                            )}</div>
                                        </div>
                                    </th>


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
                                        <div onClick={() => sortPayments("amount")}>Amount</div>
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
                                        <div>{sortBy === "amount" && (
                                            <div>{sortOrder === "asc" ? " ▲Lowest" : sortOrder === "desc" ? " ▼Highest" : ""}</div>
                                        )}</div>


                                    </th>

                                    <th className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left">
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

                                            <MenuItem value="Late">Late</MenuItem>

                                            <MenuItem value="On Time">On Time</MenuItem>


                                        </Select>

                                    </th>
                                    <th className="pl-5 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left">
                                        Edit
                                    </th>
                                    <th className="py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left">
                                        More
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-200 border-t py-8">
                                {sortedPayment
                                    ?.filter(filterPaymentByAmountRange)
                                    ?.slice(startIndex, startIndex + itemsPerPage)
                                    ?.map((payments, index) => (
                                        <tr key={index} >
                                            <td className="px-6 py-2 border-b border-white">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleCheckboxChange(payments)}
                                                        checked={selectedIds.some((id) => id.hashId === payments.hashId)
                                                        }
                                                        className="hidden"
                                                    />
                                                    <span className="relative flex-shrink-0 w-6 h-6 border border-gray-300 rounded-full cursor-pointer">
                                                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                            <span className={`block w-4 h-4 rounded-full 
                                                            ${selectedIds?.some(item => item.hashId === payments.hashId)
                                                                    ? 'bg-green_'
                                                                    : 'bg-transparent'}
                                                            `}></span>
                                                        </span>
                                                    </span>
                                                </label>

                                            </td>
                                            <td className="px-4 py-2">
                                                {sortBy ? startIndex + index + 1 : startIndex + index + 1}
                                            </td>
                                            <td className="px-7 py-1 rounded text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                {payments?.fullName}
                                            </td>
                                            <td
                                                className="witespace-nowrap px-7 py-1 rounded text-xs sm:text-sm md:text-base text-balck_ lg:text-base xl:text-base"
                                            >
                                                {payments?.receivedDate}
                                            </td>
                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                {payments?.currency}
                                            </td>
                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                {new Intl.NumberFormat(undefined, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(payments?.amount)}
                                            </td>

                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                <span className={`h-2 w-4  inline-block mr-2 ${getIndicatorColor(payments?.status.toLowerCase())}`} />
                                                {payments?.status}
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    className={`text-gray-400 hover:text-gray-600 focus:outline-none border border-gray-300 rounded px-1 md:mr-1 md:px-2 ${payments.isRecent !== "Recent" ? 'hover:text-red-500' : ''}`}
                                                    onClick={() => editPayment(payments)}
                                                    onMouseEnter={payments?.isRecent !== "Recent" ? showPopup : null}
                                                    onMouseMove={payments?.isRecent !== "Recent" ? movePopup : null}
                                                    onMouseLeave={payments?.isRecent !== "Recent" ? hidePopup : null}>
                                                    {payments?.isRecent !== "Recent" ? <BlockIcon fontSize="small" className="hover:text-red-300" /> : <EditIcon fontSize="small" />}
                                                </button>
                                            </td>
                                            <td className="text-center ">
                                                <button
                                                    className="text-black_ px-2 hover:text-gray-900 focus:outline-none border border-gray-300 rounded-lg  text-3xl sm:text-sm md:text-base lg:text-base xl:text-base text-[100%]"
                                                    onClick={() => viewPayments(payments?.hashId)}>
                                                    &gt;
                                                </button>
                                            </td>
                                        </tr>
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
                                                <MenuItem value={"All"}>All</MenuItem>
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
                                                    Page {Math?.ceil((startIndex + 1) / itemsPerPage)} of{" "}
                                                    {Math?.ceil(sortedPayment?.length / itemsPerPage)}
                                                </div>
                                                <button
                                                    className="text-gray-black_ text-sm"
                                                    onClick={handleNext}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedPayment?.length
                                                    }>
                                                    <ArrowForwardIcon style={{ fontSize: 16 }} />
                                                </button>
                                                <button
                                                    className="text-gray-black_ text-lg"
                                                    onClick={handleLastPage}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedPayment?.length
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

export default PaymentList;