import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../../Contexts/useHook";
import paymentDataService from "../../../../services/paymentData.service"
import paymentData from "../../../../services/paymentData.service";
import getAuth from "../../../../util/auth";
import formatNumberWithCommas from "../../../../util/NumberComma";
import InfoDialog from "../../../../util/InformationPage";
import LoadingIndicator from "../../../../util/LoadingIndicator";

const samplePayment = {
  "PaymentAmount": 5000000.00,
  "LoanCurrency": "USD",
  "PaymentCurrency": "USD",
  "paymentConversionRate": 4000.00,
  "PaymentMethod": "Credit-Card",
  "PaymentNote": "Payment for services rendered",
  "LatePaymentReason": "Sick",
  "PenaltyRate": 5
};

const EditPayment = () => {
  const navigate = useNavigate();
  const { setOpenPage } = useAuth();
  const { hashId } = useParams();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDate, setPaymentDate] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [fullName, setFullName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('');
  const [convertedPayment, setConvertedPayment] = useState('');
  const [penalityPayment, setPenalityPayment] = useState('');
  const [paymentConversionRate, setPaymentConversionRate] = useState('');
  const [paymentMethod, setPayMethodCategory] = useState('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [penalityRate, setPenalityRate] = useState('');
  const [latePaymentReason, setLatePaymentReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitInfo, setSubmitInfo] = useState('');
  const [difference, setDifference] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [infoType, setInfoType] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [changes, setChanges] = useState({});
  const [warning, setWarning] = useState(false);



  const fetchCustomerData = async () => {
    const tokenOnStorage = localStorage.getItem("user");
    const token = JSON.parse(tokenOnStorage);
    try {

      const response = await paymentDataService?.getPaymentInfoData(hashId, token.token);
      if (response.status === 400) {
        setLoading(false);
        navigate("/500");
        return;
      }
      const responseObj = await response?.json();
      const data = await responseObj?.response.allPaymentInfo;
      setSelectedPayment(data)

      if (data) {
        setFullName(data?.fullName)
        setPaymentDate(data?.paymentDate)
        setLoanAmount(data?.loanAmount)
        setPaymentAmount(data?.paymentAmount)
        setPaymentCurrency(data?.paymentCurrency)
        setPaymentConversionRate(data?.paymentConversionRate)
        setPayMethodCategory(data?.paymentMethod)
        setPaymentNote(data?.paymentNote)
        setPenalityRate(data?.penalityRate || '')
        setPenalityPayment(data?.penalityPayment || '')
        setLatePaymentReason(data?.latePaymentReason || '');
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

  useEffect(() => {
    setOpenPage("EditPayment")
    fetchCustomerData();
  }, [hashId, setOpenPage]);

  const handleCloseInfoDialog = () => {
    setShowInfoDialog(false);
    if (status === "OK") {
      navigate(-1);
    }
  };

  const handleInputChange = (e, setter, field) => {
    let newValue;
    if (field === "paymentAmount" || field === "penalityPayment") {
      newValue = e.target.value;
      let formattedAmount = handleAmountChange(newValue, setter, field);

      let loanAmountTrim = formattedAmount?.split(".")[1];

      if (!loanAmountTrim || loanAmountTrim === "0" || loanAmountTrim === "00") {
        const wholePart = formattedAmount?.split(".")[0];
        newValue = `${wholePart}.00`;
      }

      setChanges(prevChanges => ({ ...prevChanges, [field]: formattedAmount }));

    } else {
      newValue = e.target.value;
      setChanges(prevChanges => ({ ...prevChanges, [field]: newValue }));
      setter(newValue);
    }
  };

  const checkChanges = () => {
    setDifference({});
    for (let key in selectedPayment) {
      if (changes[key] === selectedPayment[key] || (!selectedPayment[key])) {
        setWarning(false);
      } else {
        setDifference((prevData) => ({ ...prevData, [key]: changes[key] }));
      }
    }
  };

  useEffect(() => {
    checkChanges();
  }, [changes, selectedPayment, warning]);

  const renderAlert = (field) => {
    let fieldValue
    if (field == "paymentConversionRate") {
      fieldValue = selectedPayment && selectedPayment[field] !== "1.00" ? selectedPayment[field]?.toString().trim() : "rate not Setted";
    } else
      fieldValue = selectedPayment && selectedPayment[field] ? selectedPayment[field]?.toString().trim() : '';
    let changesValue = changes[field]?.toString().trim();
    if ((changesValue || changesValue === "") && changesValue !== fieldValue) {
      if (!(field in difference)) {
        setDifference((prevData) => ({ ...prevData, [field]: changesValue }));
      }
      if (!warning) {
        setWarning(true);
      }
      return (
        <span className="text-red-400 italic pl-3">
          {field !== "penalityPayment" || !penalityRate ? `Prev.. => ${fieldValue ? fieldValue : "No Data"}` : `${fieldValue ? fieldValue : ""}`}
        </span>
      );

    }
    return null;
  };



  const handleAmountChange = (input, setter, field) => {
    input = input.replace(/[^\d.]/g, '');

    const parts = input.split('.');
    if (parts.length > 2) return;

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, 2);
    }

    const formattedInput = parts.join('.');
    setter(formattedInput);

    setChanges(prevChanges => ({ ...prevChanges, [field]: formattedInput }));
    return formattedInput;
  };

  const handlePaymentAmountOnBlur = () => {

    if (paymentAmount && !paymentAmount.includes('.')) {
      setPaymentAmount(paymentAmount + '.00');
    }
  };

  const handlePaymentConversionRate = (value) => {
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

      setPaymentConversionRate('');
      return;
    }

    const rate = parseFloat(value + ".00");
    if (isNaN(rate) || rate <= 0) {
      setConvertedPayment('Please Insert Positive Number only');
      setPaymentConversionRate('');
      return;
    }

    setPaymentConversionRate(value);
    setChanges(prevChanges => ({ ...prevChanges, paymentConversionRate: rate }));

    const amount = parseFloat(paymentAmount.replace(/,/g, ''));
    if (!isNaN(amount)) {
      let convertedPaymentValue;
      if (selectedPayment.loanCurrency === 'COP') {
        convertedPaymentValue = `${formatNumberWithCommas(rate * amount, 2)} COP`;
      } else {
        convertedPaymentValue = `${formatNumberWithCommas(amount / rate, 2)} USD`;
      }
      setConvertedPayment(convertedPaymentValue);
    } else {
      setConvertedPayment('');
    }
  };

  useEffect(() => {
    if (paymentAmount) {
      handlePaymentConversionRate(paymentConversionRate);
    }
  }, [paymentAmount, paymentCurrency]);

  const updatePenalityPayment = () => {
    const rate = parseFloat(penalityRate);
    let convertedAmount, amount;
    if (selectedPayment?.status === "Active") {
      convertedAmount = parseFloat(convertedPayment.split(" ")[0].replace(/,/g, ''));
      amount = isNaN(convertedAmount) ? parseFloat(paymentAmount.replace(/,/g, '')) : convertedAmount;
    } else {
      amount = parseFloat(loanAmount.replace(/,/g, ''));
    }
    if (!isNaN(amount) && !isNaN(rate)) {
      const penalityPaymentValue = `${formatNumberWithCommas(rate * amount / 100, 2)} ${selectedPayment.loanCurrency}`;
      setPenalityPayment(penalityPaymentValue);
      setChanges(prevChanges => ({ ...prevChanges, penalityPayment: penalityPaymentValue }));
    } else {
      setPenalityPayment('');
      setChanges(prevChanges => ({ ...prevChanges, penalityPayment: "" }));
    }
  };

  useEffect(() => {
    updatePenalityPayment();
  }, [paymentAmount, paymentConversionRate, penalityRate, convertedPayment]);


  useEffect(() => {
    handlePaymentConversionRate(paymentConversionRate);
    updatePenalityPayment();
  }, [paymentAmount, paymentConversionRate, paymentCurrency]);

  const handlePenalityRateChange = (value) => {
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
      setChanges(prevChanges => ({ ...prevChanges, penalityRate: value }))

      setPenalityPayment('');
      return;
    }
    const rate = parseFloat(value);
    if (isNaN(rate) || rate < 0) {
      return;
    }
    setPenalityRate(value);
    setChanges(prevChanges => ({ ...prevChanges, penalityRate: value }))
    updatePenalityPayment();
  };

  useEffect(() => {
    updatePenalityPayment();
  }, [penalityRate]);


  const handlePenalityPaymentOnBlur = () => {
    const sanitizedInput = penalityPayment.replace(/,/g, '');
    const penalityAmountMatch = sanitizedInput.match(/-?\d+(\.\d+)?/);

    if (penalityAmountMatch && !penalityPayment.endsWith(selectedPayment.loanCurrency)) {
      const penalityAmount = parseFloat(penalityAmountMatch[0]);
      setPenalityPayment(`${formatNumberWithCommas(penalityAmount, 2)} ${selectedPayment.loanCurrency}`);
    }
  };


  const handleError = () => {
    const errors = {};

    if (!paymentAmount) {
      errors.paymentAmount = ("Please enter payment amount");
    }
    if (paymentCurrency !== paymentCurrency && !paymentConversionRate) {
      errors.paymentConversionRate = ("Please Insert conversion Rate");
    }

    if (selectedPayment?.isLate == 1 && !/\d/.test(penalityPayment)) {
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
    setSubmitLoading(true);
    checkChanges();
    const errors = handleError();
    if ((errors && Object.keys(errors).length === 0) && warning) {
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
            "paymentCurrency": paymentCurrency,
            "paymentConversionRate": paymentConversionRate ? paymentConversionRate : 0,
            "paymentConversionAmount": isNaN(convertedPayment.split(' ')[0]) ? 0 : parseFloat(convertedPayment.split(' ')[0]),
            "loanHashId": selectedPayment.loanHashId,
            "paymentHashId": selectedPayment.paymentHashId,
            "paymentMethod": paymentMethod,
            "paymentNote": paymentNote,
            "latePaymentReason": latePaymentReason,
            "penalityRate": parseFloat(penalityRate) || parseFloat(formatPenalityRate),
            "penalityAmount": parseFloat(penalityAmount),
            "approvedBy": user?.userHashId
          }
        }]
      }
      try {
        const response = await paymentData.updatePayment(formattedData, token.token);
        if (response.status === 400) {
          setLoading(false);
          navigate("/500");
          return;
        }
        const data = await response.json();
        setStatus(data?.status)
        if (data?.status === "OK" && data?.msg === "Payment updated successfully") {

          setInfoMessage(`Payment data updated successfully!`);
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
    setFullName(selectedPayment?.fullName)
    setPaymentDate(selectedPayment?.paymentDate)
    setLoanAmount(selectedPayment?.loanAmount)
    setPaymentAmount(selectedPayment?.paymentAmount)
    setPaymentCurrency(selectedPayment?.paymentCurrency)
    setPaymentConversionRate(selectedPayment?.paymentConversionRate)
    setPayMethodCategory(selectedPayment?.paymentMethod)
    setPaymentNote(selectedPayment?.paymentNote)
    setPenalityRate(selectedPayment?.penalityRate || '')
    setPenalityPayment(selectedPayment?.penalityPayment || '')
    setLatePaymentReason(selectedPayment?.latePaymentReason || '')
    setFormErrors({});
    const newChanges = {};
    setChanges(newChanges);
    setWarning(false);
  }




  if (loading) {

    return <LoadingIndicator />
  }


  return (
    <div>
      <div className="z-50 fixed inset-0 flex items-start justify-center bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto pt-10">
        <div className="bg-white sm:ml-24 px-8 rounded-lg w-3/5 md:w-1/2 max-h-[800px] max-w-[1200px] overflow-y-auto">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold my-6">Edit Payment</h1>

            <div
              className="cursor-pointer text-4xl px-3  text-red-300  hover:text-red-600"
              onClick={() => navigate(-1)}
            >
              x
            </div>

          </div >


          <div className="flex justify-between">
            <div className="mb-4 px-2 py-1 text-lg italic text-red-900">
              {submitInfo ? submitInfo : ""}
            </div>
            <button className="px-6 max-h-8 bg-red-100 hover:bg-red-200  rounded-lg" onClick={resetHandle}>
              Reset
            </button>
          </div>

          <form onSubmit={handleFormSubmit} noValidate>
            <div className="">
              <div className="w-full flex justify-end mb-3">
                <div className="flex flex-col gap-4  w-7/12  ">
                  <div className="flex w-full">
                    <label className="w-6/12" htmlFor="fullName">Full Name :- </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      className="w-9/12"
                      disabled
                    />
                  </div>
                  <div className="flex w-full">
                    <label className=" w-6/12" htmlFor="loanAmount">For Loan Amount :-</label>
                    <input
                      id="loanAmount"
                      type="loanAmount"
                      value={formatNumberWithCommas(loanAmount, 2)}
                      className="w-9/12"
                      disabled
                    />
                  </div>
                </div>
                <div className="flex w-1/2 ">
                  <label className="flex items-center w-5/12" htmlFor="PaymentDate">Payment Date:-</label>
                  <input
                    id="PaymentDate"
                    type="text"
                    value={paymentDate}
                    className="pl-1 w-7/12"
                    disabled
                  />
                </div>
              </div>
              <div className="lg:flex gap-4  ">
                <div className="flex flex-col w-full ">
                  <label className="mb-2 mt-4" htmlFor="paymentAmount">Payment Amount {renderAlert('paymentAmount')}</label>
                  <input
                    id="paymentAmount"
                    required
                    type="text"
                    value={paymentAmount}
                    onChange={(e) => {
                      handleInputChange(e, setPaymentAmount, 'paymentAmount');
                    }}
                    onBlur={handlePaymentAmountOnBlur}
                    onFocus={() => handleFocus("paymentAmount")}
                    className={` p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 border`}

                  />
                </div>
                <div className="flex flex-col w-full ">
                  <label className="mb-2 mt-4" htmlFor="paymentCurrency"> Currency {selectedPayment.loanCurrency !== paymentCurrency && renderAlert('paymentCurrency')}</label>
                  <select
                    value={paymentCurrency}
                    onChange={(e) => {
                      handleInputChange(e, setPaymentCurrency, "paymentCurrency");
                      setPaymentConversionRate('');
                    }}
                    className={` p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 border`}
                  >
                    <option value="" disabled >Select Currency</option>
                    <option value="USD">USD</option>
                    <option value="COP">COP</option>
                  </select>

                </div>
              </div>
              {selectedPayment.loanCurrency !== paymentCurrency && <div className="lg:flex gap-4">
                <div className="flex flex-col w-full ">
                  <label className="mb-2 mt-4" htmlFor="paymentConversionRate">Conversion Rate {renderAlert('paymentConversionRate')}</label>
                  <input
                    id="paymentConversionRate"
                    type="text"
                    value={formErrors.paymentConversionRate ? formErrors.paymentConversionRate : !paymentAmount ? 0 : paymentConversionRate}
                    onChange={(e) => handlePaymentConversionRate(e.target.value)}
                    onFocus={() => handleFocus("paymentConversionRate")}
                    className={` border p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${(formErrors.paymentConversionRate) ? ' border-red-400 italic text-sm text-red-300' : ''}`}
                    placeholder="1 USD = ? COP"
                  />
                </div>
                <div className="flex flex-col w-full ">
                  <label className="mb-2 mt-4" htmlFor="convertedPayment">Converted Payment {renderAlert('convertedPayment')}</label>
                  <input
                    id="convertedPayment"
                    type="text"
                    disabled
                    value={convertedPayment}
                    className={` p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 border-green-200 border`}
                    placeholder="Converted Payment"
                  />
                </div>
              </div>}
              <div className="lg:flex gap-4  ">
                <div className="flex flex-col w-full ">
                  <label className="mb-2 mt-4" htmlFor="paymentMethod">Payment Method {renderAlert('paymentMethod')}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => handleInputChange(e, setPayMethodCategory, "paymentMethod")}
                    className={`p-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 border `}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Debit-Card">Debit-Card</option>
                    <option value="Credit-Card">Credit-Card</option>
                    <option value="Bank">Bank</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="flex flex-col w-full ">
                  <label className="mb-2 mt-4" htmlFor="paymentAmount">Payment Note {renderAlert('paymentNote')}</label>
                  <textarea
                    id="paymentNote"
                    type="text"
                    value={paymentNote}
                    onChange={(e) => handleInputChange(e, setPaymentNote, "paymentNote")}
                    className={` p-2 rounded-lg w-full h-11 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 border `}
                    placeholder="Payment Note"
                  />

                </div>
              </div>
              <div className="lg:flex gap-4 ">
                <div className="flex flex-col w-1/2 ">
                  <div className="flex w-full gap-2 ">
                    <label className="mb-2 mt-4 w-full" htmlFor="penalityRate">Penality Rate {renderAlert('penalityRate')} {renderAlert('penalityPayment')}</label>

                  </div>
                  <div className="flex w-full gap-2 ">
                    <input
                      id="penalityRate"
                      type="text"
                      value={formErrors.penalityRate ? formErrors.penalityRate : penalityRate}
                      onChange={(e) => handlePenalityRateChange(e.target.value)}
                      onFocus={() => handleFocus("penalityRate")}
                      className={` border p-2 rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 `}
                      placeholder="Penality Rate in %"
                    />

                    <input
                      id="penalityPayment"
                      type="text"
                      onChange={(e) => {
                        setPenalityRate('');
                        setChanges(prevChanges => ({ ...prevChanges, ['penalityRate']: "" }));
                        handleInputChange(e, setPenalityPayment, 'penalityPayment');
                      }}
                      value={formErrors.penalityPayment ? formErrors.penalityPayment : penalityPayment}
                      onBlur={handlePenalityPaymentOnBlur}
                      onFocus={() => handleFocus("penalityPayment")}
                      className={`p-2  rounded-lg w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 border`}
                      placeholder="Penailty Money"
                    />
                  </div>
                </div>
                <div className="flex flex-col w-1/2 ">
                  <label className="mb-2 mt-4" htmlFor="latePaymentReason">Late Reason {renderAlert('latePaymentReason')}</label>
                  <textarea
                    id="latePaymentReason"
                    type="text"
                    value={latePaymentReason}
                    onChange={(e) => handleInputChange(e, setLatePaymentReason, "latePaymentReason")}

                    className={`p-2 rounded-lg w-full h-11 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 border `}
                    placeholder="Enter the Reason for being Late" />

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

export default EditPayment;