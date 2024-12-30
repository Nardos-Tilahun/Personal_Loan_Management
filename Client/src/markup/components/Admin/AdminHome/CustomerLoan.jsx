import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from "@mui/icons-material/DeleteForever";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "../../../../Contexts/useHook"
import deletedService from "../../../../services/delete.service";
import ConfirmationPanel from "../../../../util/ConfirmationPage";
import InfoDialog from "../../../../util/InformationPage";

const CustomerLoan = ({ loans, onDeleteCustomers }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedLoanIds, setSelectedLoanIds] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [amountRangeFilter, setAmountRangeFilter] = useState("All");
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState("normal");
    const [filterByCurrency, setFilterByCurrency] = useState("All");
    const [filterByPeriod, setFilterByPeriod] = useState("All");
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
    const { user } = useAuth();
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
        setItemsPerPage(newValue === "All" ? loans.length : parseInt(newValue, 10));
        setStartIndex(0);
    };

    const editLoan = (loan) => {
        if (user.userRoleId === 1) {
            if (loan.status === "Pending")
                navigate(`/admin/edit/Loan/${loan.LoanHashID}`)
        }
        else
            navigate(`/customer/edit/Loan/${loan.LoanHashID}`)
    }
    const viewLoan = (hashId) => {
        if (user.userRoleId === 1)
            navigate(`/admin/Loan/${hashId}`)
        else
            navigate(`/customer/Loan/${hashId}`)
    };

    const handleNext = () =>
        setStartIndex((prevIndex) => prevIndex + itemsPerPage);

    const handlePrevious = () =>
        setStartIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));

    const handleCheckboxChange = (loan) => {
        setSelectedLoanIds((prevIds) =>
            prevIds.some((id) => id.LoanHashID === loan.LoanHashID)
                ? prevIds.filter((id) => id.LoanHashID !== loan.LoanHashID)
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
    const handleFilterByPeriodChange = (event) => {
        const newValue = event.target.value;
        setFilterByPeriod(newValue);
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
        if (selectedLoanIds.length == loans.length) {
            setSelectedLoanIds([])
            setFiltersChanged(false);
        } else {
            setSelectedLoanIds(loans)
            setFiltersChanged(true);
        }
    };

    useEffect(() => {
        (selectedLoanIds.length > 0) ?
            setFiltersChanged(true) :
            setFiltersChanged(false);
    }, [selectedLoanIds])

    const handleCancel = () => {
        setDeleteConfirmation(null);
    };
    const confirmDeleteLoan = async () => {
        setLoading(true)
        const loanHashIds = [];
        for (const selectedId of deleteConfirmation) {
            loanHashIds.push(selectedId.LoanHashID);
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
            navigate("/500");
            setShowInfoDialog(true)
            setLoading(false)
        } finally {
            setSelectedLoanIds([]);
            setDeleteConfirmation(null);
        }
    }

    const handleCloseInfoDialog = () => {
        if (status == "success") {
            onDeleteCustomers(selectedLoanIds);
            setShowInfoDialog(false);
            setSelectedLoanIds([]);
            setDeleteConfirmation(null);
        } else {
            setShowInfoDialog(false);
        }
    };


    const handleDeleteSelectedLoans = () => {
        let recentLoans = [];
        if (selectedLoanIds.length > 0) {
            recentLoans = selectedLoanIds.map((loan) => loan.status === "Pending")
        }
        if (!recentLoans?.includes(false)) {
            setConfirmMessage(`${`Are you sure you want to delete the selected loan?`}`);
            setDeleteConfirmation(selectedLoanIds);
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


    const filterLoansByAmountRange = (loans) => {
        const amount = loans?.LoanAmount;
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

    const filteredLoans = Array.isArray(loans) && loans.filter((loan) =>
        (filterByCurrency === "All" || loan.LoanCurrency === filterByCurrency) &&
        (filterByPeriod === "All" || loan.Period === filterByPeriod) &&
        (filterByStatus === "All" || loan.status === filterByStatus) &&
        (filterYear === "All" || new Date(loan.StartDate).getFullYear().toString() === filterYear) &&
        (filterMonth === "All" || (new Date(loan.StartDate).getMonth() + 1).toString() === filterMonth) &&
        (filterLoansByAmountRange(loan))
    );
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

    let sortedLoans = Array.isArray(filteredLoans) ? [...filteredLoans] : [];
    if (sortBy === "StartDate") {
        sortedLoans = [...filteredLoans].sort((a, b) => {
            const dateA = new Date(a.StartDate).getTime();
            const dateB = new Date(b.StartDate).getTime();
            if (dateA < dateB) return sortOrder === "asc" ? -1 : 1;
            if (dateA > dateB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "Amount") {
        sortedLoans = [...filteredLoans].sort((a, b) => {
            const amountA = a.LoanAmount;
            const amountB = b.LoanAmount;
            if (amountA < amountB) return sortOrder === "asc" ? -1 : 1;
            if (amountA > amountB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "Term") {
        sortedLoans = [...filteredLoans].sort((a, b) => {
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
        const totalPages = Math.ceil(sortedLoans.length / itemsPerPage);
        const lastPageStartIndex = Math.max(0, (totalPages - 1) * itemsPerPage);
        setStartIndex(lastPageStartIndex);
    };
    const resetTable = () => {
        setItemsPerPage(10);
        setSelectedLoanIds([]);
        setDeleteConfirmation(null);
        setAmountRangeFilter("All");
        setSortBy(null);
        setSortOrder("normal");
        setFilterByCurrency("All");
        setFilterByPeriod("All");
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
            case 'closed':
                return 'bg-lightblue';
            case 'late':
                return 'bg-lightsalmon';
            default:
                return '';
        }
    };

    return (
        <div >
            <main>
                <div className="flex-grow py-8">
                    <div className="flex w-full justify-between">
                        <div className="pl-10 text-lg font-semibold pb-4">All Loan Statuses for this Customer</div>
                        {filtersChanged && (
                            <button className="mr-10 py-1 px-3 text-center bg-green_ hover:bg-green-200 hover:text-color hover:font-bold rounded-lg text-md text-gray-700 mb-2" onClick={resetTable}>Reset</button>
                        )}

                    </div>
                    <div className="overflow-x-auto px-6 py-2">
                        <table className="w-full table-auto  bg-white  rounded-3xl ">
                            <thead className="text-gray-500">
                                <tr>
                                    {user.userRoleId == 1 && <th className="px-3 py-2 border-b border-white  text-center flex flex-col ">
                                        <label className="inline-flex items-center border-b border-white">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedLoanIds?.length === loans?.length && loans?.length > 0}
                                                className="hidden"
                                            />

                                            <span className="relative flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full cursor-pointer">
                                                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                    <span className={`block w-6 h-6 rounded-full ${selectedLoanIds?.length === loans?.length && loans?.length > 0 ? 'bg-green_' : 'bg-transparent'}`}></span>

                                                </span>
                                            </span>
                                        </label>

                                        {selectedLoanIds.length > 0 && (
                                            <div className="-ml-7 pt-1">
                                                <button
                                                    className="bg-red-300 hover:bg-red-600  px-1 py-1 text-white font-semibold  rounded ml-2 text-xs"
                                                    onClick={handleDeleteSelectedLoans}>
                                                    <DeleteIcon />
                                                </button>
                                            </div>

                                        )}
                                    </th>}

                                    <th className="px-3 text-center"><div >No.</div></th>
                                    <th className=" text-center"> <div>Currency</div>
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
                                    <th className=" px-3 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base  text-center cursor-pointer">
                                        <div onClick={() => sortLoans("Amount")}>Amount</div>
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
                                    <th className="px-3 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base  text-center">
                                        <div className="flex flex-col">
                                            <div className="cursor-pointer" onClick={() => sortLoans("StartDate")}>Loan Given Date</div>
                                            <div className="flex mx-auto">
                                                <div className="relative ">
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
                                                        {Array.from(new Set(loans?.map(loan => new Date(loan?.StartDate).getFullYear()))).map(year => (
                                                            <MenuItem key={year} value={year?.toString()}>{year}</MenuItem>
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
                                                        {Array.from(new Set(loans?.map(loan => new Date(loan?.StartDate).getMonth() + 1))).map(month => (
                                                            <MenuItem key={month} value={month.toString()}>{new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}</MenuItem>
                                                        ))}
                                                    </Select>

                                                </div>
                                            </div>
                                            <div>{sortBy === "StartDate" && (
                                                <div>{sortOrder === "asc" ? "▲ Oldest" : sortOrder === "desc" ? "▼ Newest" : ""}
                                                </div>
                                            )}</div>
                                        </div>
                                    </th>
                                    <th
                                        className=" px-3 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base  text-center cursor-pointer"
                                        onClick={() => sortLoans("Term")}>
                                        <div className="flex flex-col">
                                            <div>Term</div>

                                            <div>{sortBy === "Term" && (
                                                <span>{sortOrder === "asc" ? "▲Shortest" : sortOrder === "desc" ? "▼Longest" : ""}</span>
                                            )}</div>
                                        </div>
                                    </th>
                                    <th className=" px-3 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base  text-center ">
                                        <div>Period</div>
                                        <Select
                                            value={filterByPeriod}
                                            onChange={handleFilterByPeriodChange}
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
                                            <MenuItem value="week">Weekly</MenuItem>
                                            <MenuItem value="bi-week">Bi-Weekly</MenuItem>
                                            <MenuItem value="month">Monthly</MenuItem>
                                            <MenuItem value="half-year">Semi-Annually</MenuItem>
                                            <MenuItem value="year">Annually</MenuItem>

                                        </Select>
                                    </th>
                                    <th className=" px-3 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base  text-center ">
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
                                    {user.userRoleId === 1 && <th className=" px-3 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base  text-center">
                                        Edit
                                    </th>}
                                    <th className=" px-3 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base  text-center">
                                        {user.userRoleId === 1 ? "Detail" : "More"}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-200 border-t py-8">
                                {sortedLoans
                                    .filter(filterLoansByAmountRange)
                                    .slice(startIndex, startIndex + itemsPerPage)
                                    .map((loan, index) => (
                                        <tr key={index} >

                                            {user.userRoleId == 1 && <td className=" py-2 border-b border-white text-center">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleCheckboxChange(loan)}
                                                        
                                                        checked={selectedLoanIds.some((id) => id.LoanHashID === loan.LoanHashID)
                                                        }
                                                        className="hidden"
                                                    />

                                                    <span className="relative flex-shrink-0 w-6 h-6 border border-gray-300 rounded-full cursor-pointer">
                                                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                            {/* <span className={`block w-4 h-4 rounded-full ${selectedLoanIds.includes(loan.LoanHashID) ? 'bg-green_' : 'bg-transparent'}`}></span> */}
                                                            <span className={`block w-4 h-4 rounded-full 
                                                            ${selectedLoanIds?.some(item => item.LoanHashID === loan.LoanHashID)
                                                                    ? 'bg-green_'
                                                                    : 'bg-transparent'}
                                                            `}></span>
                                                        </span>
                                                    </span>
                                                </label>

                                            </td>}
                                            <td className=" px-2 py-2 text-center">
                                                {sortBy ? startIndex + index + 1 : startIndex + index + 1}
                                            </td>
                                            <td className=" px-2 py-2 rounded text-black_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-center">
                                                {loan?.LoanCurrency}
                                            </td>
                                            <td className=" px-2 py-2 rounded text-black_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-center">
                                                {new Intl.NumberFormat(undefined, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(loan?.LoanAmount)}
                                            </td>
                                            <td
                                                className=" px-2 py-2 rounded text-xs sm:text-sm md:text-base text-black_ lg:text-base xl:text-base text-center"
                                            >
                                                {loan?.StartDate}
                                            </td>
                                            <td className="px-2 py-2 rounded text-black_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-center">
                                                {loan?.Term}
                                            </td>
                                            <td className=" px-2 py-2 rounded text-black_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-center">
                                                {`${loan?.Period}${loan?.Term ? "s" : ""}`}
                                            </td>

                                            <td className="px-2 py-2 rounded text-black_ text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-center">
                                                <span className={`h-2 w-4  inline-block mr-2 ${getIndicatorColor(loan?.status.toLowerCase())}`} />
                                                {loan?.status}
                                            </td>
                                            {user.userRoleId === 1 && <td className=" px-2 py-2 text-center">
                                                <button
                                                    className={`text-gray-400 hover:text-gray-600 focus:outline-none border border-gray-300 rounded px-1 md:mr-1 md:px-2 ${loan.status !== "Pending" ? 'hover:text-red-500' : ''}`}
                                                    onClick={() => editLoan(loan)}
                                                    onMouseEnter={loan.status !== "Pending" ? showPopup : null}
                                                    onMouseMove={loan.status !== "Pending" ? movePopup : null}
                                                    onMouseLeave={loan.status !== "Pending" ? hidePopup : null}>
                                                    {loan.status !== "Pending" ? <BlockIcon fontSize="small" className="hover:text-red-300" /> : <EditIcon fontSize="small" />}
                                                </button>
                                                {/* <button
                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none border border-gray-300 rounded px-1 md:mr-1 md:px-2"
                                                    onClick={() => editLoan(loan.LoanHashID)}>
                                                    <EditIcon fontSize="small" />
                                                </button> */}
                                            </td>}
                                            <td className=" px-2 py-2 text-center">
                                                <button
                                                    className="text-black_ px-2 hover:text-gray-900 focus:outline-none border border-gray-300 rounded-lg  text-xs sm:text-sm md:text-base lg:text-base xl:text-base"
                                                    onClick={() => viewLoan(loan.LoanHashID)}>
                                                    {user.userRoleId === 1 ? `` : "Detail -"}&gt;
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
                                                    {Math.ceil(sortedLoans.length / itemsPerPage)}
                                                </div>
                                                <button
                                                    className="text-gray-black_ text-sm"
                                                    onClick={handleNext}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedLoans?.length
                                                    }>
                                                    <ArrowForwardIcon style={{ fontSize: 16 }} />
                                                </button>
                                                <button
                                                    className="text-gray-black_ text-lg"
                                                    onClick={handleLastPage}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedLoans.length
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
            {/* {deleteConfirmation !== null && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-8 max-w-md">
                        <h2 className="text-xl  text_center font-semibold mb-4">
                            Are you sure you want to delete the selected loan?
                        </h2>
                        <div className="flex justify-between">
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                onClick={confirmDeleteLoan}>
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

export default CustomerLoan;