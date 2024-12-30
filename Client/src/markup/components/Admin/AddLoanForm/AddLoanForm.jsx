import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../Contexts/useHook";
import userService from "../../../../services/users.service";
import getAuth from "../../../../util/auth";
import loanData from "../../../../services/loanData.service";
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import InfoDialog from "../../../../util/InformationPage";
import LoadingIndicator from "../../../../util/LoadingIndicator";

const AddLoanForm = () => {
  const navigate = useNavigate();
  const { openPage, setOpenPage, addedData } = useAuth()
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState(`${firstName} ${lastName}`);
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [currencyCategory, setCurrencyCategory] = useState(0);
  const [periodCategory, setPeriodCategory] = useState('');
  const [durationCategory, setDurationCategory] = useState('');
  const [startingCategory, setStartingCategory] = useState('now');
  const [startingDate, setStartingDate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [loanInterestRate, setLoanInterestRate] = useState('');
  const [totalInterest, setTotalInterest] = useState('');
  const [calculateExpiredDate, setCalculateExpiredDate] = useState('');
  const [calculateStartedDate, setCalculateStartedDate] = useState('');
  const [paymentMethod, setPayMethodCategory] = useState('Cash');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [collateral, setCollateral] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState([]);
  const [submitInfo, setSubmitInfo] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [infoType, setInfoType] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const loanAmountInputRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {

    if (openPage == "Customer") {
      setSelectedUser(addedData)
      setIsValidEmail(true)
      setFirstName(() => addedData.firstName);
      setLastName(() => addedData.lastName);
      setFullName(() => `${addedData.firstName} ${addedData.firstName}`);
      setEmail(() => addedData.email);
      setPhoneNumber(() => addedData.phoneNumber);
      setTimeout(() => {
        if (loanAmountInputRef.current) {
          loanAmountInputRef.current.focus();
        }
      }, 500);
    } else {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 200);
    }
    setOpenPage("AddLoanForm")
    const tokenOnStorage = localStorage.getItem("user");
    const token = JSON.parse(tokenOnStorage);

    const fetchCustomerData = async () => {
      try {
        const response = await userService.getCustomerListDataForLoan(token.token);

        if (response.status === 400) {
          setLoading(false);
          navigate("/500");
          return;
        }
        const responseObj = await response?.json();
        const data = await responseObj?.response;

        setCustomerData(data)

        if (data) {
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
          setLoading(false);
          navigate("/500");
          return;
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerData();

  }, []);



  const handleSearchInputChange = _.debounce(() => {
    const queryString = searchInput.toLowerCase().trim();

    const filteredUsers = Array.isArray(customerData) ? customerData.filter(user =>
      user?.firstName?.toLowerCase().includes(queryString) ||
      user?.lastName?.toLowerCase().includes(queryString) ||
      user?.email?.toLowerCase().includes(queryString) ||
      user?.phoneNumber?.includes(queryString)
    ) : [];

    const sortedUsers = filteredUsers?.sort((a, b) => a.firstName.localeCompare(b.firstName));
    if (filteredUsers.length === 0 || searchInput.length !== 0) {
      const userList = "No eligible users found";
      setEligibleUsers([userList]);
    }

    setEligibleUsers(sortedUsers);
  }, 300);

  const handleInputChange = (value) => {

    setSearchInput(value);
    handleSearchInputChange();
  };

  function adjustDate(date, period) {
    const currentDate = new Date(date);
    let adjustedDate;
    switch (period?.toLowerCase()) {
      case "year":
        adjustedDate = new Date(currentDate.getFullYear() + 1, 0, 1);
        break;
      case "month":
        adjustedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        break;
      case "week":
        const dayOfWeek = currentDate.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        adjustedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - daysUntilMonday + 7);
        break;
      case "bi-week":
        adjustedDate = new Date(currentDate);
        const daysToAdd = 14 - (currentDate.getDay() + 6) % 7;
        adjustedDate.setDate(adjustedDate.getDate() + daysToAdd);
        break;

      case "half-year":
        adjustedDate = new Date(currentDate);
        const currentMonth = adjustedDate.getMonth();
        const currentYear = adjustedDate.getFullYear();
        if (currentMonth < 6) {
          adjustedDate.setFullYear(currentYear, 6, 1);
        } else {
          adjustedDate.setFullYear(currentYear + 1, 0, 1);
        }
        break;
      default:
        return null;
    }
    return adjustedDate;
  }

  function calculateExpirationDate(loanStartDate, loanPeriod, loanTerm) {
    let expirationDate = new Date(loanStartDate);

    if (loanPeriod === "week") {
      expirationDate.setDate(expirationDate.getDate() + loanTerm * 7);
    } else if (loanPeriod === "month") {
      expirationDate.setMonth(expirationDate.getMonth() + parseInt(loanTerm));
    } else if (loanPeriod === "year") {
      expirationDate.setFullYear(expirationDate.getFullYear() + parseInt(loanTerm));
    } else if (loanPeriod === "bi-week") {
      expirationDate.setDate(expirationDate.getDate() + loanTerm * 14);
    } else if (loanPeriod === "half-year") {
      expirationDate.setMonth(expirationDate.getMonth() + loanTerm * 6);
    }

    return expirationDate;
  }

  function calculateLoanTerm(loanStartDate, loanExpireDate, loanPeriod) {
    let start = new Date(loanStartDate);
    let end = new Date(loanExpireDate);

    let diffTime = end - start;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (loanPeriod === "week") {
      return Math.ceil(diffDays / 7);
    } else if (loanPeriod === "month") {
      let diffMonths = (end.getFullYear() - start.getFullYear()) * 12;
      diffMonths -= start.getMonth() + 1;
      diffMonths += end.getMonth() + 1;
      return diffMonths <= 0 ? 0 : diffMonths;
    } else if (loanPeriod === "year") {
      let diffYears = end.getFullYear() - start.getFullYear();
      if (end.getMonth() < start.getMonth() || (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())) {
        diffYears--;
      }
      return diffYears;
    } else if (loanPeriod === "bi-week") {
      return Math.ceil(diffDays / 14);
    } else if (loanPeriod === "half-year") {
      let diffMonths = (end.getFullYear() - start.getFullYear()) * 12;
      diffMonths -= start.getMonth() + 1;
      diffMonths += end.getMonth() + 1;
      return diffMonths <= 0 ? 0 : diffMonths / 6;
    } else {
      return 0;
    }
  }




  const handleUserSelect = (user) => {
    setIsValidEmail(true);
    setSelectedUser(user);
    setFirstName(() => user.firstName);
    setLastName(() => user.lastName);
    setFullName(() => `${user.firstName} ${user.lastName}`);
    setEmail(() => user.email);
    setPhoneNumber(() => user.phoneNumber);
    setShowDropdown(false);
    setEligibleUsers(eligibleUsers);
    setTimeout(() => {
      if (loanAmountInputRef.current) {
        loanAmountInputRef.current.focus();
      }
    }, 0);
  };

  const handleCurrencyChange = (event) => {
    setCurrencyCategory(event.target.value);

  };

  const handleCloseInfoDialog = () => {
    setShowInfoDialog(false);
    if (status === "OK") {
      navigate(-1);
    }
  };

  const handlePeriodChange = (event) => {
    setPeriodCategory(event.target.value);
  };

  const handleDurationChange = (event) => {
    setDurationCategory(event.target.value);
  };

  const handlePayMethodChange = (event) => {
    setPayMethodCategory(event.target.value);
  };

  const handleStartingDateChange = (event) => {
    setStartingCategory(event.target.value);
  };

  useEffect(() => {
    const handleStartingCalculatedChange = () => {
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      if (startingCategory === "now") {
        const currentDate = adjustDate(new Date(), periodCategory);
        setCalculateStartedDate(currentDate?.toLocaleDateString('en-US', options))

      } else {
        const startDate = startingDate;
        const starting = adjustDate(startDate, periodCategory);
        setCalculateStartedDate(starting?.toLocaleDateString('en-US', options))
      }
    }
    handleStartingCalculatedChange();
  }, [periodCategory, startingDate, startingCategory, durationCategory])

  const handleAddCustomer = () => {
    navigate("/admin/add-user")
  }

  const handleError = () => {
    const errors = {};

    if (!loanAmount) {
      errors.loanAmount = ("Please enter a loan amount");
    }
    if (!loanInterestRate) {
      errors.loanInterestRate = ("Interest Rate needed");
    }

    if (!periodCategory) {
      errors.periodCategory = "Please select the period first";
    }
    if (!durationCategory) {
      errors.durationCategory = "Please select the duration type";
    }
    if (durationCategory === "expireDate" && !expireDate) {
      errors.expireDate = "No Expired Date selected";
    }
    if (durationCategory === "term" && !loanTerm) {
      errors.loanTerm = "Please enter the loan term.";
    }
    if (new Date(calculateStartedDate) >= new Date(calculateExpiredDate)) {
      errors.calculateStartedDate = "Starting Date must be < exp-date.";
      errors.calculateExpiredDate = "Expire Date must be > start-date.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    }
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true)
    const errors = handleError();

    if (errors && Object.keys(errors).length === 0) {
      setSubmitInfo('');
      const user = await getAuth();
      const tokenOnStorage = localStorage.getItem("user");
      const token = JSON.parse(tokenOnStorage);
      const formattedLoanAmount = loanAmount.replace(/,/g, '');

      const formattedData = {
        "data": [{
          "loan": {
            "userEmail": selectedUser?.email,
            "loanAmount": parseFloat(formattedLoanAmount),
            "loanCurrency": currencyCategory === 0 ? "USD" : "COP",
            "loanStartDate": new Date(calculateStartedDate),
            "loanExpireDate": new Date(calculateExpiredDate),
            "loanPeriod": periodCategory,
            "loanTerm": parseInt(calculateLoanTerm(new Date(calculateStartedDate), new Date(calculateExpiredDate), periodCategory)),
            "collateral": collateral,
            "loanPurpose": loanPurpose,
            "loanInterestRate": parseFloat(loanInterestRate),
            "loanPaymentMethod": paymentMethod,
            "createdBy": user?.userHashId
          }
        }]
      };

      try {
        const response = await loanData.addLoan(formattedData, token.token);
        if (response.status === 400) {
          setLoading(false);
          navigate("/500");
          return;
        }
        const data = await response.json();
        setStatus(data?.response?.status)
        if (data?.response?.status === "OK" && data?.response?.msg === "Loan created successfully") {
          setInfoMessage("Loan created successfully! ");
          setInfoType("success");
          setShowInfoDialog(true);
        } else {
          setInfoMessage(`
          Something went wrong! <br>
          Please try again later!
        `);
          setInfoType("error");
          setShowInfoDialog(true);
        }
      } catch (error) {
        setInfoMessage(`
        Oops..! Something went wrong!
        Please try again later!
      `);
        setInfoType("error");
        setShowInfoDialog(true);
      } finally {
        setSubmitLoading(false);
      }
    } else if (Object.keys(errors).length !== 0) {
      setSubmitInfo("Please fix the highlighted errors before submitting.");
      setSubmitLoading(false);
    } else {
      setInfoMessage(`
      Oops..! Something went wrong! <br>
      Please try again later!
    `);
      setInfoType("error");
      setShowInfoDialog(true);
    }
  };

  const handleLoanAmountChange = (input) => {
    input = input.replace(/[^\d.]/g, '');

    const parts = input.split('.');
    if (parts.length > 2) return;
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, 2);
    }

    const formattedInput = parts.join('.');


    setLoanAmount(formattedInput);
  };

  const handleLoanAmountOnBlur = () => {

    if (loanAmount && !loanAmount.includes('.')) {
      setLoanAmount(loanAmount + '.00');
    }
  };

  const handleFocus = (field) => {
    setFormErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[field];
      return updatedErrors;
    });
    setSubmitInfo("");
  };

  const resetHandle = () => {
    setFirstName('');
    setFullName('');
    setSelectedUser(null);
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setLoanAmount('');
    setLoanAmount('');
    setCurrencyCategory(0);
    setPeriodCategory('');
    setDurationCategory('');
    setLoanTerm('');
    setLoanInterestRate('');
    setTotalInterest('');
    setPayMethodCategory(0);
    setLoanPurpose('');
    setCollateral('');
    setExpireDate('');
    setStartingDate('');
    setStartingCategory('');
    setSubmitInfo('');
    setShowDropdown(false);
    setFormErrors({});
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 200);

  };

  const handleLoanInterestRate = (e) => {
    const rate = parseFloat(e.target.value);

    if (!isNaN(rate) && rate >= 0 && Math.sign(rate) !== -1) {
      const amount = parseFloat(loanAmount.replace(/,/g, ''));

      if (!isNaN(amount)) {
        let interestValue;
        if (currencyCategory === 0) {
          interestValue = `${(rate * amount / 100).toFixed(2)} USD`;
        } else {
          interestValue = `${(rate * amount / 100).toFixed(2)} COP`;
        }
        setTotalInterest(interestValue);
      } else {
        setTotalInterest('Insert Number on Amount');
      }
      setLoanInterestRate(rate);
    } else {
      setTotalInterest('');
      setLoanInterestRate('');
    }
  };


  useEffect(() => {
    handleLoanInterestRate({ target: { value: loanInterestRate } });
  }, [loanAmount, loanInterestRate]);

  const calculateMinDate = () => {
    const calculatedDate = new Date(Math.max(adjustDate(new Date(calculateStartedDate || null), periodCategory), Date.now()));
    return `${calculatedDate.getFullYear()}-${String(calculatedDate.getMonth() + 1).padStart(2, '0')}-${String(calculatedDate.getDate()).padStart(2, '0')}`;
  }



  const isValidLoanTerm = (value) => {
    const intValue = parseInt(value);
    return /^\d*$/.test(value) && intValue >= 1 && intValue <= 1000;
  };

  const handleLoanTermChange = (e) => {
    const { value } = e.target;
    if (isValidLoanTerm(value) || value === '') {
      setLoanTerm(value);
    }
    setExpireDate('')
  };

  const handleClose = () => {

    navigate(-1);

  }



  useEffect(() => {

    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    if (expireDate && !loanTerm) {
      const newDate = adjustDate(expireDate, periodCategory)
      setCalculateExpiredDate(newDate?.toLocaleDateString('en-US', options));
    } else if (loanTerm && !expireDate) {

      const starting = adjustDate((startingDate ? startingDate : new Date()), periodCategory)

      const newDate = calculateExpirationDate(starting, periodCategory, loanTerm);
      setCalculateExpiredDate(newDate?.toLocaleDateString('en-US', options));
    }
  }, [periodCategory, loanTerm, expireDate, startingDate]);



  if (loading) {

    return <LoadingIndicator />
  }

  return (
    <div>
      <div className="z-50 fixed inset-0 flex items-start justify-start 2xs:justify-center bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto pt-10">
        <div className="bg-white sm:ml-24 px-8 rounded-lg w-3/5 md:w-1/2 max-h-[800px] max-w-[1200px] min-w-[360px] overflow-auto">

          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mt-4">Add Loan</h1>

            {(selectedUser && email) && selectedUser?.isActive ? (
              <div className="text-red-900 text-sm p-3 italic">
                <span className="font-bold text-red-800">Warning:</span>
                {' '}
                The selected customer has an active loan
                <span className="px-5 text-black">
                  <button className="hover:underline text-emerald-600" onClick={() => navigate(`/admin/customer/${selectedUser?.userHashId}`)}>
                    See the customer loan
                  </button>
                </span>
              </div>
            ) : null}


            <div
              className="cursor-pointer text-4xl px-3 pb-2 text-red-300  hover:text-red-600"
              onClick={handleClose}
            >
              x
            </div>


          </div >

          {(!isValidEmail || !selectedUser) ? (
            <div className="flex flex-col xl:flex-row justify-between">
              <div className="p-2 italic text-lg font-semibold  ">
                <span className="text-3xl text-lime-800">Search </span>
                <span className="text-2xl text-lime-800"> {`${'then'}`} </span>
                <span className="text-lg text-emerald-600"> Select user from dropdown</span>
              </div>
              <div className="flex justify-end">
                <div className="flex justify-end flex-col sm:flex-row w-full">
                  <div className="p-2 italic text-md md:text-lg font-semibold text-lime-800">New Customer? </div>
                  <button className="max-h-10 xl:max-h-14 2xl:max-h-10 max-w-44 py-2 px-6 xl:px-2 bg-green-100 hover:bg-green-200  rounded-lg" onClick={handleAddCustomer}>
                    Add Customer
                  </button>
                </div>
              </div>
            </div>) :
            <div className="flex justify-between">
              <div className="mb-4 h-8 px-2 py-2 text-md italic text-red-900">
                {submitInfo ? submitInfo : ""}
              </div>
              <button disabled={submitLoading} className="px-6 max-h-8 bg-red-100 hover:bg-red-200 rounded-md" onClick={resetHandle}>
                Reset
              </button>
            </div>
          }

          <form onSubmit={handleFormSubmit} noValidate>
            <div className="space-y-4">
              {
                !selectedUser &&
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={searchInput}
                    ref={searchInputRef}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowDropdown(false);
                      }, 200);
                    }}
                    className="md:mt-4 md:ml-5 border p-2 pl-10 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                    placeholder="Search by Name, Email, or Phone Number"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-bottom pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="mt-2 md:mt-7 md:ml-5 text-gray-400" size="lg" />
                  </div>
                </div>
              }
              {showDropdown && !selectedUser && (
                <div className="absolute ml-[-32px] mt-2 w-[60%] md:w-1/2 bg-green-100 border border-green-300 rounded-lg z-10 shadow-lg min-w-[360px] overflow-x-auto">
                  {eligibleUsers.length > 0 && <div className="bg-green-200 text-gray-700 font-bold pl-14 py-2 border-b border-green-300 rounded-t-lg hidden xl:grid xl:grid-cols-11 gap-1">
                    <span className="text-gray-700 xl:col-span-4">Name</span>
                    <span className="text-sm text-gray-500 xl:col-span-4">Email</span>
                    <span className="text-sm text-gray-500 xl:col-span-3">Phone Number</span>
                  </div>}

                  <div className="overflow-y-auto max-h-96 xl:max-h-48 opacity-85">
                    <ul className="ml-5">
                      {eligibleUsers.map((user) => (
                        <li
                          key={user.email}
                          className="cursor-pointer pl-9 py-2 hover:bg-green-200 hover:text-blue-800 rounded grid grid-rows-3 xl:grid-cols-11 xl:grid-rows-1 xl:gap-1"
                          onClick={() => handleUserSelect(user)}
                          role="option"
                          aria-selected="false"
                        >
                          <span className="font-medium text-gray-700 xl:col-span-4"><span className="xl:hidden mr-5">Name  </span>{`${user.firstName} ${user.lastName}`}</span>
                          <span className="text-sm text-gray-500 xl:col-span-4"><span className="xl:hidden mr-8">Email  </span>{user.email}</span>
                          <span className="text-sm text-gray-500 xl:col-span-3"><span className="xl:hidden mr-6">Phone  </span>{user.phoneNumber}</span>
                        </li>
                      ))}
                    </ul>

                  </div>
                </div>
              )}



              {
                selectedUser &&
                <div className="w-full flex  justify-end">

                  <div className="flex flex-col gap-2 ml-5 w-full ">
                    <div className="flex w-full">
                      <label className="italic w-4/12 lg:w-3/12 2xl:w-2/12" htmlFor="fullName">Name - </label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        className="italic w-8/12 md:w-10/12 lg:w-full"
                        disabled
                      />
                    </div>
                    <div className=" flex w-full">
                      <label className="italic w-4/12 lg:w-3/12 2xl:w-2/12" htmlFor="email">Email - </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        className="italic w-8/12 md:w-10/12 lg:w-full"
                        disabled
                      />
                    </div>
                    <div className="flex w-full ">
                      <label className="italic flex items-center w-4/12 lg:w-3/12 2xl:w-2/12" htmlFor="phoneNumber">Phone No - </label>
                      <input
                        id="phoneNumber"
                        type="text"
                        value={phoneNumber}
                        className="italic w-8/12 md:w-10/12 lg:w-full"
                        disabled
                      />
                    </div>
                  </div>


                </div>}

              {selectedUser && <div className="md:flex md:space-x-4 space-y-4">
                <input
                  id="loanAmount"
                  ref={loanAmountInputRef}
                  required
                  type="text"
                  value={`${formErrors.loanAmount ? formErrors.loanAmount : loanAmount}`}
                  onChange={(e) => handleLoanAmountChange(e.target.value)}
                  onFocus={() => handleFocus("loanAmount")}
                  onBlur={handleLoanAmountOnBlur}
                  disabled={!selectedUser || !isValidEmail}
                  className={`md:mt-4 md:ml-4 border p-2  rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 ${(!selectedUser || !isValidEmail || formErrors.loanAmount) ? 'border-red-400 italic text-sm text-red-300 ' : 'border-green-400'
                    }`}
                  placeholder="Enter Loan Amount *"
                />

                <select
                  value={periodCategory}
                  disabled={!selectedUser || !isValidEmail}
                  onChange={handlePeriodChange}
                  onClick={() => {
                    setDurationCategory('');
                    setExpireDate('');
                    setStartingDate('');
                    setLoanTerm('');
                    setStartingCategory('now');
                  }}
                  onFocus={() => handleFocus("periodCategory")}
                  className={`md:mt-4 md:ml-4 p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 border ${(!selectedUser || !isValidEmail || formErrors.periodCategory) ? 'border-red-400 italic text-sm text-red-300' : 'border-green-400'
                    }`}>
                  <option value="" disabled>
                    {`${formErrors.periodCategory ? formErrors.periodCategory : "Select Period *"}`}
                  </option>
                  <option value="week">Weekly</option>
                  <option value="bi-week">Bi-Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="half-year">Semi-Anually</option>
                  <option value="year">Anually</option>
                </select>

              </div>}

              {
                selectedUser &&
                <div className="md:flex md:space-x-4 space-y-4">
                  <select
                    value={currencyCategory}
                    disabled={!selectedUser || !isValidEmail}
                    onChange={handleCurrencyChange}
                    className={`md:mt-4 md:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 ${(!selectedUser || !isValidEmail) ? 'border-red-400 italic text-sm text-red-300' : 'border border-green-400'}`}>
                    <option value="" disabled>Select Currency</option>
                    <option value="USD">USD</option>
                    <option value="COP">COP</option>
                  </select>
                  <select
                    value={paymentMethod}
                    disabled={!selectedUser || !isValidEmail}
                    onChange={handlePayMethodChange}
                    onFocus={() => { handleFocus("calculateStartedDate"); handleFocus("calculteExpireDate"); }}
                    className={`md:mt-4 md:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-200 border ${(!selectedUser || !isValidEmail) ? 'border-red-200' : 'border-green-400'}`}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Debit-Card">Debit-Card</option>
                    <option value="Credit-Card">Credit-Card</option>
                    <option value="Bank">Bank</option>
                    <option value="Others">Others</option>
                  </select>
                  {!durationCategory ?
                    <select
                      value={durationCategory}
                      disabled={!selectedUser || !isValidEmail || periodCategory === ""}
                      onChange={handleDurationChange}
                      onFocus={() => { handleFocus("durationCategory"); handleFocus("calculateStartedDate"); handleFocus("calculateExpiredDate") }}
                      className={`md:mt-4 md:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border ${(!selectedUser || !isValidEmail || formErrors.durationCategory) ? 'border-red-400 italic text-sm text-red-300' : 'border-green-400'
                        }`}>
                      <option value="" disabled>
                        {`${formErrors.durationCategory ? formErrors.durationCategory : "Select Duration"}`}
                      </option>
                      <option value="expireDate">Insert Expired date</option>
                      <option value="term">Insert how many term</option>
                    </select>
                    : (durationCategory === "expireDate") ? (
                      <input
                        id="expireDate"
                        type="date"
                        value={formErrors.expireDate ? formErrors.expireDate : expireDate}
                        onChange={(e) => {
                          setExpireDate(e.target.value);
                          setLoanTerm('');
                        }}
                        onFocus={() => { handleFocus("expireDate"); handleFocus("calculateStartedDate"); handleFocus("calculateExpireDate"); }}
                        disabled={!selectedUser || !isValidEmail}
                        className={`border p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.expireDate ? ' border-red-400 italic text-sm text-red-300' : ''}`}
                        placeholder="Select Expiration Date"
                        min={calculateMinDate()}

                      />
                    ) : (
                      <input
                        id="term"
                        type="text"
                        value={`${formErrors.loanTerm ? formErrors.loanTerm : loanTerm}`}
                        onChange={handleLoanTermChange}
                        disabled={!selectedUser || !isValidEmail}
                        onFocus={() => { handleFocus("loanTerm"); handleFocus("calculateStartedDate"); handleFocus("calculateExpireDate"); }}
                        className={`md:mt-4 md:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border ${!selectedUser || !isValidEmail || formErrors.loanTerm ? 'border-red-400 italic text-sm text-red-300' : 'border-green-400'
                          }`}
                        placeholder="How Many Term...?"
                      />
                    )}
                  <input
                    id="calculateExpiredDate"
                    type="text"
                    disabled
                    value={`${formErrors.calculateExpiredDate ? formErrors.calculateExpiredDate : (periodCategory && (loanTerm || expireDate)) ? `Expire:- ${calculateExpiredDate}` : "Calculated Expired date"}`}

                    className={`md:mt-4 border-none p-2 rounded-lg w-1/2 focus:outline-none ${formErrors.calculateExpiredDate ? ' italic text-sm text-red-400' : 'text-xs'}`}
                    placeholder={`${!loanAmount ? "Expired Date" : formErrors.calculateExpiredDate ? formErrors.calculateExpiredDate : "Total Interest"}`}
                  />
                </div>
              }
              {selectedUser &&
                <div className="md:flex md:space-x-4 space-y-4">
                  <input
                    id="loanInterestRate"
                    type="number"
                    value={loanInterestRate}
                    disabled={!selectedUser || !isValidEmail || !loanAmount}
                    onChange={handleLoanInterestRate}
                    className={`md:mt-4 md:ml-4 border p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 ${(!selectedUser || !isValidEmail || formErrors.loanInterestRate) ? ' border-red-400 italic text-sm text-red-300' : 'border-green-400'}`}
                    onFocus={() => handleFocus("loanInterestRate")}
                    placeholder="Interest Rate * (%)"
                  />
                  <input
                    id="totalInterest"
                    type="text"
                    disabled
                    value={`${formErrors.loanInterestRate ? formErrors.loanInterestRate : totalInterest}`}
                    onChange={(e) => setTotalInterest(e.target.value)}
                    className={`md:mt-4 border-none p-2 rounded-lg w-1/2 focus:outline-none   ${(!selectedUser || !isValidEmail || !loanAmount || formErrors.loanInterestRate) ? '  text-sm text-red-300' : ''}`}
                    placeholder={`${formErrors.loanInterestRate ? formErrors.loanInterestRate : "Total Interest"}`}
                  />
                  {(startingCategory !== "startingDate") ? <select
                    value={startingCategory}
                    disabled={!selectedUser || !isValidEmail || periodCategory === ""}
                    onChange={handleStartingDateChange}
                    onFocus={() => { handleFocus("calculateStartedDate"); handleFocus("calculteExpireDate"); }}
                    className={`md:mt-4 md:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-200 border ${(!selectedUser || !isValidEmail) ? 'border-red-200' : 'border-green-400'}`}
                  >
                    <option value="now">Start Right Now</option>
                    <option value="startingDate">Pick Starting Date</option>
                  </select>
                    :
                    <input
                      id="startingDate"
                      type="date"
                      value={startingDate}
                      onChange={(e) => {
                        setStartingDate(e.target.value);

                      }}
                      onFocus={() => { handleFocus("calculateStartedDate"); handleFocus("calculteExpireDate"); }}
                      disabled={!selectedUser || !isValidEmail}
                      className={`border p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400${formErrors.startingDate ? ' border-red-400 italic text-sm text-red-300' : ''}`}
                      placeholder="Select starting Date"
                      min={(new Date(Date.now() + 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
                      max={expireDate}
                    />}
                  <input
                    id="calculateStartedDate"
                    type="text"
                    disabled
                    value={`${formErrors.calculateStartedDate ? formErrors.calculateStartedDate : (periodCategory && (startingCategory == "now" || startingDate)) ? `Start:- ${calculateStartedDate}` : "Calculated Starting date"}`}
                    className={`md:mt-4 border-none p-2 rounded-lg w-1/2 focus:outline-none  ${formErrors.calculateStartedDate ? ' italic text-sm  text-red-400' : 'text-xs '}`}
                    placeholder={`${!loanAmount ? "Started Date" : formErrors.calculateStartedDate ? formErrors.calculateStartedDate : "Total Starting Date"}`}
                  />

                </div>}

              {selectedUser &&
                <div className="md:flex md:space-x-4 space-y-4">
                  <textarea id="loanPurpose"
                    type="text"
                    disabled={!selectedUser || !isValidEmail}
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    className={`md:mt-4 md:ml-4 p-2 rounded-lg w-full h-11 focus:outline-none focus:ring-1 focus:ring-green-600 border ${(!selectedUser || !isValidEmail) ? 'border-red-200' : 'border-green-400'
                      }`}
                    placeholder="Enter the purpose of this Loan" />
                  <input
                    id="collateral"
                    type="text"
                    disabled={!selectedUser || !isValidEmail}
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                    className={`md:mt-4 md:ml-4 p-2 rounded-lg w-full h-11 focus:outline-none focus:ring-1 focus:ring-green-600 border ${(!selectedUser || !isValidEmail) ? 'border-red-200' : 'border-green-400'
                      }`}
                    placeholder="Enter the collateral" />
                </div>
              }
            </div>

            <div className={`flex justify-end mt-6`}>
              {selectedUser &&
                <button
                  type="submit"
                  disabled={submitLoading || (formErrors && Object.keys(formErrors).length !== 0)}
                  className={`py-2 w-full md:w-[30%] text-center   rounded-lg text-sm  mb-4 ${submitLoading || (formErrors && Object.keys(formErrors).length !== 0) ? 'cursor-not-allowed opacity-70 bg-green-200 text-gray-700 font-bold' : 'text-gray_light  bg-green__ hover:bg-green-200 hover:text-gray-700 hover:font-bold'
                    }`}
                >
                  {submitLoading ? 'Submitting...' : formErrors && Object.keys(formErrors).length !== 0 ? 'Correct the error first' : 'Create Loan'}
                </button>
              }
            </div>
          </form>
        </div >
      </div >
      {showInfoDialog && (
        <InfoDialog
          message={infoMessage}
          onClose={handleCloseInfoDialog}
          type={infoType}
        />
      )}
    </div >
  );
};

export default AddLoanForm;