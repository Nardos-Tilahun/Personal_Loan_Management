//*************IMPORTING EXTERNAL MODULES *************/

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from 'country-state-city';
import 'react-phone-number-input/style.css';
import { IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ProfilePictureUpload from "./ProfilePictureUpload";
import userService from "../../../../services/users.service";
import getAuth from "../../../../util/auth"
import { useAuth } from "../../../../Contexts/useHook";
import InfoDialog from "../../../../util/InformationPage";
import ConfirmationPanel from "../../../../util/ConfirmationPage";
const VisibilityCustom = () => {
  return (
    <Visibility style={{ fontSize: '1rem' }} />
  );
};
const VisibilityOffCustom = () => {
  return (
    <VisibilityOff style={{ fontSize: '1rem' }} />
  );
};

//*************************************************/
//********** "ADD USER FORM"  COMPONENT *********/
//*********************************************/


const AddUserForm = () => {

  //**************** INITIALIZE ROLES ******************** */

  const roles = ['Admin', 'Customer'];

  const { openPage, setOpenPage } = useAuth()

  //*************** STATES *********/

  const navigate = useNavigate();
  const phoneNumberRef = useRef(null);
  const passRef = useRef(null);
  const confirmPassRef = useRef(null);
  const countryRef = useRef(null);
  const [isPhoneNumberFocused, setIsPhoneNumberFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);
  const [isConfirmPassFocused, setIsConfirmPassFocused] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitInfo, setSubmitInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [infoType, setInfoType] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    showPassword: false,
    showConfirmPassword: false,
    confirmPassword: '',
    phoneNumber: '',
    phoneCode: '',
    secondPhoneNumber: '',
    streetAddress: '',
    selectedCountry: '',
    selectedCountryCode: '',
    selectedState: '',
    selectedCity: '',
    zipCode: '',
    roleName: openPage.slice(0, -1) === "Admin" ? "Admin" : "Customer",
    userImage: null,
    countries: [],
    states: [],
    cities: []
  });




  //************** INITALIZE THE COMPONENT *************/
  const fetchCountries = () => {
    setLoading(true)
    const allCountries = Country.getAllCountries();
    const usaIndex = allCountries.findIndex(country => country.name === 'United States');
    const colombiaIndex = allCountries.findIndex(country => country.name === 'Colombia');
    const usaCopy = { ...allCountries[usaIndex] };
    const colombiaCopy = { ...allCountries[colombiaIndex] };

    allCountries.splice(usaIndex, 1);
    allCountries.splice(colombiaIndex, 1);
    allCountries.unshift(usaCopy);
    allCountries.unshift(colombiaCopy);

    setFormData(prevData => ({ ...prevData, countries: allCountries, selectedCountry: 'United States', phoneCode: allCountries[1].phonecode }));
    setLoading(false)
  };
  useEffect(() => {
    setOpenPage("AddUserForm")
    setDefaultFormData();
  }, []);


  const handleCloseInfoDialog = () => {
    setShowInfoDialog(false);
    setShowConfirmation(false);
    if (status === "OK" || status === "OKAY") {
      navigate(-1);
    } 
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    if (status === "OK" || status === "OKAY") {
      navigate(-1)
    }

  };



  useEffect(() => {
    const fetchStates = () => {
      setLoading(true)
      if (formData.selectedCountry) {
        const country = formData.countries.find(country => country.name === formData.selectedCountry);
        setFormData((prevData) => ({ ...prevData, phoneCode: country.phonecode }));
        const countryStates = State.getStatesOfCountry(country.isoCode);
        if (!countryStates.length) {
          const countryCities = City.getCitiesOfCountry(country.isoCode);
          setFormData((prevData) => ({ ...prevData, cities: countryCities }));
        } else {
          setFormData((prevData) => ({ ...prevData, cities: [] }));
        }
        setFormData((prevData) => ({ ...prevData, states: countryStates }));
        setFormData((prevData) => ({ ...prevData, selectedState: '' }));
        setFormData((prevData) => ({ ...prevData, selectedCity: '' }));
      }
      setLoading(false)
    };
    fetchStates();
  }, [formData?.selectedCountry, formData?.countries]);



  useEffect(() => {

    const fetchCities = () => {
      setLoading(true)
      if (formData.selectedState) {
        const state = formData?.states?.find(state => state.name === formData.selectedState);
        const stateCities = City.getCitiesOfState(state.countryCode, state.isoCode);
        setFormData((prevData) => ({ ...prevData, cities: stateCities }));
        setFormData((prevData) => ({ ...prevData, selectedCity: '' }));
      }
      setLoading(false)
    };
    fetchCities();
  }, [formData?.selectedState, formData?.states]);



  ///***************** FORMATING THE INPUTS********************/


  function validateName(name) {
    const nameRegex = /^[a-zA-Z-' ]+$/;
    return nameRegex.test(name);
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phoneNumber) => {
    const numericPhoneNumber = phoneNumber.replace(/\D/g, '');
    const PhoneRegex = /^\+?\d{1,15}$/;
    return phoneNumber.length < 15 && PhoneRegex.test(numericPhoneNumber);
  };

  const validateZipCode = (zipCode) => {
    const zipRegex = /^[a-zA-Z0-9\s,-]+$/;
    return zipRegex.test(zipCode);
  };


  //********** Handling change made by inputs ************/

  const handlePassFocus = () => {
    setIsPassFocused(true);
    handleInputFocus('password')
  }
  const handlePassBlur = () => {
    setIsPassFocused(false);
  };
  const handleConfirmPassFocus = () => {
    setIsConfirmPassFocused(true);
    handleInputFocus('confirmPassword')
  }
  const handleConfirmPassBlur = () => {
    setIsConfirmPassFocused(false);
  };

  const handlePhoneNumberFocus = () => {
    setIsPhoneNumberFocused(true);
    handleInputFocus("phoneNumber")
  };

  const handlePhoneNumberBlur = () => {
    setIsPhoneNumberFocused(false);
  };

  const handlePhoneNumberChange = (e) => {
    const inputValue = e.target.value.replace(/\D/g, '');
    const formattedValue = formatPhoneNumber(inputValue);
    setFormData({ ...formData, phoneNumber: formattedValue });
  };

  const handleSecondPhoneNumberChange = (e) => {
    const inputValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, secondPhoneNumber: inputValue });
  };

  const formatPhoneNumber = (inputValue) => {
    let formattedValue = '';


    let digitsOnly = inputValue.replace(/\D/g, '');


    if (digitsOnly.length > 10) {

      digitsOnly = digitsOnly.slice(0, 10);
    }

    if (digitsOnly.length > 6) {
      formattedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    } else if (digitsOnly.length > 3) {
      formattedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    } else {
      formattedValue = digitsOnly;
    }

    return formattedValue;
  };

  const togglePasswordVisibility = () => {
    setFormData(prevData => ({
      ...prevData,
      showPassword: !prevData.showPassword
    }));
  };

  const toggleConfirmPasswordVisibility = () => {
    setFormData(prevData => ({
      ...prevData,
      showConfirmPassword: !prevData.showConfirmPassword
    }));
  };


  //********* ERROR HANDLING *********/
  const handleError = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = ('FirstName is required');
    } else if (!validateName(formData.firstName)) {
      errors.firstName = `${(formData.firstName)} => Name should be alphabet only`;
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'LastName is required';
    } else if (!validateName(formData.lastName)) {
      errors.lastName = `${(formData.lastName)} => Name should be alphabet only`;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = `${(formData.email)} => Please, follow email format ***@***.*** `;
    }

    if (!formData.roleName.trim()) {
      errors.roleName = 'Role Name is required';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.trim().length < 8) {
      errors.password = 'Password must be more than 8 character';
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.password = 'Passwords do not match, try again';
      errors.confirmPassword = 'Passwords do not match, try again';
    }


    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = `Number is required `;
    } else if (!formData.selectedCountry) {
      errors.phoneNumber = `Select Country for Code `;
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber = `Invalid=>(XXX)-XXX-XXXX  `;
    }

    if (formData?.zipCode && !validateZipCode(formData?.zipCode)) {
      const validZipCode = validateZipCode(formData?.zipCode)

      errors.zipCode = `${(formData.zipCode)} => special character are not allowed in zip code`;
    }
    if (formData?.userImage) {

      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(formData.userImage.type)) {
        errors.userImage = 'Only JPEG and PNG images are allowed';
      }

      const maxSizeInBytes = 500 * 1024;
      if (formData.userImage.size > maxSizeInBytes) {
        errors.userImage = 'Image size exceeds 500KB limit';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    }


    return errors;


  };


  //******* RESET THE COMPONENT TO DEFAULT VALUES *******/

  const setDefaultFormData = () => {
    setIsPhoneNumberFocused(false)
    setIsPassFocused(false)
    setIsConfirmPassFocused(false)
    setSubmitInfo('')
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      phoneCode: '',
      secondPhoneNumber: '',
      streetAddress: '',
      selectedCountry: '',
      selectedCountryCode: '',
      selectedState: '',
      selectedCity: '',
      zipCode: '',
      roleName: openPage.slice(0, -1) === "Admin" ? "Admin" : "Customer",
      userImage: null,
      countries: formData.countries,
      states: [],
      cities: [],
    });
    setFormErrors({});
    fetchCountries();
  };

  //************ UPDATE THE ERROR ************/
  const handleInputFocus = (fieldName) => {
    setFormErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      delete updatedErrors[fieldName];

      return updatedErrors;
    });
    setSubmitInfo('')
  };

  //*********** Handling Submit ***********************/

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = handleError();

    if (errors && Object.keys(errors).length === 0) {
      setSubmitInfo('');

      const user = await getAuth();
      formData.createdBy = user.userHashId;

      const tokenOnStorage = localStorage.getItem("user");
      const token = JSON.parse(tokenOnStorage);

      const formattedData = {
        "data": [
          {
            "user": {
              "firstName": formData.firstName,
              "lastName": formData.lastName,
              "email": formData.email,
              "password": formData.password,
              "confirmPassword": formData.confirmPassword,
              "createdBy": formData.createdBy,
              "contactInformation": {
                "phoneNumber": formData.phoneNumber.replace(/\D/g, ''),
                "secondPhoneNumber": formData.secondPhoneNumber.replace(/\D/g, ''),
                "streetAddress": formData.streetAddress,
                "city": formData.selectedCity,
                "state": formData.selectedState,
                "country": formData.selectedCountry,
                "zipCode": formData.zipCode
              },
              "roleInformation": {
                "userRoleName": formData.roleName
              }
            }
          }
        ]
      };

      try {
        if (formData.roleName === "Admin") {
          setConfirmMessage(`
            You are making <strong>${formData.firstName} ${formData.lastName}</strong> to be an Admin!

            Notice: - Admins able do the following:

            <ul class="text-left list-disc list-inside ml-2 mt-2">
              <li>Add Customers and other Admins</li>
              <li>Edit Customers and Admins Profile</li>
              <li>Delete Customers Data</li>
              <li>Add Loans and approve Payments</li>
              <li>Delete Recent Payments and Pending Loans</li>
            </ul>
            <br>
            Are you sure to make this user an Admin?
          `);
          setLoading(false);
          setShowConfirmation(true);
          
        } else {
          setLoading(true);
          await submitForm(formattedData, formData.userImage, token.token);
        }
      } catch (error) {
        setInfoMessage("An error occurred. Please try again later.");
        setInfoType('error');
        navigate("/500");
        setShowInfoDialog(true);
        setShowConfirmation(true);
        setLoading(false);
      } finally {

      }
    } else {
      handleErrors(errors);
    }
  };

  const handleConfirmation = async () => {
    const tokenOnStorage = localStorage.getItem("user");
    const token = JSON.parse(tokenOnStorage);

    if (!status) {
      const formattedData = {
        "data": [
          {
            "user": {
              "firstName": formData.firstName,
              "lastName": formData.lastName,
              "email": formData.email,
              "password": formData.password,
              "confirmPassword": formData.confirmPassword,
              "createdBy": formData.createdBy,
              "contactInformation": {
                "phoneNumber": formData.phoneNumber.replace(/\D/g, ''),
                "secondPhoneNumber": formData.secondPhoneNumber.replace(/\D/g, ''),
                "streetAddress": formData.streetAddress,
                "city": formData.selectedCity,
                "state": formData.selectedState,
                "country": formData.selectedCountry,
                "zipCode": formData.zipCode
              },
              "roleInformation": {
                "userRoleName": formData.roleName
              }
            }
          }
        ]
      };

     
      try {
        await submitForm(formattedData, formData.userImage, token.token);

      } catch (error) {
        setLoading(false);

        handleSubmissionError();
        setShowConfirmation(false);
      } finally {
        setLoading(false);
      }
    } else if (status !== "OKAY") {
      try {
        setLoading(true);
        const response = await userService.updateVerification(formData?.email, token.token, "NotVerified");
        if (response.status === 400) {
          setLoading(false);
          navigate("/500");
          return;
        }
        const result = await response.json();
        setStatus(result?.status)
        setLoading(false);
        if (result?.status === 'OK' && result?.msg == "Verification added successfully") {
          setInfoMessage(`
                A Registration Confirmation link has been sent to the provided email! <br>
                The link will expire after 24 hours!
                `);
          setInfoType("success")
          setShowInfoDialog(true);
        } else {
          setInfoMessage("An error occurred. Please try again later.");
          setInfoType('error');
          setShowInfoDialog(true);
        }
        setShowConfirmation(false);
        setLoading(false);
      } catch (error) {
        setInfoMessage("An error occurred. Please try again later.");
        setInfoType('error');
        setShowConfirmation(false);
        setShowInfoDialog(true);

      } finally {
        setLoading(false)
      }
    };
  };

  const submitForm = async (formattedData, userImage, token) => {
    try {
      setLoading(true);
      const response = await userService.register(formattedData, userImage, token);
      if (response.status === 400) {
        setLoading(false);
        navigate("/500");
        return;
      }
      const data = await response.json();
      setLoading(false);
      setStatus(data?.status)
      if (data?.status === 'OK' && data.msg === 'User registered successfully. Please verify your email.') {
        setConfirmMessage(`
        Registration successful!<br>
        To receive notifications, please verify the provided email address.<br>
        Would you like to send a confirmation email to this address?<br>
        <br><br>
        Select "Cancel" if you do not wish to confirm the email or receive notifications.
    `);
        setShowConfirmation(true);

      } else if (data?.status === 'CONFLICT' && data.msg === 'Email already exists') {
        setInfoMessage(`
      Email already exists! 
      Please use another email to register!
    `);
        setInfoType("error");
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
      setInfoMessage("An error occurred. Please try again later.");
      setInfoType('error');
      setShowInfoDialog(true);
      setShowConfirmation(true);
      setLoading(false);
    }
  };

  const handleSubmissionError = () => {
    setInfoMessage(`
    Oops..! Something went wrong!
    Please try again later!
  `);
    setInfoType("error");
    setShowInfoDialog(true);
  };

  const handleErrors = (errors) => {
    setSubmitInfo("Please fix the highlighted errors before submitting.");
    setLoading(false);
  };







  //*********** RENDERING ADD USER COMPONENT ************/

  return (
    <div>
      <div className="z-50 fixed inset-0 flex items-start justify-center bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto pt-10">
        <div className="bg-white sm:ml-24 px-8 rounded-lg w-3/5 md:w-1/2 max-h-[800px] max-w-[1200px] overflow-y-auto">
          <div className={`flex justify-between my-2`}>
            <h1 className="text-2xl font-bold m-6">Add User</h1>
            <div
              className="cursor-pointer text-4xl px-3  text-red-300  hover:text-red-600"
              onClick={() => navigate(-1)}
            >
              x
            </div>
          </div >
          {submitInfo &&
            (<div className="flex justify-between">
              <div className="mb-4 px-2 py-1 text-lg italic text-red-900">{submitInfo ? submitInfo : ''}</div>
              <button className="mb-4 px-4 max-h-10 py-1 bg-red-100 hover:bg-red-200  rounded-lg" onClick={setDefaultFormData}>
                Reset
              </button>
            </div>)}
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col md:space-x-4">
              <div className="w-full space-y-4">
                <div className={`md:space-x-4 md:flex space-y-4 md:space-y-0 `}>

                  <input
                    id="firstName"
                    type="text"
                    value={formErrors.firstName || formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.firstName ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                    onFocus={() => handleInputFocus('firstName')}
                    placeholder={formErrors.firstName || "First Name *"}
                    required
                  />


                  <input
                    id="lastName"
                    type="text"
                    value={formErrors.lastName || formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.lastName ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                    placeholder={formErrors.lastName || "Last Name *"}
                    onFocus={() => handleInputFocus('lastName')}
                    required
                  />
                </div>

                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">
                  <input
                    id="email"
                    type="email"
                    value={formErrors.email || formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.email ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                    placeholder={formErrors.email || "Email Address *"}
                    onFocus={() => handleInputFocus('email')}
                    required
                  />
                  <select
                    value={formErrors.roleName || formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    className={`border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.roleName ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                    onFocus={() => handleInputFocus('roleName')}
                  >
                    <option value="" disabled >{formErrors.roleName || "Select Roles *"}</option>
                    {roles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">
                  <div
                    tabIndex={0}
                    onFocus={() => passRef.current.focus()}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        confirmPassRef.current.focus();
                      }
                    }}
                    className={`flex flex-row border p-2 rounded-lg w-full md:w-1/2 border-green-400 ${isPassFocused ? 'ring-1 ring-green-600' : ''} ${formErrors.password ? 'border-red-400' : ''}`}
                  >
                    <input
                      id="password"
                      type={formData.showPassword || formErrors.password ? "text" : "password"}
                      value={formErrors.password || formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={` w-full outline-none  ${formErrors.password ? '  italic text-sm text-red-300' : ' '}`}
                      placeholder={"Enter Password *"}
                      onFocus={handlePassFocus}
                      onBlur={handlePassBlur}
                      ref={passRef}
                      required
                    />
                    <IconButton onClick={togglePasswordVisibility} >
                      {formData.showPassword ? <VisibilityOffCustom /> : <VisibilityCustom />}
                    </IconButton>
                  </div>
                  <div
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        countryRef.current.focus();
                      }
                    }}
                    onFocus={() => confirmPassRef.current.focus()}
                    className={`flex flex-row border p-2 rounded-lg w-full md:w-1/2 border-green-400 ${isConfirmPassFocused ? 'ring-1 ring-green-600' : ''} ${formErrors.confirmPassword ? 'border-red-400' : ''}`}
                  >
                    <input
                      id="confirmPassword"
                      type={formData.showConfirmPassword || formErrors.confirmPassword ? "text" : "password"}
                      value={formErrors.confirmPassword || formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={` w-full outline-none  ${formErrors.confirmPassword ? '  italic text-sm text-red-300' : ' '}`}
                      placeholder={formErrors.confirmPassword || "Confirm Your Password *"}
                      onFocus={handleConfirmPassFocus}
                      onBlur={handleConfirmPassBlur}
                      ref={confirmPassRef}
                      onPaste={(e) => e.preventDefault()}
                      required
                    />
                    <IconButton onClick={toggleConfirmPasswordVisibility} sx={{ fontSize: 5 }}>
                      {formData.showConfirmPassword ? <VisibilityOffCustom /> : <VisibilityCustom />}
                    </IconButton>

                  </div>
                </div>

                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">

                  <select
                    ref={countryRef}
                    value={formData.selectedCountry}
                    onChange={(e) => setFormData({ ...formData, selectedCountry: e.target.value })}
                    className="overflow-y-auto max-h-24 flex flex-row border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                  >
                    <option value="">Select Country</option>
                    {formData.countries?.map((country, index) => (
                      <option key={index} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.selectedState}
                    onChange={(e) => setFormData({ ...formData, selectedState: e.target.value })}
                    className="flex flex-row border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                  >
                    <option value="">Select State</option>
                    {!formData.selectedCountry ? (
                      <option disabled>Select the country first</option>
                    ) :
                      formData.states.length === 0 ? (
                        <option disabled>No state registered in</option>

                      ) :
                        formData.states.map((state, index) => (
                          <option key={index} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                  </select>

                </div>
                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">

                  <select
                    value={formData.selectedCity}
                    onChange={(e) => setFormData({ ...formData, selectedCity: e.target.value })}
                    className="flex flex-row border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                  >
                    <option value="">Select City</option>
                    {!formData.selectedCountry ? (<option disabled>Select the country first</option>) : formData.cities.length === 0 ? (<option disabled>No city registered in {formData.selectedCountry}</option>) : !formData.selectedState ? (
                      <option disabled>Select the state first</option>
                    ) :
                      formData.cities.length === 0 ? (
                        <option disabled>No city registered in {formData.selectedState}</option>
                      ) :

                        formData.cities.map((city, index) => (
                          <option key={index} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                  </select>

                  <input
                    id="streetAddress"
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    className="flex flex-row border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                    placeholder="Street Address"

                  />
                </div>

                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">
                  <div
                    tabIndex={0}
                    onFocus={() => phoneNumberRef.current.focus()}
                    className={`flex flex-row border p-2 rounded-lg w-full md:w-1/2 border-green-400 ${isPhoneNumberFocused ? 'ring-1 ring-green-600' : ''} ${formErrors.phoneNumber ? 'border-red-400' : ''}`}
                  >
                    <input
                      id="phoneCode"
                      type="text"
                      value={formErrors.phoneNumber ? 'Phone ' : formData.phoneCode ? !formData.phoneCode.startsWith('+') ? `+${formData.phoneCode}` : formData.phoneCode : ""}
                      className={`text-right w-16 ${formErrors.phoneNumber ? 'text-red-400 italic text-sm' : 'pr-2'}`}
                      placeholder="Phone#"
                      readOnly
                    />
                    <input
                      id="phoneNumber"
                      type="text"
                      value={formErrors.phoneNumber || formData.phoneNumber}
                      onChange={handlePhoneNumberChange}
                      onFocus={handlePhoneNumberFocus}
                      onBlur={handlePhoneNumberBlur}
                      ref={phoneNumberRef}
                      className={`focus:outline-none overflow-auto${formErrors.phoneNumber ? 'text-red-400 italic text-sm' : ''}`}
                      placeholder={formErrors.phoneNumber || "Phone Number  *"}
                      required
                    />
                  </div>


                  <input
                    id="secondPhoneNumber"
                    type="text"
                    value={formData.secondPhoneNumber}
                    onChange={handleSecondPhoneNumberChange}
                    className="border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                    placeholder="If you have secondary Phone Number"
                  />

                </div>
                <div className="md:space-x-4 md:flex  space-y-4 md:space-y-0 ">
                  <input
                    id="zipCode"
                    type="text"
                    value={formErrors.zipCode || formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className={`border p-2 rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.zipCode ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                    onFocus={() => handleInputFocus('zipCode')}
                    placeholder={formErrors.zipCode || "Zip Code "}
                  />

                  <ProfilePictureUpload formData={formData} setFormData={setFormData} formErrors={formErrors} />

                </div>

              </div>


              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={loading || (formErrors && Object.keys(formErrors).length !== 0)}
                  className={`py-2 w-full md:w-[30%] text-center bg-green__ text-gray_light  rounded-lg text-sm  mb-4 ${loading || (formErrors && Object.keys(formErrors).length !== 0) ? 'cursor-not-allowed opacity-70' : 'hover:bg-green-200 hover:text-gray-700 hover:font-bold'
                    }`}
                >
                  {loading ? 'Submitting...' : formErrors && Object.keys(formErrors).length !== 0 ? 'Correct the error first' : 'Create User'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {showConfirmation && (
        <ConfirmationPanel
          message={confirmMessage}
          onConfirm={handleConfirmation}
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
};

export default AddUserForm;