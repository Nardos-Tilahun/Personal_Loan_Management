import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { useAuth } from "../../../../Contexts/useHook";
import loanDataService from "../../../../services/loanData.service"
import paymentData from "../../../../services/paymentData.service";
import getAuth from "../../../../util/auth";
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import InfoDialog from "../../../../util/InformationPage";
import formatNumberWithCommas from "../../../../util/NumberComma";
import LoadingIndicator from "../../../../util/LoadingIndicator";

const AddPaymentForm = () => {
  const navigate = useNavigate();
  const { openPage, setOpenPage, addedData } = useAuth()
  const [name, setName] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [loanData, setLoanData] = useState([]);
  const [loanDate, setloanDate] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [currencyCategory, setCurrencyCategory] = useState(0);
  const [convertedPayment, setConvertedPayment] = useState('');
  const [penalityPayment, setPenalityPayment] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [paymentMethod, setPayMethodCategory] = useState('Cash');
  const [paymentNote, setpaymentNote] = useState('');
  const [penalityRate, setPenalityRate] = useState('');
  const [lateReason, setLateReason] = useState('');
  const [eligibleLoans, setEligibleLoans] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [infoType, setInfoType] = useState('');
  const [submitInfo, setSubmitInfo] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [paymentInfo, setPaymentInfo] = useState({});
  const paymentAmountInputRef = useRef(null);
  const searchInputRef = useRef(null);


  useEffect(() => {
    if (openPage == "Loan" || openPage == "Payment") {
      if (addedData.status === "Pending" || addedData.status === "Active") {
        setSelectedLoan(addedData)
        setName(addedData?.name);
        setEmail(addedData?.email);
        setloanDate(addedData?.loanDate);
        setLoanAmount(`${formatNumberWithCommas(addedData?.loanAmounted)} ${addedData?.loanCurrency} `);
        setShowDropdown(false);
        setIsValidEmail(true);
        setTimeout(() => {
          if (paymentAmountInputRef.current) {
            paymentAmountInputRef.current.focus();
          }
        }, 500);
      } else {
        setInfoMessage(`It is already Completed Loan`);
        setInfoType("error");
        setShowInfoDialog(true);
        setStatus("OK")
      }
    } else {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 200);
    }
    setOpenPage("AddPaymentForm")

    const fetchCustomerData = async () => {
      const tokenOnStorage = localStorage.getItem("user");
      const token = JSON.parse(tokenOnStorage);
      try {
        const response = await loanDataService.getLoanListDataForPayment(token.token);
        if (response.status === 400) {
          setLoading(false);
          navigate("/500");
          return;
        }
        const responseObj = await response?.json();
        const data = await responseObj?.response.loanList;
        setLoanData(data)
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

    const filteredLoans = Array.isArray(loanData) ? loanData.filter(loan =>
      loan?.name?.toLowerCase().includes(queryString) ||
      loan?.email?.toLowerCase().includes(queryString) ||
      loan?.loanDate?.includes(queryString) ||
      loan?.loanAmounted?.includes(queryString)
    ) : [];

    const sortedLoans = filteredLoans?.sort((a, b) => a.name.localeCompare(b.name));
    if (filteredLoans.length === 0 || searchInput.length !== 0) {
      const loanList = "No user with the loan found";
      setEligibleLoans([loanList]);
    }

    setEligibleLoans(sortedLoans);
  }, 300);

  const handleInputChange = (value) => {
    setSearchInput(value);
    handleSearchInputChange();
  };

  useEffect(() => {
    setConversionRate();
    setPaymentAmount('');
    setPenalityPayment('');
    setPenalityRate('');
    setConversionRate('');
    setCurrencyCategory(selectedLoan?.loanCurrency || 0);
  }, [selectedLoan]);


  const handleUserSelect = (loan) => {
    setIsValidEmail(true);
    setSelectedLoan(loan);
    setName(loan?.name);
    setEmail(loan?.email);
    setloanDate(loan?.loanDate);
    setLoanAmount(`${formatNumberWithCommas(loan?.loanAmounted)} ${loan?.loanCurrency} `);
    setShowDropdown(false);
    setEligibleLoans(eligibleLoans)
    setTimeout(() => {
      if (paymentAmountInputRef.current) {
        paymentAmountInputRef.current.focus();
      }
    }, 0);
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const handlePaymentAmountChange = (input) => {
    input = input.replace(/[^\d.]/g, '');
    if (/^0[^.]/.test(input)) {
      input = input.replace(/^0/, '');
    }
    const parts = input.split('.');
    if (parts.length > 2) return;

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, 2);
    }

    const formattedInput = parts.join('.');


    setPaymentAmount(formattedInput);
  };
  const handlePaymentAmountOnBlur = () => {

    if (paymentAmount && !paymentAmount.includes('.')) {
      setPaymentAmount(paymentAmount + '.00');
    }
  };

  const handleCurrencyChange = (event) => {
    setCurrencyCategory(event.target.value);
    setConversionRate('')
  };


  const handlePayMethodChange = (event) => {
    setPayMethodCategory(event.target.value);
  };

  const handlePaymentConversionRate = (e) => {
    let value = e.target.value;

    value = value.replace(/[^\d.]/g, '');

    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1 && value.length - decimalIndex > 3) {
      value = value.slice(0, decimalIndex + 3);
    }

    if (value === '') {
      setConvertedPayment('The converted Payment');
      setConversionRate('');
      return;
    }

    const rate = parseFloat(value);
    if (isNaN(rate) || rate <= 0) {
      setConvertedPayment('Please Insert Positive Number only');
      setConversionRate('');
      return;
    }

    setConversionRate(value);

    const amount = parseFloat(paymentAmount.replace(/,/g, ''));
    if (!isNaN(amount)) {
      let convertedPaymentValue;
      if (selectedLoan?.loanCurrency === 'COP') {
        convertedPaymentValue = `${(rate * amount).toFixed(2)} COP`;
      } else {
        convertedPaymentValue = `${(amount / rate).toFixed(2)} USD`;
      }
      setConvertedPayment(convertedPaymentValue);
    } else {
      setConvertedPayment('');
    }
  };
  useEffect(() => {
    handlePaymentConversionRate({ target: { value: conversionRate } });
  }, [paymentAmount, conversionRate, selectedLoan]);

  const handlePenalityRateChange = (e) => {
    let value = e.target.value;

    value = value.replace(/[^\d.]/g, '');

    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    if (decimalCount === 1) {
      const parts = value.split('.');
      if (parts[1].length > 2) {
        value = `${parts[0]}.${parts[1].slice(0, 2)}`;
      }
    }

    if (value === '') {
      setPenalityRate('');
      setPenalityPayment('');
      return;
    }
    const rate = parseFloat(value);
    if (isNaN(rate) || rate < 0) {
      return;
    }
    setPenalityRate(value);

    let amount;
    if (conversionRate <= 0) {
      amount = parseFloat(paymentAmount.replace(/,/g, ''));
    } else {
      amount = parseFloat(convertedPayment.split(" ")[0]);
    }

    if (!isNaN(amount)) {
      let penalityPaymentValue = `${(rate * amount / 100).toFixed(2)} ${selectedLoan?.loanCurrency}`;
      setPenalityPayment(penalityPaymentValue);
    } else {
      setPenalityPayment('');
    }
  };

  useEffect(() => {
    handlePenalityRateChange({ target: { value: penalityRate } });
  }, [paymentAmount, penalityRate, conversionRate, selectedLoan]);

  const handlePenalityPaymentOnBlur = () => {
    const penalityAmountMatch = penalityPayment.match(/\d+(\.\d+)?/);

    if (penalityAmountMatch && !penalityPayment.endsWith(selectedLoan?.loanCurrency)) {
      const penalityAmount = penalityAmountMatch[0];
      setPenalityPayment(`${penalityAmount} ${selectedLoan?.loanCurrency}`);
    }
  };


  const handleError = () => {
    const errors = {};
    console.log(paymentAmount)
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      errors.paymentAmount = ("Please enter payment amount");
    }
    if (selectedLoan?.loanCurrency !== currencyCategory && !conversionRate) {
      errors.conversionRate = ("Please Insert conversion Rate");
    }

    if (selectedLoan?.isLate == 1 && !/\d/.test(penalityPayment)) {
      errors.penalityRate = "No penality";
      errors.penalityPayment = "To be sure, insert zero";
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
      const formattedPaymentAmount = paymentAmount.replace(/,/g, '');
      let formatPenalityRate = 0, penalityAmount = 0;
      if (!penalityRate && !/\d/.test(penalityPayment)) {
        penalityAmount = parseFloat(penalityPayment?.match(/\d+(\.\d+)?/)?.join(''));
        formatPenalityRate = penalityAmount / parseFloat(paymentAmount) * 100;
      }
      const formattedData = {
        "data": [{
          "payment": {
            "paymentAmount": parseFloat(formattedPaymentAmount),
            "paymentCurrency": currencyCategory,
            "paymentConversionRate": conversionRate ? conversionRate : 0,
            "paymentConversionAmount": isNaN(convertedPayment.split(' ')[0]) ? 0 : parseFloat(convertedPayment.split(' ')[0]),
            "loanHashId": selectedLoan.LoanHashID,
            "paymentMethod": paymentMethod,
            "paymentNote": paymentNote,
            "latePaymentReason": lateReason,
            "penalityRate": parseFloat(penalityRate) || parseFloat(formatPenalityRate),
            "penalityAmount": parseFloat(penalityAmount),
            "approvedBy": user?.userHashId
          }
        }]
      }
      try {
        const response = await paymentData.addPayment(formattedData, token.token);
        if (response.status === 400) {
          setLoading(false);
          navigate("/500");
          return;
        }
        const data = await response.json();
        setStatus(data?.status)
        const tokenn = data?.paymentInformation;
        const decoded = jwtDecode(tokenn);
        setPaymentInfo()
        if (data?.status === "OK" && data?.msg === "Payment created successfully") {
          let nextPaymentContent = '';
          if (decoded.statusCheck === 'Active') {
            nextPaymentContent = `<p style="color: #4CAF50;">Next Payment</p><ul style="list-style-type: none; padding: 0; margin: 0;"><li style="padding: 5px 0;"><strong>Amount:</strong> ${decoded.loanInfo.LoanCurrency} ${formatNumberWithCommas(decoded.nextPaymentStatus.NextPaymentAmount)}</li><li style="padding: 5px 0;"><strong>Due Date:</strong> ${formatDate(decoded.nextPaymentStatus.NextExpirationDate)}</li></ul>`;
          } else if (parseFloat(decoded.returnPayment) > 0) {
            nextPaymentContent = `<p style="color: #4CAF50;">Congratulations, <br> Payment Completed For this Loan</p><p style="color: #4CAF50;">Return Money:</strong> ${formatNumberWithCommas(decoded.returnPayment)}</p>`;
          } else {
            nextPaymentContent = `<p style="color: #4CAF50">Congratulations, <br> Payment Completed For this Loan</p>`;
          }

          setInfoMessage(`<p style="color: #4CAF50; text-align: center;">Payment Received!</p>
            <p>Payment has been successfully processed:</p>
            <p style="color: #4CAF50;">Total Received!</p><ul style="list-style-type: none; padding: 0; margin: 0 0 10px 0;"><li style="padding: 5px 0;"><strong>Total Paid up to now:</strong> ${decoded.loanInfo.LoanCurrency} ${formatNumberWithCommas(decoded.newPayedPayment)}</li><li style="padding: 5px 0;"><strong>Remaining Balance:</strong> ${decoded.loanInfo.LoanCurrency} ${formatNumberWithCommas(decoded.newRemainingPayment)}</li></ul>${nextPaymentContent}`);
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


  const handleFocus = (field) => {
    setFormErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[field];
      return updatedErrors;
    });
    setSubmitInfo("");
  };
  const handleAddLoan = () => {
    navigate("/admin/add-loan")
  }

  const resetHandle = () => {
    setSelectedLoan(null);
    setEmail('');
    setloanDate('');
    setLoanAmount('');
    setPaymentAmount('');
    setCurrencyCategory(0);
    setConvertedPayment('');
    setConversionRate('');
    setPayMethodCategory(0);
    setpaymentNote('');
    setPenalityRate('');
    setLateReason('');
    setShowDropdown(false);
    setShowDropdown(false);
    setFormErrors({});
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 200);
  }
  const handleCloseInfoDialog = () => {
    setShowInfoDialog(false);
    if (status === "OK") {
      navigate(-1);
    } else {
      navigate("/500");
      return;
    }
  };


  if (loading) {

    return <LoadingIndicator />
  }


  return (
    <div>
      <div className="z-50 fixed inset-0 flex items-start justify-start 2xs:justify-center w-full bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto pt-10">
        <div className="bg-white sm:ml-24 px-8 rounded-lg w-3/5 md:w-1/2 max-h-[800px] max-w-[1200px] min-w-[360px]  overflow-auto">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mt-4">Add Payment</h1>

            <div
              className="cursor-pointer text-4xl px-3  text-red-300  hover:text-red-600"
              onClick={() => navigate(-1)}
            >
              x
            </div>

          </div >

          {(!isValidEmail || !selectedLoan) ?
            (
              <div className="flex flex-col xl:flex-row justify-between">
                <div className="p-2 italic text-lg font-semibold">
                  <span className="text-3xl text-lime-800">Search </span>
                  <span className="text-2xl text-lime-800"> {`${'then'}`} </span>
                  <span className="  text-lg text-emerald-600"> Select loan from dropdown</span>
                </div>
                <div className="flex justify-end">
                  <div className="flex">
                    <div className="p-2 italic text-md md:text-lg font-semibold text-lime-800 ">New Loan? </div>
                    <button className="max-h-10 max-w-64 py-2 px-6 xl:px-2 bg-green-100 hover:bg-green-200  rounded-lg" onClick={handleAddLoan}>
                      Add Loan
                    </button>

                  </div>
                </div>
              </div>
            ) :
            <div className="flex justify-between">
              <div className="mb-4 px-2 my-3  py-1 text-md italic text-red-900">
                {submitInfo ? submitInfo : ""}
              </div>
              <button disabled={submitLoading} className="px-6 mt-3 mb-5 max-h-8 bg-red-100 hover:bg-red-200 rounded-md" onClick={resetHandle}>
                Reset
              </button>
            </div>
          }
          <form onSubmit={handleFormSubmit} noValidate>
            <div className="space-y-4">
              {
                !selectedLoan &&
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
                    placeholder="Search by Name, Email, Loan Amount, or Given Date"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-bottom pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="mt-2 md:mt-7 md:ml-5 text-gray-400" size="lg" />
                  </div>
                </div>
              }
              {showDropdown && !selectedLoan && (
                <div className="absolute ml-[-32px] mt-2 w-[60%] md:w-1/2 bg-green-100 border border-green-300 rounded-lg z-10 min-w-[360px]  shadow-lg">
                  {eligibleLoans.length > 0 &&
                    <div className="bg-green-200 text-gray-700 font-bold pl-16 py-2 border-b border-green-300 rounded-t-lg hidden xl:grid xl:grid-cols-10 gap-1">
                      <span className="text-gray-700 xl:col-span-2">Name</span>
                      <span className="text-sm text-gray-500 xl:col-span-3">Email</span>
                      <span className="text-sm text-gray-500 xl:col-span-2">Loan Amount</span>
                      <span className="text-sm text-gray-500 xl:col-span-3">Borrowed Date</span>
                    </div>}

                  <div className="overflow-y-auto max-h-96 xl:max-h-48 opacity-85">
                    <ul className="ml-5">
                      {eligibleLoans.map((loan, index) => (
                        <li
                          key={loan.LoanHashID}
                          className="cursor-pointer pl-10 py-2 hover:bg-green-200 hover:text-blue-800 rounded grid grid-rows-4 xl:grid-cols-10 xl:grid-rows-1 xl:gap-1"
                          onClick={() => handleUserSelect(loan)}
                          role="option"
                          aria-selected="false"
                        >

                          <span className="font-medium text-gray-700 xl:col-span-2"><span className="xl:hidden mr-10">Name  </span>{`${loan.name}`}</span>
                          <span className="text-sm text-gray-500 xl:col-span-3"><span className="xl:hidden mr-12">E-mail  </span>{loan.email}</span>
                          <span className="text-sm text-gray-500 xl:col-span-2"><span className="xl:hidden mr-1">Loan Amount  </span>{`${loan.loanCurrency} ${formatNumberWithCommas(loan.loanAmounted)}`}</span>
                          <span className="text-sm text-gray-500 xl:col-span-3"><span className="xl:hidden mr-2">Borrowed on  </span>{loan.loanDate}</span>
                        </li>
                      ))}
                    </ul>

                  </div>
                </div>
              )}
              {selectedLoan &&
                <div className="w-full flex flex-col 2xl:flex-row gap-1 2xl:gap-0 justify-end 2xl:mb-3">
                  <div className="flex flex-col gap-1 2xl:gap-4 ml-4 w-full  ">
                    <div className="flex 2xl:w-full ">
                      <label className="xl:w-3/12 2xl:w-3/12" htmlFor="name">Name - </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        className="xl:selection:w-9/12 2xl:w-11/12"
                        disabled
                      />
                    </div>
                    <div className="flex 2xl:w-full">
                      <label className="xl:w-3/12 2xl:w-3/12" htmlFor="email">Email - </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        className="xl:w-9/12 2xl:w-11/12"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 2xl:gap-4 ml-4 w-full ">
                    <div className="flex w-full ">
                      <label className="flex items-center xl:w-3/12 2xl:w-5/12" htmlFor="loanDate">Loan Given Date -</label>
                      <input
                        id="loanDate"
                        type="text"
                        value={loanDate}
                        className="pl-1 xl:w-9/12 2xl:w-7/12"
                        disabled
                      />
                    </div>
                    <div className="flex w-full ">
                      <label className="flex items-center xl:w-3/12 2xl:w-6/12" htmlFor="loanAmount">Loan Amount -</label>
                      <input
                        id="loanAmount"
                        type="text"
                        value={loanAmount}
                        className="pl-1 xl:w-9/12 2xl:w-8/12"
                        disabled
                      />
                    </div>
                  </div>

                </div>}
              {selectedLoan && <div className="md:flex md:space-x-4 space-y-4">
                <input
                  id="paymentAmount"
                  required
                  type="text"
                  value={formErrors.paymentAmount ? formErrors.paymentAmount : paymentAmount}
                  ref={paymentAmountInputRef}
                  onChange={(e) => handlePaymentAmountChange(e.target.value)}
                  disabled={!selectedLoan || !isValidEmail}
                  onBlur={handlePaymentAmountOnBlur}
                  onFocus={() => handleFocus("paymentAmount")}
                  className={`md:mt-4 md:ml-4 border p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 ${(!selectedLoan || !isValidEmail || formErrors.paymentAmount) ? ' border-red-400 italic text-sm text-red-300' : 'border-green-400'
                    }`}
                  placeholder={`Expected Amount- ${formatNumberWithCommas(selectedLoan.nextPayment)} ${selectedLoan.loanCurrency}`}
                />
                <select
                  value={currencyCategory}
                  disabled={!selectedLoan || !isValidEmail}
                  onChange={handleCurrencyChange}
                  className={` md:mt-4 md:ml-4 p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 ${(!selectedLoan || !isValidEmail) ? 'border border-red-200' : 'border border-green-400'}`}
                >
                  <option value="" className="w-[10px]" disabled>Select Currency</option>
                  <option value="USD" className="w-[10px]">USD</option>
                  <option value="COP" className="w-[10px]">COP</option>
                </select>


              </div>}
              {selectedLoan && paymentAmount && currencyCategory !== 0 && selectedLoan?.loanCurrency !== currencyCategory && (
                <div className="md:flex md:space-x-4 space-y-4">
                  <input
                    id="conversionRate"
                    type="text"
                    disabled={!selectedLoan || !isValidEmail}
                    value={formErrors.conversionRate ? formErrors.conversionRate : !paymentAmount ? 0 : conversionRate}
                    onChange={handlePaymentConversionRate}
                    onFocus={() => handleFocus("conversionRate")}
                    className={`md:mt-4 md:ml-4 border p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 ${(!selectedLoan || !isValidEmail || formErrors.conversionRate) ? ' border-red-400 italic text-sm text-red-300' : 'border-green-400'}`}
                    placeholder="1 USD = ? COP"
                  />

                  <input
                    id="convertedPayment"
                    type="text"
                    disabled
                    value={convertedPayment}
                    className={`md:mt-4 md:ml-4 p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 border ${(!selectedLoan || !isValidEmail) ? 'border-red-200' : 'border-green-400'}`}
                    placeholder="The converted Payment"
                  />
                </div>
              )}
              {selectedLoan && <div className="md:flex md:space-x-4 space-y-4">
                <select
                  value={paymentMethod}
                  disabled={!selectedLoan || !isValidEmail}
                  onChange={handlePayMethodChange}
                  className={`md:mt-4 md:ml-4 p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-200 border ${(!selectedLoan || !isValidEmail) ? 'border-red-200' : 'border-green-400'
                    }`}
                >
                  <option value="Cash">Cash</option>
                  <option value="Debit-Card">Debit-Card</option>
                  <option value="Credit-Card">Credit-Card</option>
                  <option value="Bank">Bank</option>
                  <option value="Others">Others</option>
                </select>
                <textarea
                  id="paymentNote"
                  type="text"
                  disabled={!selectedLoan || !isValidEmail}
                  value={paymentNote}
                  onChange={(e) => setpaymentNote(e.target.value)}
                  className={`md:mt-4 md:ml-4 p-2 rounded-lg w-full h-11 focus:outline-none focus:ring-1 focus:ring-green-600 border ${(!selectedLoan || !isValidEmail) ? 'border-red-200' : 'border-green-400'
                    }`}
                  placeholder="Payment Note"
                />

              </div>}

              {selectedLoan && paymentAmount && currencyCategory !== 0 && selectedLoan?.isLate === 1 ?
                (
                  <div className="md:flex md:space-x-4 space-y-4">
                    <input
                      id="penalityRate"
                      type="text"
                      disabled={!selectedLoan || !isValidEmail}
                      value={formErrors.penalityRate ? formErrors.penalityRate : penalityRate}
                      onChange={handlePenalityRateChange}
                      onFocus={() => handleFocus("penalityRate")}
                      className={`md:mt-4 md:ml-4 border p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 ${(!selectedLoan || !isValidEmail || formErrors.penalityRate) ? ' border-red-400 italic text-sm text-red-300' : 'border-green-400'}`}
                      placeholder="Penality Rate in %"
                    />
                    <input
                      id="penalityPayment"
                      type="text"
                      onChange={(e) => { setPenalityRate(''); setPenalityPayment(e.target.value) }}
                      value={formErrors.penalityPayment ? formErrors.penalityPayment : penalityPayment}
                      onBlur={handlePenalityPaymentOnBlur}
                      onFocus={() => handleFocus("penalityPayment")}
                      className={`md:mt-4 p-2  rounded-lg w-5/12 focus:outline-none focus:ring-1 focus:ring-green-600 border ${(!selectedLoan || !isValidEmail || formErrors.penalityPayment) ? ' border-red-400 italic text-sm text-red-300' : 'border-green-400'}`}
                      placeholder="Penailty Money"
                    />

                    <textarea id="lateReason" type="text" disabled={!selectedLoan || !isValidEmail} value={lateReason} onChange={(e) => setLateReason(e.target.value)} className={`p-2 rounded-lg w-full h-11 focus:outline-none focus:ring-1 focus:ring-green-600 border ${(!selectedLoan || !isValidEmail) ? 'border-red-200' : 'border-green-400'
                      }`} placeholder="Enter the Reason for being Late" />

                  </div>

                ) : null}

            </div>
            {console.log(formErrors)}
            <div className="flex justify-end mt-6">
              {selectedLoan &&
                <button
                  type="submit"
                  disabled={submitLoading || (formErrors && Object.keys(formErrors).length !== 0)}
                  className={`py-2 w-full md:w-[30%] text-center   rounded-lg text-sm  mb-4 ${submitLoading || (formErrors && Object.keys(formErrors).length !== 0) ? 'cursor-not-allowed opacity-70 bg-green-200 text-gray-700 font-bold' : 'text-gray_light  bg-green__ hover:bg-green-200 hover:text-gray-700 hover:font-bold'
                    }`}
                >
                  {submitLoading ? 'Submitting...' : formErrors && Object.keys(formErrors).length !== 0 ? 'Correct the error first' : 'Create Payment'}
                </button>}

            </div>
          </form>
        </div>
      </div >
      {
        showInfoDialog && (
          <InfoDialog
            message={infoMessage}
            onClose={handleCloseInfoDialog}
            type={infoType}
          />
        )
      }
    </div >
  );
};

export default AddPaymentForm;