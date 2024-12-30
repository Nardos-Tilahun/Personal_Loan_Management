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


const LoanPaymentList = ({ transaction, onDeleteTransaction }) => {

    const [startIndex, setStartIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [transactionType, setTransactionType] = useState([]);
    const [selectedLoanIds, setSelectedLoanIds] = useState([]);
    const [selectedPayIds, setSelectedPayIds] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [amountRangeFilter, setAmountRangeFilter] = useState("All");
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState("normal");
    const [filterByCurrency, setFilterByCurrency] = useState("All");
    const [filterByType, setFilterByType] = useState("All");
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
            setItemsPerPage(transaction.length);
        } else {
            setItemsPerPage(parseInt(newValue, 10));
        }
        setStartIndex(0);
    };

    const handleCancel = () => {
        setDeleteConfirmation(null);
    };

    const handleCloseInfoDialog = () => {
        if (status == "success") {
            setShowInfoDialog(false);
            onDeleteTransaction(deleteConfirmation);
            setSelectedLoanIds([]);
            setSelectedPayIds([]);
            setDeleteConfirmation(null);
        } else {
            setShowInfoDialog(false);
        }
    };


    const editTransaction = (transaction) => {
        if ((transaction?.transactionType === "Loan" && transaction.status === "Pending") || (transaction?.transactionType === "Payment" && transaction.isRecent === "Recent"))
            navigate(`/admin/edit/${transaction?.transactionType}/${transaction.hashId}`)
    };

    const viewTransaction = (hashId, type) => {
        navigate(`/admin/${type}/${hashId}`)
    };



    const handleNext = () =>
        setStartIndex((prevIndex) => prevIndex + itemsPerPage);

    const handlePrevious = () =>
        setStartIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));

    const handleCheckboxChange = (transaction) => {
        if (transaction.transactionType === "Loan") {
            setSelectedLoanIds((prevIds) =>
                prevIds.some((id) => id.hashId === transaction.hashId)
                    ? prevIds.filter((id) => id.hashId !== transaction.hashId)
                    : [...prevIds, transaction]
            );
        } else {
            setSelectedPayIds((prevIds) =>
                prevIds.some((id) => id.hashId === transaction.hashId)
                    ? prevIds.filter((id) => id.hashId !== transaction.hashId)
                    : [...prevIds, transaction]
            );
        }
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

    const handleFilterByTypeChange = (event) => {
        const newValue = event.target.value;
        setFilterByType(newValue);
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
        if (selectedLoanIds.length + selectedPayIds.length === transaction.length) {
            setSelectedLoanIds([]);
            setSelectedPayIds([]);
            setFiltersChanged(false);
        } else {
            setSelectedLoanIds(transaction.filter((t) => t.transactionType === "Loan"));
            setSelectedPayIds(transaction.filter((t) => t.transactionType === "Payment"));
            setFiltersChanged(true);
        }
    };

    useEffect(() => {
        (selectedLoanIds.length > 0 || selectedPayIds.length > 0) ?
            setFiltersChanged(true) :
            setFiltersChanged(false);
    }, [selectedLoanIds, selectedPayIds])

    const handleSearchChange = (event) => setSearchTerm(event.target.value);

    const handleDeleteSelectedTransactions = () => {
        let recentLoans = [], recentPayments = [];
        if (selectedLoanIds.length > 0 || selectedPayIds.length > 0) {
            if (selectedPayIds.length > 0) {
                recentPayments = selectedPayIds.map((pay) => pay.isRecent === "Recent")
            }
            if (selectedLoanIds.length > 0) {
                recentLoans = selectedLoanIds.map((loan) => loan.status === "Pending")
            }


            if (!(recentPayments?.includes(false) || recentLoans?.includes(false))) {
                setConfirmMessage(`${`Are you sure you want to delete the selected transaction?`}`);
                setDeleteConfirmation([...selectedLoanIds, ...selectedPayIds]);
                setFiltersChanged(true);
            } else {
                setInfoMessage(`The selected transaction can't be deleted!
                <div class="text-black_"> Note: - You can only delete 
                <strong>pending loans</strong> or <strong>recent payments</strong> </div> `);

                setInfoType('error');
                setShowInfoDialog(true);
                setStatus('error');
            }

        }
    };



    const confirmDeleteTransaction = async () => {
        setLoading(true)

        const loanHashIds = [];
        const paymentHashIds = [];
        for (const selectedId of deleteConfirmation) {
            if (selectedId.transactionType === "Loan") {
                loanHashIds.push(selectedId.hashId);
            } else {
                paymentHashIds.push(selectedId.hashId);
            }
        }

        try {
            const tokenOnStorage = localStorage.getItem("user");
            const token = JSON.parse(tokenOnStorage);
            if (loanHashIds.length > 0) {
                await deletedService.deletedLoan({ loanHashIds }, token.token);
            }
            if (paymentHashIds.length > 0) {
                await deletedService.deletedPayment({ paymentHashIds }, token.token);
            }
            setInfoMessage("Selected transaction has successfully deleted!");
            setInfoType('success');
            setStatus("success")
            setShowInfoDialog(true)
            setLoading(false)
        } catch (error) {
            setInfoMessage("Can't delete the transaction!");
            setInfoType('error');
            setStatus("error")
            navigate("/500");
            setShowInfoDialog(true)
            setLoading(false)
        }
    };


    const filterTransactionByAmountRange = (transaction) => {
        const amount = transaction?.amount;
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

    const filteredLoans = transaction?.filter((transaction) =>
        transaction?.fullName.toLowerCase()?.includes(searchTerm?.toLowerCase()) &&
        (filterByCurrency === "All" || transaction?.currency === filterByCurrency) &&
        (filterByType === "All" || transaction?.transactionType === filterByType) &&
        (filterByStatus === "All" || transaction?.status === filterByStatus) &&
        (filterYear === "All" || new Date(transaction?.issueDate).getFullYear().toString() === filterYear) &&
        (filterMonth === "All" || (new Date(transaction?.issueDate).getMonth() + 1).toString() === filterMonth) &&
        (filterTransactionByAmountRange(transaction))
    );

    const sortTransactions = (column) => {
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

    let sortedTransaction = [...filteredLoans];
    if (sortBy === "issueDate") {
        sortedTransaction = [...filteredLoans].sort((a, b) => {
            const dateA = new Date(a.issueDate).getTime();
            const dateB = new Date(b.issueDate).getTime();
            if (dateA < dateB) return sortOrder === "asc" ? -1 : 1;
            if (dateA > dateB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "amount") {
        sortedTransaction = [...filteredLoans].sort((a, b) => {
            const amountA = a.amount;
            const amountB = b.amount;
            if (amountA < amountB) return sortOrder === "asc" ? -1 : 1;
            if (amountA > amountB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "Duration") {
        sortedTransaction = [...filteredLoans].sort((a, b) => {
            const durationA = a.Duration;
            const durationB = b.Duration;
            if (durationA < durationB) return sortOrder === "asc" ? -1 : 1;
            if (durationA > durationB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "fullName") {
        sortedTransaction = [...filteredLoans].sort((a, b) => {
            const fullNameA = a.fullName.toLowerCase();
            const fullNameB = b.fullName.toLowerCase();
            if (fullNameA < fullNameB) return sortOrder === "asc" ? -1 : 1;
            if (fullNameA > fullNameB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }

    const handleFirstPage = () => {
        setStartIndex(0);
    };

    const handleLastPage = () => {
        const totalPages = Math.ceil(sortedTransaction.length / itemsPerPage);
        const lastPageStartIndex = Math.max(0, (totalPages - 1) * itemsPerPage);
        setStartIndex(lastPageStartIndex);
    };
    const resetTable = () => {
        setSearchTerm("");
        setItemsPerPage(10);
        setTransactionType([]);
        setSelectedLoanIds([]);
        setSelectedPayIds([]);
        setDeleteConfirmation(null);
        setAmountRangeFilter("All");
        setSortBy(null);
        setSortOrder("normal");
        setFilterByCurrency("All");
        setFilterByType("All");
        setFilterByStatus("All");
        setFilterYear("All");
        setFilterMonth("All");
        setFiltersChanged(false);
    };

    const getIndicatorColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-lightyellow';
            case 'active':
                return 'bg-lightgreen';
            case 'on time':
                return 'bg-lightgreen';
            case 'terminated':
                return 'bg-lightcoral';
            case 'completed':
                return 'bg-lightblue';
            case 'late':
                return 'bg-lightsalmon';
            default:
                return '';
        }
    };

    return (
        <div className="" >
            <main>
                <div className="flex-grow rounded-3xl mt-4 pb-8">
                    <div className="flex w-full justify-between">
                        <div className="pl-10 text-lg font-semibold pb-4">Latest Transaction</div>
                        {filtersChanged && (
                            <button className="mr-10 py-1 px-3  text-center bg-green_ hover:bg-green-200 hover:text-color hover:font-bold rounded-lg text-md text-gray-700 mb-2" onClick={resetTable}>Reset</button>
                        )}

                    </div>
                    <input
                        type="text"
                        className="w-full max-w-md rounded-md text-base text-gray-black_ outline-none border-none px-2 py-2 pl-10"
                        placeholder="Search transaction by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <div className="overflow-x-auto px-6 py-2">
                        <table className="w-full table-auto shadow-md bg-white rounded-md">
                            <thead className="text-gray-500">
                                <tr>
                                    <th className="pl-6 py-2 border-b border-white flex flex-col ">
                                        <label className="inline-flex items-center border-b border-white">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedLoanIds.length + selectedPayIds.length === transaction.length && transaction.length > 0}
                                                className="hidden"
                                            />
                                            <span className="relative flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full cursor-pointer">
                                                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                    <span className={`block w-6 h-6 rounded-full ${selectedLoanIds.length + selectedPayIds.length === transaction.length && transaction.length > 0 ? 'bg-green_' : 'bg-transparent'}`}></span>
                                                </span>
                                            </span>
                                        </label>
                                        {(selectedLoanIds.length + selectedPayIds.length) > 0 && (
                                            <div className="-ml-7 pt-1">
                                                <button
                                                    className="bg-red-300 hover:bg-red-600  px-1 py-1 text-white font-semibold  rounded ml-2 text-xs"
                                                    onClick={handleDeleteSelectedTransactions}>
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        )}
                                    </th>

                                    <th><div>No.</div></th>
                                    <th
                                        className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left cursor-pointer"
                                        onClick={() => sortTransactions("fullName")}
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
                                            <div className="cursor-pointer" onClick={() => sortTransactions("issueDate")}>Issue Date</div>
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
                                                        {Array.from(new Set(transaction.map(transaction => new Date(transaction.issueDate).getFullYear()))).map(year => (
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
                                                        {Array.from(new Set(transaction.map(transaction => new Date(transaction.issueDate).getMonth() + 1))).map(month => (
                                                            <MenuItem key={month} value={month.toString()}>{new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}</MenuItem>
                                                        ))}
                                                    </Select>

                                                </div>
                                            </div>
                                            <div>{sortBy === "issueDate" && (
                                                <div>{sortOrder === "asc" ? "▲ Oldest" : sortOrder === "desc" ? "▼ Newest" : ""}</div>
                                            )}</div>
                                        </div>
                                    </th>

                                    <th className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left ">
                                        <div>Type</div>
                                        <Select
                                            value={filterByType}
                                            onChange={handleFilterByTypeChange}
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
                                            <MenuItem value="Payment">Payment</MenuItem>
                                            <MenuItem value="Loan">Loan</MenuItem>

                                        </Select>
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
                                        <div onClick={() => sortTransactions("amount")}>Amount</div>
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
                                            <MenuItem value="Pending">Pending</MenuItem>
                                            <MenuItem value="Active">Active</MenuItem>
                                            <MenuItem value="Late">Late</MenuItem>
                                            <MenuItem value="Completed">Completed</MenuItem>
                                            <MenuItem value="Terminated">Terminated</MenuItem>
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
                                {sortedTransaction
                                    .filter(filterTransactionByAmountRange)
                                    .slice(startIndex, startIndex + itemsPerPage)
                                    .map((transaction, index) => (
                                        <tr key={index} >

                                            <td className="px-6 py-2 border-b border-white">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleCheckboxChange(transaction)}
                                                        checked={transaction.transactionType === "Loan"
                                                            ? selectedLoanIds.some((id) => id.hashId === transaction.hashId)
                                                            : selectedPayIds.some((id) => id.hashId === transaction.hashId)
                                                        }
                                                        className="hidden"
                                                    />
                                                    <span className="relative flex-shrink-0 w-6 h-6 border border-gray-300 rounded-full cursor-pointer">
                                                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                            <span className={`block w-4 h-4 rounded-full ${transaction.transactionType === "Loan"
                                                                ? selectedLoanIds.some(item => item.hashId === transaction.hashId)
                                                                    ? 'bg-green_'
                                                                    : 'bg-transparent'
                                                                : selectedPayIds.some(item => item.hashId === transaction.hashId)
                                                                    ? 'bg-green_'
                                                                    : 'bg-transparent'}`}></span>
                                                        </span>
                                                    </span>
                                                </label>

                                            </td>
                                            <td className="px-4 py-2">
                                                {sortBy ? startIndex + index + 1 : startIndex + index + 1}
                                            </td>
                                            <td className="px-7 py-1 rounded text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                {transaction.fullName}
                                            </td>
                                            <td
                                                className="cursor-pointer whitespace-nowrap px-7 py-1 rounded text-xs sm:text-sm md:text-base text-balck_ lg:text-base xl:text-base"
                                                onClick={() => viewTransaction(transaction?.hashId, transaction?.transactionType)}>
                                                {transaction?.issueDate}
                                            </td>

                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                {transaction?.transactionType}
                                            </td>
                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                {transaction?.currency}
                                            </td>
                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                {new Intl.NumberFormat(undefined, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(transaction?.amount)}
                                            </td>

                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                <span className={`h-2 w-4  inline-block mr-2 ${getIndicatorColor(transaction?.status?.toLowerCase())}`} />
                                                {transaction?.status}
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    className={`text-gray-400 hover:text-gray-600 focus:outline-none border border-gray-300 rounded px-1 md:mr-1 md:px-2 ${((transaction?.transactionType === "Loan" && transaction.status !== "Pending") || (transaction?.transactionType === "Payment" && transaction.isRecent !== "Recent")) !== "Recent" ? 'hover:text-red-500' : ''}`}
                                                    onClick={() => editTransaction(transaction)}
                                                    onMouseEnter={((transaction?.transactionType === "Loan" && transaction.status !== "Pending") || (transaction?.transactionType === "Payment" && transaction.isRecent !== "Recent")) ? showPopup : null}
                                                    onMouseMove={((transaction?.transactionType === "Loan" && transaction.status !== "Pending") || (transaction?.transactionType === "Payment" && transaction.isRecent !== "Recent")) ? movePopup : null}
                                                    onMouseLeave={((transaction?.transactionType === "Loan" && transaction.status !== "Pending") || (transaction?.transactionType === "Payment" && transaction.isRecent !== "Recent")) ? hidePopup : null}>
                                                    {((transaction?.transactionType === "Loan" && transaction.status !== "Pending") || (transaction?.transactionType === "Payment" && transaction.isRecent !== "Recent")) ? <BlockIcon fontSize="small" className="hover:text-red-300" /> : <EditIcon fontSize="small" />}
                                                </button>
                                                {/* <button
                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none border border-gray-300 rounded px-1 md:mr-1 md:px-2 text-[100%]"
                                                    onClick={() => editTransaction(transaction.hashId, transaction?.transactionType)}>
                                                    <EditIcon fontSize="small" />
                                                </button> */}
                                            </td>
                                            <td className="text-center ">
                                                <button
                                                    className="text-black_ px-2 hover:text-gray-900 focus:outline-none border border-gray-300 rounded-lg  text-[100%] sm:text-sm md:text-base lg:text-base xl:text-base"
                                                    onClick={() => viewTransaction(transaction.hashId, transaction?.transactionType)}>
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
                                                    Page {Math.ceil((startIndex + 1) / itemsPerPage)} of{" "}
                                                    {Math.ceil(sortedTransaction.length / itemsPerPage)}
                                                </div>
                                                <button
                                                    className="text-gray-black_ text-sm"
                                                    onClick={handleNext}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedTransaction.length
                                                    }>
                                                    <ArrowForwardIcon style={{ fontSize: 16 }} />
                                                </button>
                                                <button
                                                    className="text-gray-black_ text-lg"
                                                    onClick={handleLastPage}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedTransaction.length
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
                        <p className="text-red-300">Not Recent Payment or Loan</p>
                    </div>
                </div>
            )}
            {deleteConfirmation !== null && (
                <ConfirmationPanel
                    message={confirmMessage}
                    onConfirm={confirmDeleteTransaction}
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
            {/* {deleteConfirmation !== null && (
                <div className="z-50 inset-0 fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-8 max-w-md">
                        <h2 className="text-xl  text_center font-semibold mb-4">
                            Are you sure you want to delete the selected transaction?
                        </h2>
                        <div className="flex justify-between">
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                onClick={confirmDeleteTransaction}>
                                Delete
                            </button>
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                onClick={() => setDeleteConfirmation(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
}

export default LoanPaymentList;