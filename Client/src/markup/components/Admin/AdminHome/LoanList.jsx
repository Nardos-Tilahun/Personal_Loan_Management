import { useEffect, useState } from "react";
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

const LoanList = ({ loans, onDeleteLoans }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedLoanIds] = useState([]);
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
            setItemsPerPage(loans.length);
        } else {
            setItemsPerPage(parseInt(newValue, 10));
        }
        setStartIndex(0);
    };

    const editLoan = (loans) => {
        if (loans.status === "Pending")
            navigate(`/admin/edit/Loan/${loans.hashId}`)
    };

    const viewLoans = (hashId) => {
        navigate(`/admin/Loan/${hashId}`)
    };


    const handleNext = () =>
        setStartIndex((prevIndex) => prevIndex + itemsPerPage);

    const handlePrevious = () =>
        setStartIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));

    const handleCheckboxChange = (loan) => {
        setSelectedLoanIds((prevIds) =>
            prevIds.some((id) => id.hashId === loan.hashId)
                ? prevIds.filter((id) => id.hashId !== loan.hashId)
                : [...prevIds, loan]
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
        if (selectedIds.length == loans.length) {
            setSelectedLoanIds([])
            setFiltersChanged(false);
        } else {
            setSelectedLoanIds(loans)
            setFiltersChanged(true);
        }
    };

    useEffect(() => {
        (selectedIds.length > 0) ?
            setFiltersChanged(true) :
            setFiltersChanged(false);
    }, [selectedIds])

    const handleSearchChange = (event) => setSearchTerm(event.target.value);

    const handleDeleteSelectedLoans = () => {
        let recentLoans = [];
        if (selectedIds.length > 0) {
            recentLoans = selectedIds.map((loan) => loan.status === "Pending")
        }
        if (!recentLoans?.includes(false)) {
            setConfirmMessage(`${`Are you sure you want to delete the selected loan?`}`);
            setDeleteConfirmation(selectedIds);
            setFiltersChanged(true);
        } else {
            setInfoMessage(`The selected Loan can't be deleted!
                <div class="text-black_"> 
                You can only delete <strong>Pending Loans</strong> </div> `);
            setInfoType('error');
            setShowInfoDialog(true);
            setStatus('error');
        }
    };
    const handleCancel = () => {
        setDeleteConfirmation(null);
    };
    const confirmDeleteLoan = async () => {
        setLoading(true)
        const loanHashIds = [];
        for (const selectedId of deleteConfirmation) {
            loanHashIds.push(selectedId.hashId);
        }
        try {
            if (loanHashIds.length > 0) {
                const tokenOnStorage = localStorage.getItem("user");
                const token = JSON.parse(tokenOnStorage);
                await deletedService.deletedLoan({ loanHashIds }, token.token);
            }
            setInfoMessage("Selected loan has successfully deleted!");
            setInfoType('success');
            setStatus("success")
            setShowInfoDialog(true)
            setLoading(false)
        } catch (error) {
            setInfoMessage("Can't delete the loan!");
            setInfoType('error');
            setStatus("error")
            setShowInfoDialog(true)
            setLoading(false)
        } finally {
            setSelectedLoanIds([]);
            setDeleteConfirmation(null);
        }
    }

    const handleCloseInfoDialog = () => {
        if (status == "success") {
            setShowInfoDialog(false);
            onDeleteLoans(selectedIds);
            setSelectedLoanIds([]);
            setDeleteConfirmation(null);
        } else {
            setShowInfoDialog(false);
        }
    };

    const filterLoanByAmountRange = (loans) => {
        const amount = loans?.amount;
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


    const filteredLoans = Array.isArray(loans) ?
        loans.filter((loan) =>
            loan?.fullName?.toLowerCase()?.includes(searchTerm.toLowerCase()) &&
            (filterByCurrency === "All" || loan.currency === filterByCurrency) &&
            (filterByType === "All" || loan.loansType === filterByType) &&
            (filterByStatus === "All" || loan.status === filterByStatus) &&
            (filterYear === "All" || new Date(loan.loanGivenDate).getFullYear().toString() === filterYear) &&
            (filterMonth === "All" || (new Date(loan.loanGivenDate).getMonth() + 1).toString() === filterMonth) &&
            (filterLoanByAmountRange(loan))
        ) : [];

    const sortLoans = (column) => {
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

    let sortedLoan = Array.isArray(filteredLoans) ? [...filteredLoans] : [];
    if (sortBy === "loanGivenDate") {
        sortedLoan = [...filteredLoans].sort((a, b) => {
            const dateA = new Date(a.loanGivenDate).getTime();
            const dateB = new Date(b.loanGivenDate).getTime();
            if (dateA < dateB) return sortOrder === "asc" ? -1 : 1;
            if (dateA > dateB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "amount") {
        sortedLoan = [...filteredLoans].sort((a, b) => {
            const amountA = a.amount;
            const amountB = b.amount;
            if (amountA < amountB) return sortOrder === "asc" ? -1 : 1;
            if (amountA > amountB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "Duration") {
        sortedLoan = [...filteredLoans].sort((a, b) => {
            const durationA = a.Duration;
            const durationB = b.Duration;
            if (durationA < durationB) return sortOrder === "asc" ? -1 : 1;
            if (durationA > durationB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "fullName") {
        sortedLoan = [...filteredLoans].sort((a, b) => {
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
        const totalPages = Math.ceil(sortedLoan.length / itemsPerPage);
        const lastPageStartIndex = Math.max(0, (totalPages - 1) * itemsPerPage);
        setStartIndex(lastPageStartIndex);
    };
    const resetTable = () => {
        setSearchTerm("");
        setItemsPerPage(10);
        setSelectedLoanIds([]);
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
            case 'terminated':
                return 'bg-lightcoral';
            case 'completed':
                return 'bg-lightblue';
            case 'late':
                return 'bg-lightsalmon';
            case 'late completed':
                return 'bg-blue-400';
            default:
                return '';
        }
    };

    return (
        <div>
            <main>
                <div className="flex-grow rounded-3xl mt-4 pb-8">
                    <div className="flex w-full justify-between">
                        <input
                            type="text"
                            className="w-full max-w-md rounded-md text-base text-gray-black_ outline-none border-none px-2 py-2 pl-10"
                            placeholder="Search loans by name..."
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
                                                checked={selectedIds?.length === loans?.length && loans?.length > 0}
                                                className="hidden"
                                            />
                                            <span className="relative flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full cursor-pointer">
                                                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                    <span className={`block w-6 h-6 rounded-full ${selectedIds?.length === loans?.length && loans?.length > 0 ? 'bg-green_' : 'bg-transparent'}`}></span>
                                                </span>
                                            </span>
                                        </label>

                                        {selectedIds.length > 0 && (
                                            <div className="-ml-10 pt-1">
                                                <button
                                                    className="bg-red-300 hover:bg-red-600  px-1 py-1 text-white font-semibold  rounded ml-2 text-xs"
                                                    onClick={handleDeleteSelectedLoans}>
                                                    <DeleteIcon />
                                                </button>
                                            </div>

                                        )}
                                    </th>

                                    <th><div>No.</div></th>
                                    <th
                                        className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left cursor-pointer"
                                        onClick={() => sortLoans("fullName")}
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
                                            <div className="cursor-pointer" onClick={() => sortLoans("loanGivenDate")}>Issue Date</div>
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

                                                        {Array.isArray(loans) && loans.length > 0 && Array.from(new Set(loans.map(loan => new Date(loan?.loanGivenDate).getFullYear())))
                                                            .map(year => (
                                                                <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
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
                                                        {Array.isArray(loans) && loans.length > 0 && Array.from(new Set(loans.map(loan => new Date(loan?.loanGivenDate).getMonth() + 1)))
                                                            .map(month => (
                                                                <MenuItem key={month} value={month.toString()}>{new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}</MenuItem>
                                                            ))
                                                        }

                                                    </Select>

                                                </div>
                                            </div>
                                            <div>{sortBy === "loanGivenDate" && (
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
                                        <div onClick={() => sortLoans("amount")}>Amount</div>
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
                                            <MenuItem value="Pending">Pending</MenuItem>
                                            <MenuItem value="Active">Active</MenuItem>
                                            <MenuItem value="Late">Late</MenuItem>
                                            <MenuItem value="Completed">Completed</MenuItem>
                                            <MenuItem value="Late Completed">Late Completed</MenuItem>
                                            <MenuItem value="Terminated">Terminated</MenuItem>


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

                                {sortedLoan
                                    .filter(filterLoanByAmountRange)
                                    .slice(startIndex, startIndex + itemsPerPage)
                                    .map((loans, index) => (
                                        <tr key={index} >
                                            <td className="px-6 py-2 border-b border-white">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleCheckboxChange(loans)}
                                                        checked={selectedIds.some((id) => id.hashId === loans.hashId)
                                                        }

                                                        className="hidden"
                                                    />
                                                    <span className="relative flex-shrink-0 w-6 h-6 border border-gray-300 rounded-full cursor-pointer">
                                                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                            <span className={`block w-4 h-4 rounded-full 
                                                            ${selectedIds?.some(item => item.hashId === loans.hashId)
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
                                                {loans.fullName}
                                            </td>
                                            <td
                                                className="cursor-pointer whitespace-nowrap px-7 py-1 rounded text-xs sm:text-sm md:text-base text-balck_ lg:text-base xl:text-base"
                                            >
                                                {loans?.loanGivenDate}
                                            </td>
                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                {loans?.currency}
                                            </td>
                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                {new Intl.NumberFormat(undefined, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(loans?.amount)}
                                            </td>

                                            <td className="px-7 py-1 rounded text-balck_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base">
                                                <span className={`h-2 w-4  inline-block mr-2 ${getIndicatorColor(loans?.status?.toLowerCase())}`} />
                                                {loans?.status}
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    className={`text-gray-400 hover:text-gray-600 focus:outline-none border border-gray-300 rounded px-1 md:mr-1 md:px-2 ${loans.status !== "Pending" ? 'hover:text-red-500' : ''}`}
                                                    onClick={() => editLoan(loans)}
                                                    onMouseEnter={loans.status !== "Pending" ? showPopup : null}
                                                    onMouseMove={loans.status !== "Pending" ? movePopup : null}
                                                    onMouseLeave={loans.status !== "Pending" ? hidePopup : null}>
                                                    {loans.status !== "Pending" ? <BlockIcon fontSize="small" className="hover:text-red-300" /> : <EditIcon fontSize="small" />}
                                                </button>

                                            </td>
                                            <td className="text-center ">
                                                <button
                                                    className="text-black_ px-2 hover:text-gray-900 focus:outline-none border border-gray-300 rounded-lg  text-3xl sm:text-sm md:text-base lg:text-base xl:text-base text-[100%]"
                                                    onClick={() => viewLoans(loans.hashId)}>
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
                                                    {Math.ceil(sortedLoan.length / itemsPerPage)}
                                                </div>
                                                <button
                                                    className="text-gray-black_ text-sm"
                                                    onClick={handleNext}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedLoan.length
                                                    }>
                                                    <ArrowForwardIcon style={{ fontSize: 16 }} />
                                                </button>
                                                <button
                                                    className="text-gray-black_ text-lg"
                                                    onClick={handleLastPage}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedLoan.length
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
                        <p className="text-red-300">You have payment under it.</p>
                    </div>
                </div>
            )}
            {deleteConfirmation !== null && (
                <ConfirmationPanel
                    message={confirmMessage}
                    onConfirm={confirmDeleteLoan}
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

export default LoanList;