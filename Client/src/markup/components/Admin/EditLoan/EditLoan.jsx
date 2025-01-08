import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";
import { useAuth } from "../../../../Contexts/useHook";
import userService from "../../../../services/users.service";
import getAuth from "../../../../util/auth";
import loanData from "../../../../services/loanData.service";
import InfoDialog from "../../../../util/InformationPage";
import LoadingIndicator from "../../../../util/LoadingIndicator";

const EditLoan = () => {
  const navigate = useNavigate();
  const { setOpenPage } = useAuth()
  const { hashId } = useParams();
  const [selectedLoan, setSelectedLoan] = useState({});
  const [fullName, setFullName] = useState(` `);
  const [email, setEmail] = useState('');
  const [loanBeginDate, setLoanBeginDate] = useState('');
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPeriod, setLoanPeriod] = useState("");
  const [loanCurrency, setLoanCurrency] = useState("");
  const [loanPaymentMethod, setLoanPaymentMethod] = useState("");
  const [durationCategory, setDurationCategory] = useState('');
  const [calculateExpiredDate, setCalculateExpiredDate] = useState("");
  const [loanInterestRate, setLoanInterestRate] = useState("");
  const [totalInterest, setTotalInterest] = useState("");
  const [startingCategory, setStartingCategory] = useState('pre');
  const [calculateStartedDate, setCalculateStartedDate] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [collateral, setCollateral] = useState("");
  const [startingDate, setStartingDate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [difference, setDifference] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [infoType, setInfoType] = useState('');
  const [submitInfo, setSubmitInfo] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [changes, setChanges] = useState({});
  const [warning, setWarning] = useState(false);
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };



  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const tokenOnStorage = localStorage.getItem("user");
      const token = JSON.parse(tokenOnStorage);
      const response = await loanData.getLoanInfoData(hashId, token.token);
      if (response.status === 400) {
        setLoading(false);
        navigate("/500");
        return;
      }
      const responseObj = await response?.json();
      const data = await responseObj?.response?.loanList[0];
      if (data) {
        setSelectedLoan(data);
        setFullName(`${data?.firstName} ${data?.lastName} `)
        setEmail(data?.email || "")
        setLoanBeginDate(data?.loanBegin || "")
        setLoanAmount(data?.loanAmount || "")
        setLoanPeriod(data?.loanPeriod || "")
        setLoanCurrency(data?.loanCurrency || "")
        setLoanPaymentMethod(data?.loanPaymentMethod || "")
        setCalculateExpiredDate(data?.loanExpirationDate || "")
        setCalculateStartedDate(data?.loanStartDate || "")
        setLoanInterestRate(data?.loanInterestRate || "")
        setTotalInterest(`${data?.totalInterest} ${data?.loanCurrency}` || "")
        setLoanPurpose(data?.loanPurpose || "")
        setCollateral(data?.collateral || "")
      }
    } catch (error) {
        setLoading(false);
        navigate("/500");
        return;
    } finally {
      setLoading(false);
    }

  }


  useEffect(() => {
    setOpenPage("EditLoan")
    fetchDashboardData();
  }, [hashId, setOpenPage]);


  const handleCloseInfoDialog = () => {
    setShowInfoDialog(false);
    if (status === "OK") {
      navigate(-1);
    }
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
        const nextMonday = new Date(currentDate);
        nextMonday.setDate(nextMonday.getDate() + (14 - nextMonday.getDay() + 1) % 7);
        adjustedDate.setDate(adjustedDate.getDate() === nextMonday.getDate() ? nextMonday.getDate() + 7 : nextMonday.getDate());
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

  useEffect(() => {
    if (!loading) {
      const handleStartingCalculatedChange = () => {
        if (startingCategory === "pre") {
          setCalculateStartedDate(selectedLoan.loanStartDate)

        } else if (startingCategory === "now") {
          const currentDate = adjustDate(new Date(), loanPeriod);
          setCalculateStartedDate(currentDate?.toLocaleDateString('en-US', options))

        } else if (startingDate) {
          const startDate = startingDate;
          const starting = adjustDate(startDate, loanPeriod);
          setCalculateStartedDate(starting?.toLocaleDateString('en-US', options))
        }
      }
      handleStartingCalculatedChange();
    }

    setChanges({
      ...changes, ["calculateStartedDate"]: (new Date
        (calculateStartedDate))?.getTime()
    });

  }, [startingDate, startingCategory, durationCategory, calculateStartedDate])

  useEffect(() => {
    if (!loading) {
      const handleExpirationCalculatedChange = () => {
        if (expireDate && !loanTerm) {
          if ((new Date(calculateExpiredDate)).getTime() === (new Date(selectedLoan.loanExpirationDate)).getTime()) {
            const newDate = adjustDate(expireDate, loanPeriod)
            setCalculateExpiredDate(newDate?.toLocaleDateString('en-US', options));
          }
        } else if (loanTerm && !expireDate) {
          const starting = adjustDate((startingDate ? startingDate : new Date()), loanPeriod)
          const newDate = calculateExpirationDate(starting, loanPeriod, loanTerm);
          setCalculateExpiredDate(newDate?.toLocaleDateString('en-US', options));
        } else if (selectedLoan.loanExpirationDate) {
          setCalculateExpiredDate(selectedLoan.loanExpirationDate);
        }
      }
      handleExpirationCalculatedChange();
    }

    setChanges({ ...changes, ["calculateExpireDate"]: (new Date(calculateExpiredDate)).getTime() });

  }, [loanPeriod, loanTerm, expireDate, startingDate, calculateExpiredDate]);


  useEffect(() => {
    checkChanges();
  }, [changes, selectedLoan, warning]);


  const handleError = () => {
    const errors = {};

    if (!loanAmount) {
      errors.loanAmount = ("Please enter a loan amount");
    }
    if (!loanInterestRate) {
      errors.loanInterestRate = ("Interest Rate needed");
    }

    if (!loanPeriod) {
      errors.loanPeriod = "Please select the period first";
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
    setSubmitLoading(true);
    checkChanges();
    const errors = handleError();
    if (errors && Object.keys(errors).length === 0 && warning) {
      setSubmitInfo('');
      const user = await getAuth();
      const tokenOnStorage = localStorage.getItem("user");
      const token = JSON.parse(tokenOnStorage);
      const formattedLoanAmount = loanAmount.replace(/,/g, '');

      const formattedData = {
        "data": [{
          "loan": {
            "loanHashId": hashId,
            "userEmail": selectedLoan.email,
            "loanAmount": parseFloat(formattedLoanAmount),
            "loanCurrency": loanCurrency === 0 ? "USD" : "COP",
            "loanStartDate": new Date(calculateStartedDate),
            "loanExpireDate": new Date(calculateExpiredDate),
            "loanPeriod": loanPeriod,
            "loanTerm": parseInt(calculateLoanTerm(new Date(calculateStartedDate), new Date(calculateExpiredDate), loanPeriod)),
            "collateral": collateral,
            "loanPurpose": loanPurpose,
            "loanInterestRate": parseFloat(loanInterestRate),
            "loanPaymentMethod": loanPaymentMethod,
            "createdBy": user?.userHashId
          }
        }]
      };
      try {
        const response = await loanData.updateLoan(formattedData, token.token);
        if (response.status === 400) {
          setLoading(false);
          navigate("/500");
          return;
        }
        const data = await response.json();
        setStatus(data?.response?.status)
        if (data?.response?.status === "OK" && data?.response?.msg === "Loan updated successfully") {
          
          setInfoMessage(`Loan data updated successfully!`);
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

  const renderAlert = (field) => {
    let fieldValue
    if (field == "calculateExpireDate") {
      fieldValue = selectedLoan ? (new Date(selectedLoan?.loanExpirationDate)).getTime()?.toString().trim() : "";
    } else if (field == "calculateStartedDate") {
      fieldValue = selectedLoan ? (new Date(selectedLoan?.loanStartDate)).getTime()?.toString().trim() : "";
    } else {
      fieldValue = selectedLoan ? selectedLoan[field]?.toString().trim() : "";
    }

    let changesValue = changes[field]?.toString().trim();
    if ((changesValue || changesValue === "") && ((changesValue !== fieldValue) ||
      (field == "loanInterestRate") &&
      ((changes["loanAmount"] ? changes["loanAmount"] !== selectedLoan.loanAmount : false) ||
        (changes["loanCurrency"] ? changes["loanCurrency"] !== selectedLoan.loanCurrency : false)
      )
    )) {

      if (!(field in difference)) {
        setDifference((prevData) => ({ ...prevData, [field]: changesValue }));
      }

      if (!warning) {
        setWarning(true);

      }
      return (
        <span className="text-red-400 text-sm italic pl-3">
          {`${field === "loanPaymentMethod" ? `${selectedLoan?.loanPaymentMethod}` :
            field === "calculateExpireDate" ? `Prev=>  ${selectedLoan?.loanExpirationDate}` :
              field === "calculateStartedDate" ? `Prev =>  ${selectedLoan?.loanStartDate}` :
                `Prev => ${fieldValue}${field === "loanPeriod" ? `ly`
                  : ''}
          ${field === "loanInterestRate" ? `% = ${selectedLoan?.totalInterest} ${selectedLoan?.loanCurrency}` :
                  ''}`}`}
        </span>
      );
    }
    return null;
  };

  const handleInputChange = (e, setter, field) => {
    let newValue;
    if (field === "loanAmount") {
      newValue = e.target.value;
      let formattedAmount = handleLoanAmountChange(newValue);
      let loanAmountTrim = formattedAmount.split(".")[1];
      if (!loanAmountTrim || loanAmountTrim === "0" || loanAmountTrim === "00") {
        const wholePart = formattedAmount?.split(".")[0];
        newValue = `${wholePart}.00`;
      }

      setChanges(prevChanges => ({ ...prevChanges, [field]: newValue }));
    } else {
      newValue = e.target.value;
      setChanges(prevChanges => ({ ...prevChanges, [field]: newValue }));
      setter(newValue);
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
    handleLoanInterestRate(loanInterestRate);
    return formattedInput;
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

  const checkChanges = () => {
    setDifference({});
    for (let key in changes) {
      if (changes[key] === selectedLoan[key] || (!selectedLoan[key])) {
        setWarning(false);
      } else {
        setDifference((prevData) => ({ ...prevData, [key]: changes[key] }));
      }
    }
  };

  const resetHandle = () => {
    setFullName(`${selectedLoan?.firstName} ${selectedLoan?.lastName} `)
    setEmail(selectedLoan?.email || "")
    setLoanBeginDate(selectedLoan?.loanBegin || "")
    setLoanAmount(selectedLoan?.loanAmount || "")
    setLoanPeriod(selectedLoan?.loanPeriod || "")
    setLoanCurrency(selectedLoan?.loanCurrency || "")
    setLoanPaymentMethod(selectedLoan?.loanPaymentMethod || "")
    setCalculateExpiredDate(selectedLoan?.loanExpirationDate || "")
    setCalculateStartedDate(selectedLoan?.loanStartDate || "")
    setCalculateStartedDate(selectedLoan?.loanStartDate || "")
    setLoanInterestRate(selectedLoan?.loanInterestRate || "")
    setTotalInterest(`${selectedLoan?.totalInterest} ${selectedLoan?.loanCurrency}` || "")
    setLoanPurpose(selectedLoan?.loanPurpose || "")
    setCollateral(selectedLoan?.collateral || "")
    setExpireDate('')
    setStartingDate('')
    setLoanTerm('')
    setDurationCategory('')
    setSubmitInfo('');
    setFormErrors({});
    setStartingCategory('pre');
    setWarning(false)
    const newChanges = {};
    setChanges(newChanges);
  };

  const handleLoanInterestRate = (rate) => {
    const rateString = rate.toString();
    const decimalPart = rateString.split('.')[1];
    const rateChange = decimalPart === undefined || decimalPart === "0" ? rateString + ".00" : rateString;

    if (!isNaN(rate) && rate >= 0 && Math.sign(rate) !== -1) {
      const amount = loanAmount.replace(/,/g, '');
      if (!isNaN(amount)) {
        const interestValue = `${(rate * amount / 100).toFixed(2)} ${loanCurrency}`;
        setTotalInterest(interestValue);
        setChanges(prevChanges => ({ ...prevChanges, loanInterestRate: rateChange }));
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
    if (loanAmount) {
      handleLoanInterestRate(loanInterestRate);
    }
  }, [loanAmount, loanCurrency]);

  const calculateMinDate = () => {
    const calculatedDate = new Date(Math.max(adjustDate(new Date(calculateStartedDate || null), loanPeriod), Date.now()));
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





  if (loading) {
    return <LoadingIndicator />
  }

  return (
    <div>
      <div className="z-50 fixed inset-0 flex items-start justify-center bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto pt-10">
        <div className="bg-white sm:ml-24 px-8 rounded-lg w-3/5 md:w-1/2 max-h-[800px] max-w-[1200px] overflow-y-auto">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold my-6">Edit Loan</h1>


            <div
              className="cursor-pointer text-4xl px-3  text-red-300  hover:text-red-600"
              onClick={handleClose}
            >
              x
            </div>


          </div >


          <div className="flex justify-between">
            <div className="mb-4 px-2 py-1 text-md italic text-red-900">
              {submitInfo ? submitInfo : ""}
            </div>
            <button className="px-6 max-h-8 bg-red-100 hover:bg-red-200  rounded-md" onClick={resetHandle}>
              Reset
            </button>
          </div>

          <form onSubmit={handleFormSubmit} noValidate>
            <div className="">
              <div className="w-full flex justify-end">

                <div className="flex flex-col gap-2 ml-5  w-7/12  ">
                  <div className="flex w-full">
                    <label className="w-2/12" htmlFor="fullName">Name</label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      className="w-9/12"
                      disabled
                    />
                  </div>
                  <div className="flex w-full">
                    <label className=" w-2/12" htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      className="w-9/12"
                      disabled
                    />
                  </div>
                </div>
                <div className="flex w-5/12 ">
                  <label className="flex items-center w-2/5" htmlFor="loanBeginDate">Borrowed Date</label>
                  <input
                    id="loanBeginDate"
                    type="text"
                    value={loanBeginDate}
                    className="pl-2 w-3/5"
                    disabled
                  />
                </div>

              </div>
              <div className="lg:flex ">
                <div className="flex flex-col w-full  lg:ml-4 ">
                  <label className="px-1 mt-4 mb-2" htmlFor="loanAmount">Loan Amount{renderAlert('loanAmount')}</label>
                  <input
                    id="loanAmount"
                    required
                    type="text"
                    value={`${formErrors.loanAmount ? formErrors.loanAmount : loanAmount}`}
                    onChange={(e) => {
                      handleInputChange(e, setLoanAmount, 'loanAmount');
                    }}
                    onFocus={() => handleFocus("loanAmount")}
                    onBlur={handleLoanAmountOnBlur}
                    className={` border p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 ${(formErrors.loanAmount) ? 'border-red-400 italic text-sm text-red-300 ' : 'border-green-400'
                      }`}
                    placeholder="Loan Amount *"
                  />
                </div>
                <div className="flex flex-col w-full  lg:ml-4 ">
                  <label className="px-1 mt-4 mb-2" htmlFor="period">Period{renderAlert('loanPeriod')}</label>
                  <select
                    value={loanPeriod}
                    onChange={(e) => handleInputChange(e, setLoanPeriod, "loanPeriod")}
                    onClick={() => {
                      setDurationCategory('');
                      setExpireDate('');
                      setStartingDate('');
                      setLoanTerm('');
                      setStartingCategory('pre');
                    }}
                    onFocus={() => handleFocus("loanPeriod")}
                    className={` border p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 ${(formErrors.loanPeriod) ? 'border-red-400 italic text-sm text-red-300' : 'border-green-400'
                      }`}>
                    <option value="" disabled>
                      {`${formErrors.loanPeriod ? formErrors.loanPeriod : "Select Period"}`}
                    </option>
                    <option value="week">Weekly</option>
                    <option value="bi-week">Bi-Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="half-year">Semi-Anually</option>
                    <option value="year">Anually</option>
                  </select>

                </div>
              </div>
              <div className="lg:flex w-full">
                <div className="lg:flex lg:flex-col w-full lg:w-1/2 ">
                  <div className="w-full flex lg:ml-4 ">
                    <label className="px-1 mt-4 mb-2 w-full lg:w-1/2" htmlFor="loanCurrency">Currency{renderAlert('loanCurrency')}</label>
                    <label className="px-1 mt-4 mb-2 w-full lg:w-1/2" htmlFor="loanPaymentMethod">Pay Method{renderAlert('loanPaymentMethod')}</label>
                  </div>
                  <div className="lg:w-full flex gap-2 ">
                    <select
                      value={loanCurrency}
                      onChange={(e) => handleInputChange(e, setLoanCurrency, "loanCurrency")}
                      className={` lg:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border border-green-400`}>
                      <option value="" disabled>Select Currency</option>
                      <option value="USD">USD</option>
                      <option value="COP">COP</option>
                    </select>

                    <select
                      value={loanPaymentMethod}
                      onChange={(e) => handleInputChange(e, setLoanPaymentMethod, "loanPaymentMethod")}
                      onFocus={() => { handleFocus("calculateStartedDate"); handleFocus("calculteExpireDate"); }}
                      className={`p-2  rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border border-green-400`}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Debit-Card">Debit-Card</option>
                      <option value="Credit-Card">Credit-Card</option>
                      <option value="Bank">Bank</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>
                <div className="lg:flex lg:flex-col w-full lg:w-1/2 ">
                  <div className="w-full flex lg:ml-4 ">
                    <label className="px-1 mt-4 mb-2 w-4/12" htmlFor="duration">
                      Expire Date
                    </label>
                    <span className="pl-2 mt-4 mb-2 w-8/12 " htmlFor="exDate">{renderAlert('calculateExpireDate')}</span>
                  </div>
                  <div className="lg:w-full flex gap-2">

                    {!durationCategory ?
                      <select
                        value={durationCategory}
                        onChange={(e) => handleInputChange(e, setDurationCategory, "durationCategory")}
                        onFocus={() => { handleFocus("durationCategory"); handleFocus("calculateStartedDate"); handleFocus("calculateExpiredDate") }}
                        className={`lg:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border border-green-400 ${(formErrors.durationCategory) ? 'border-red-400 italic text-sm text-red-300' : ''
                          }`}>
                        <option value="" disabled>
                          {`${formErrors.durationCategory ? formErrors.durationCategory : "Previous Date"}`}
                        </option>
                        <option value="expireDate">New Expire date</option>
                        <option value="term">Insert New Term</option>
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
                          className={`lg:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border border-green-400 ${formErrors.expireDate ? ' border-red-400 italic text-sm text-red-300' : ''}`}
                          placeholder="Select Expiration Date"
                          min={calculateMinDate()}

                        />
                      ) : (
                        <input
                          id="term"
                          type="text"
                          value={`${formErrors.loanTerm ? formErrors.loanTerm : loanTerm}`}
                          onChange={handleLoanTermChange}
                          onFocus={() => { handleFocus("loanTerm"); handleFocus("calculateStartedDate"); handleFocus("calculateExpireDate"); }}
                          className={`lg:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border border-green-400 ${formErrors.loanTerm ? 'border-red-400 italic text-sm text-red-300' : ''
                            }`}
                          placeholder="How Many Term...?"
                        />
                      )}
                    <input
                      id="calculateExpiredDate"
                      type="text"
                      disabled
                      value={`${formErrors.calculateExpiredDate ? formErrors.calculateExpiredDate : loanPeriod ? `Expire:- ${calculateExpiredDate}` : "Calculated Expired date"}`}
                      className={` p-2 w-1/2  text-xs  ${formErrors.calculateExpiredDate ? ' italic text-red-400' : ''}`}
                      placeholder={`${!loanAmount ? "Expired Date" : formErrors.calculateExpiredDate ? formErrors.calculateExpiredDate : "Total Interest"}`}
                    />
                  </div>
                </div>
              </div>
              <div className="lg:flex w-full">
                <div className="lg:flex lg:flex-col w-full lg:w-1/2 ">
                  <div className="w-full flex lg:ml-4 ">
                    <label className="px-1 mt-4 mb-2 w-full lg:w-Full" htmlFor="interestRate">Interest Rate{renderAlert('loanInterestRate')}</label>


                  </div>

                  <div className="lg:w-full flex gap-2">
                    <input
                      id="loanInterestRate"
                      type="number"
                      value={loanInterestRate}
                      onChange={(e) => handleLoanInterestRate(e.target.value)}
                      className={`lg:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border border-green-400 ${(!loanAmount || formErrors.loanInterestRate) ? 'border-red-400 italic text-sm text-red-300' : ''}`}
                      onFocus={() => handleFocus("loanInterestRate")}
                      placeholder="Interest Rate * %"
                      disabled={!loanAmount}
                    />
                    <input
                      id="totalInterest"
                      type="text"
                      disabled
                      value={`${!loanAmount ? "Amount needed" : formErrors.loanInterestRate ? formErrors.loanInterestRate : totalInterest}`}
                      onChange={(e) => setTotalInterest(e.target.value)}
                      className={`lg:ml-4 p-2 w-1/2 ${(!loanAmount || formErrors.loanInterestRate) ? ' italic text-sm text-red-300' : ''}`}
                      placeholder={`${!loanAmount ? "First add amount" : formErrors.loanInterestRate ? formErrors.loanInterestRate : "Total Interest"}`}
                    />
                  </div>
                </div>
                <div className="lg:flex lg:flex-col w-full lg:w-1/2 ">
                  <div className="w-full flex lg:ml-4 ">
                    <label className="px-1 mt-4 mb-2 w-4/12" htmlFor="startDate">Start Date</label>
                    <label className="px-1 mt-4 mb-2  w-8/12" htmlFor="calcStartDate">{renderAlert('calculateStartedDate')}</label>
                  </div>
                  <div className="lg:w-full flex gap-2 ">
                    {(startingCategory !== "startingDate") ? <select
                      value={startingCategory}
                      onChange={(e) => handleInputChange(e, setStartingCategory, "startingCategory")}
                      onFocus={() => { handleFocus("calculateStartedDate"); handleFocus("calculteExpireDate"); }}
                      className={`lg:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border border-green-400`}
                    >
                      <option value="pre">Previous Date</option>
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
                        className={`lg:ml-4 p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border border-green-400 ${formErrors.startingDate ? ' border-red-400 italic text-sm text-red-300' : ''}`}
                        placeholder="Select starting Date"
                        min={(new Date(Date.now() + 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
                        max={expireDate}
                      />}
                    <input
                      id="calculateStartedDate"
                      type="text"
                      disabled
                      value={`${formErrors.calculateStartedDate ? formErrors.calculateStartedDate : loanPeriod ? `Start:- ${calculateStartedDate}` : "Calculated Starting date"}`}
                      className={`p-2 w-1/2  text-xs  ${formErrors.calculateStartedDate ? ' italic text-sm  text-red-400' : ' '}`}
                      placeholder={`${!loanAmount ? "Started Date" : formErrors.calculateStartedDate ? formErrors.calculateStartedDate : "Total Starting Date"}`}
                    />
                  </div>
                </div>
              </div>
              <div className="lg:flex ">
                <div className="flex flex-col w-full lg:ml-4 ">
                  <label className="px-1 mt-4 mb-2" htmlFor="loanPurpose">Loan Purpose{renderAlert('loanPurpose')}</label>
                  <textarea id="loanPurpose"
                    type="text"
                    value={loanPurpose}
                    onChange={(e) => handleInputChange(e, setLoanPurpose, "loanPurpose")}
                    className=" border p-2 rounded-lg w-full h-11 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                    placeholder="Enter the purpose of this Loan" />
                </div>
                <div className="flex flex-col w-full lg:ml-4 ">
                  <label className="px-1 mt-4 mb-2" htmlFor="collateral">Collateral{renderAlert('collateral')}</label>
                  <input
                    id="collateral"
                    type="text"
                    value={collateral}
                    onChange={(e) => handleInputChange(e, setCollateral, "collateral")}
                    className=" border p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                    placeholder="Enter the collateral" />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={submitLoading || (formErrors && Object.keys(formErrors).length !== 0) || !warning}
                className={`py-2 w-full md:w-[30%] text-center text-gray_light bg-green__  rounded-lg text-sm  mb-4 ${!warning || submitLoading ? ' cursor-not-allowed opacity-50 ' : 'hover:font-bold hover:bg-green-200 hover:text-gray-700 bg-green-200'}`}
              >
                {!warning ? "No Changes to Save" : submitLoading ? "Loading ..." : "Save Changes"}
              </button>
              
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
    </div>
  );
};

export default EditLoan;
