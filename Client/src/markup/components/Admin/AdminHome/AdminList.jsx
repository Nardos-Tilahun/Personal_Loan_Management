import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Select, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteForever";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AdminInfo from "./AdminInfo";
import ProfileImage from "../../../../util/profileImage";
import ConfirmationPanel from "../../../../util/ConfirmationPage";
import InfoDialog from "../../../../util/InformationPage";
import deletedService from "../../../../services/delete.service";

const AdminList = ({ adminData, onDeleteAdmins }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedAdminIds] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState("normal");
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
    const [detailVisibility, setDetailVisibility] = useState([false]);



    const allVisible = detailVisibility.every((value) => value === true);
    const controlAllDetail = () => {
        if (allVisible) {
            setDetailVisibility([false]);
            setFiltersChanged(false);
        } else {
            setDetailVisibility(Array(adminData.length).fill(true))
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
        if (newValue === "All") {
            setItemsPerPage(adminData.length);
        } else {
            setItemsPerPage(parseInt(newValue, 10));
        }
        setStartIndex(0);
    };


    const editUser = (hashId) => {

        navigate(`/admin/edit/user/${hashId}`)
    };

    const viewDetailAdmin = (index) => {
        toggleDetail(index);
    };


    const handleNext = () =>
        setStartIndex((prevIndex) => prevIndex + itemsPerPage);

    const handlePrevious = () =>
        setStartIndex((prevIndex) => Math.max(0, prevIndex - itemsPerPage));

    const handleCheckboxChange = (userId) => {
        setSelectedAdminIds((prevIds) =>
            prevIds.includes(userId)
                ? prevIds.filter((id) => id !== userId)
                : [...prevIds, userId]
        );
    };



    const handleYearFilterChange = (event) => {
        setFilterYear(event.target.value);
        setFiltersChanged(true);
    };
    const handleMonthFilterChange = (event) => {
        setFilterMonth(event.target.value);
        setFiltersChanged(true);
    };


    const handleSelectAll = () => {
        if (!Array.isArray(adminData)) return;
        setSelectedAdminIds((prevIds) =>
            prevIds.length === adminData.length ? [] : adminData.map((adminData, index) => adminData.hashId)
        );
        setFiltersChanged(true);
    };

    const handleSearchChange = (event) => setSearchTerm(event.target.value);

    const handleDeleteSelectedAdmins = () => {
        if (selectedIds.length > 0) {
            setConfirmMessage(`${`Are you sure you want to delete the selected Admin?`}`);
            setDeleteConfirmation(selectedIds);
            setFiltersChanged(true);
        } else {
            setShowInfoDialog(true);
        }
    };

    useEffect(() => {
        (selectedIds.length > 0) ?
            setFiltersChanged(true) :
            setFiltersChanged(false);
    }, [selectedIds])

    const handleCloseInfoDialog = () => {
        if (status === "success") {
            setShowInfoDialog(false);
            onDeleteAdmins(selectedIds);
            setSelectedAdminIds([]);
            setDeleteConfirmation(null);
        } else {
            setShowInfoDialog(false);
        }
    };


    const confirmDeleteAdmins = async () => {
        setLoading(true)
        try {
            if (deleteConfirmation.length > 0) {
                const tokenOnStorage = localStorage.getItem("user");
                const token = JSON.parse(tokenOnStorage);
                if (tokenOnStorage) {
                    const decodedToken = jwtDecode(tokenOnStorage);
                    if (decodedToken.userHashId == selectedIds) {
                        setInfoMessage(`${`Error: - You are can't delete yourself!`}`);
                        setInfoType('error');
                        setStatus("error")
                        setShowInfoDialog(true)
                        setLoading(false)
                        return;
                    }
                } else {
                    
                }

                await deletedService.deletedUser({ selectedIds }, token.token);
            }
            setInfoMessage("Selected admin has successfully deleted!");
            setInfoType('success');
            setStatus("success")
            setShowInfoDialog(true)
            setLoading(false)
        } catch (error) {
            setInfoMessage("Sorry, Couldn't delete the admin!");
            setInfoType('error');
            setStatus("error")
            navigate("/500");
            setShowInfoDialog(true)
            setLoading(false)
            return;
        } finally {
            setSelectedAdminIds([]);
            setDeleteConfirmation(null);
        }
    };

    const handleCancel = () => {
        setDeleteConfirmation(null);
    };

    const filteredAdmins = Array.isArray(adminData) ? adminData.filter((admin) =>
        (admin.fullName.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase()?.includes(searchTerm.toLowerCase())) &&
        (filterYear === "All" || new Date(admin.createdDate).getFullYear().toString() === filterYear) &&
        (filterMonth === "All" || (new Date(admin.createdDate).getMonth() + 1).toString() === filterMonth)
    ) : [];

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

    let sortedAdminData = [...filteredAdmins];
    if (sortBy === "createdDate") {
        sortedAdminData = [...filteredAdmins].sort((a, b) => {
            const dateA = new Date(a.createdDate).getTime();
            const dateB = new Date(b.createdDate).getTime();
            if (dateA < dateB) return sortOrder === "asc" ? -1 : 1;
            if (dateA > dateB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "fullName") {
        sortedAdminData = [...filteredAdmins].sort((a, b) => {
            const fullNameA = a.fullName;
            const fullNameB = b.fullName;
            if (fullNameA < fullNameB) return sortOrder === "asc" ? -1 : 1;
            if (fullNameA > fullNameB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    if (sortBy === "email") {
        sortedAdminData = [...filteredAdmins].sort((a, b) => {
            const emailA = a.email;
            const emailB = b.email;
            if (emailA < emailB) return sortOrder === "asc" ? -1 : 1;
            if (emailA > emailB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }
    const handleFirstPage = () => {
        setStartIndex(0);
    };

    const handleLastPage = () => {
        const totalPages = Math.ceil(sortedAdminData.length / itemsPerPage);
        const lastPageStartIndex = Math.max(0, (totalPages - 1) * itemsPerPage);
        setStartIndex(lastPageStartIndex);
    };
    const resetTable = () => {
        setDetailVisibility([false]);
        setSearchTerm("");
        setItemsPerPage(10);
        setSelectedAdminIds([]);
        setDeleteConfirmation(null);
        setSortBy(null);
        setSortOrder("normal");
        setFilterYear("All");
        setFilterMonth("All");
        setFiltersChanged(false);
    };


    return (
        <div className="" >
            <main>
                <div className="flex-grow rounded-3xl mt-4 pb-8">

                    <div className="flex justify-between">
                        <input
                            type="text"
                            className="w-full max-w-md rounded-md text-base text-gray-black_ outline-none border-none px-2 py-2 pl-10"
                            placeholder="Search Admins by Name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <div className="mr-12 sm:text-sm md:text-md xl:text-lg  font-semibold ">
                            Total Admins : {adminData.length}
                        </div>
                    </div>
                    <div className="flex min-h-10 w-full justify-end">

                        {filtersChanged && (
                            <button className="mr-16 py-1 px-3  text-center bg-green_ hover:bg-green-200 hover:text-color hover:font-bold rounded-lg text-md text-gray-700 mb-2" onClick={resetTable}>Reset</button>
                        )}

                    </div>
                    <div className="overflow-x-auto px-6 py-2">
                        <table className="w-full table-auto shadow-md bg-white rounded-md">
                            <thead className="text-gray-500">
                                <tr>
                                    <th className="pl-6 min-h-24 py-2 border-b border-white flex flex-col ">
                                        <label className="inline-flex items-center border-b border-white">

                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedIds.length === adminData.length && adminData.length > 0}
                                                className="hidden"
                                            />
                                            <span className="relative flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full cursor-pointer">
                                                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                    <span className={`block w-6 h-6 rounded-full ${selectedIds.length === adminData.length && adminData.length > 0 ? 'bg-green_' : 'bg-transparent'}`}></span>
                                                </span>
                                            </span>
                                        </label>

                                        {selectedIds.length > 0 && (
                                            <div className="-ml-9 pt-1">
                                                <button
                                                    className="bg-red-300 hover:bg-red-600  px-1 py-1 text-white font-semibold  rounded ml-2 text-xs"
                                                    onClick={handleDeleteSelectedAdmins}>
                                                    <DeleteIcon />
                                                </button>
                                            </div>

                                        )}
                                    </th>
                                    <th></th>
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
                                    <th
                                        className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left cursor-pointer"
                                        onClick={() => sortTransactions("email")}
                                    >
                                        <div className="flex flex-col">
                                            <div>Email</div>
                                            <div>
                                                {sortBy === "email" && (
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
                                            <div className="cursor-pointer" onClick={() => sortTransactions("createdDate")}>Created Date</div>
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
                                                        <MenuItem value="All" >Y</MenuItem>

                                                        {Array.isArray(adminData) &&
                                                            Array.from(new Set(adminData.map(admin => new Date(admin.createdDate).getFullYear())))
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
                                                        <MenuItem value="All">M</MenuItem>

                                                        {Array.isArray(adminData) &&
                                                            Array.from(new Set(adminData.map(admin => new Date(admin.createdDate).getMonth() + 1)))
                                                                .map(month => (
                                                                    <MenuItem key={month} value={month.toString()}>
                                                                        {new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}
                                                                    </MenuItem>
                                                                ))
                                                        }

                                                    </Select>

                                                </div>
                                            </div>
                                            <div>{sortBy === "createdDate" && (
                                                <div>{sortOrder === "asc" ? "▲ Oldest" : sortOrder === "desc" ? "▼ Newest" : ""}</div>
                                            )}</div>
                                        </div>
                                    </th>

                                    <th className="pl-5 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-left">
                                        Edit
                                    </th>
                                    <th className="px-7 py-1 text-xs sm:text-sm md:text-base lg:text-base xl:text-base text-center">
                                        <button onClick={controlAllDetail}>{allVisible ? "Hide All Details" : "Show All Details"}</button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-200 border-t py-8">
                                {sortedAdminData
                                    .slice(startIndex, startIndex + itemsPerPage)
                                    .map((adminData, index) => (
                                        <React.Fragment key={index}>
                                            <tr onClick={() => viewDetailAdmin(index)} >
                                                <td className="px-6 py-4 border-b border-white">
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            onChange={() => handleCheckboxChange(adminData.hashId)}
                                                            checked={selectedIds.includes(adminData.hashId)}
                                                            className="hidden"
                                                        />
                                                        <span className="relative flex-shrink-0 w-6 h-6 border border-gray-300 rounded-full cursor-pointer">
                                                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white">
                                                                <span className={`block w-4 h-4 rounded-full ${selectedIds.includes(adminData.hashId) ? 'bg-green_' : 'bg-transparent'}`}></span>
                                                            </span>
                                                        </span>
                                                    </label>

                                                </td>
                                                <td>
                                                    <ProfileImage name={adminData.fullName} userImage={adminData.UserImage} index={index} />

                                                </td>
                                                <td className="px-4 py-2">
                                                    {sortBy ? startIndex + index + 1 : startIndex + index + 1}
                                                </td>
                                                <td className="px-7 py-1 rounded text-xs sm:text-sm md:text-base lg:text-base xl:text-base" onClick={() => viewDetailAdmin(index)}>
                                                    {adminData.fullName}
                                                </td>
                                                <td className="px-7 py-1 rounded text-xs sm:text-sm md:text-base lg:text-base xl:text-base" onClick={() => viewDetailAdmin(index)}>
                                                    {adminData.email}
                                                </td>
                                                <td
                                                    className="whitespace-nowrap px-7 py-1 rounded text-xs sm:text-sm md:text-base text-balck_ lg:text-base xl:text-base"
                                                >
                                                    {adminData?.createdDate}
                                                </td>

                                                <td className="px-4 py-2">
                                                    <button
                                                        className="text-gray-400 hover:text-gray-600 focus:outline-none border border-gray-300 rounded px-1 md:mr-1 md:px-2"
                                                        onClick={() => editUser(adminData.hashId)}>
                                                        <EditIcon fontSize="small" />
                                                    </button>
                                                </td>
                                                <td className=" py-2 text-center">
                                                    <button
                                                        className="text-black_ hover:text-gray-600 focus:outline-none border border-gray-300 rounded-lg px-6 text-xs sm:text-sm md:text-base lg:text-base xl:text-base"
                                                        onClick={() => viewDetailAdmin(index)}
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
                                                        <AdminInfo adminData={adminData} />
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
                                                    {Math.ceil(sortedAdminData.length / itemsPerPage)}
                                                </div>
                                                <button
                                                    className="text-gray-black_ text-sm"
                                                    onClick={handleNext}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedAdminData.length
                                                    }>
                                                    <ArrowForwardIcon style={{ fontSize: 16 }} />
                                                </button>
                                                <button
                                                    className="text-gray-black_ text-lg"
                                                    onClick={handleLastPage}
                                                    disabled={
                                                        startIndex + itemsPerPage >=
                                                        sortedAdminData.length
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
            {deleteConfirmation !== null && (
                <ConfirmationPanel
                    message={confirmMessage}
                    onConfirm={confirmDeleteAdmins}
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
                <div className="z-50  inset-0 fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-8 max-w-md">
                        <h2 className="text-xl  text_center font-semibold mb-4">
                            Are you sure you want to delete the selected adminData?
                        </h2>
                        <div className="flex justify-between">
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                onClick={confirmDeleteAdmins}>
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

export default AdminList;