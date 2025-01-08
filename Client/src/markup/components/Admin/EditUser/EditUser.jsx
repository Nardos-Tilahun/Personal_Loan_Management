//*************IMPORTING EXTERNAL MODULES *************/
const api_url = import.meta.env.VITE_REACT_APP_API_URL;

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from 'country-state-city';
import 'react-phone-number-input/style.css';
import ProfilePictureUpload from "../AddUserForm/ProfilePictureUpload";
import userService from "../../../../services/users.service";
import getAuth from "../../../../util/auth"
import { useAuth } from "../../../../Contexts/useHook";
import InfoDialog from "../../../../util/InformationPage";
import LoadingIndicator from "../../../../util/LoadingIndicator";

//*************************************************/
//********** "ADD USER FORM"  COMPONENT *********/
//*********************************************/
const EditUser = () => {

  //**************** INITIALIZE ROLES ******************** */

  const roles = ['Admin', 'Customer'];

  const { setOpenPage } = useAuth()

  //*************** STATES *********/
  const navigate = useNavigate();
  const { hashId } = useParams();
  const phoneNumberRef = useRef(null);
  const countryRef = useRef(null);
  const initialRender = useRef(true);
  const [userData, setUserData] = useState({});
  const [isPhoneNumberFocused, setIsPhoneNumberFocused] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitInfo, setSubmitInfo] = useState('');
  const [renderKey, setRenderKey] = useState(0);
  const [warning, setWarning] = useState(false);
  const [changes, setChanges] = useState({});
  const [difference, setDifference] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imageloading, setImageLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [infoType, setInfoType] = useState('');
  const [formData, setFormData] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    phoneNumber: userData.phoneNumber || "",
    secondPhoneNumber: userData.secondPhoneNumber || "",
    streetAddress: userData.streetAddress || "",
    selectedCountry: userData.selectedCountry || "",
    selectedState: userData.selectedState || "",
    selectedCity: userData.selectedCity || "",
    zipCode: userData.zipCode || "",
    roleName: userData.roleName || "",
    path: userData.name ? `${api_url}/uploads/profilePictures/${userData.name}` : "",
    userImage: null,
    countries: [],
    states: [],
    cities: []
  });



  const fetchUserData = async () => {
    setLoading(true)
    const tokenOnStorage = localStorage.getItem("user");
    const token = JSON.parse(tokenOnStorage);
    try {
      const response = await userService.getUserForUpdate(hashId, token.token);
      if (response.status === 400) {
        setLoading(false);
        navigate("/500");
        return;
      }
      const responseObj = await response?.json();
      const data = await responseObj?.response;
      if (data) {
        setUserData(data);
        setFormData(prevData => ({
          ...prevData,
          firstName: userData?.firstName || "",
          lastName: userData?.lastName || "",
          email: userData?.email || "",
          phoneNumber: formatPhoneNumber(userData?.phoneNumber) || "",
          secondPhoneNumber: userData?.secondPhoneNumber || "",
          streetAddress: userData?.streetAddress || "",
          selectedCountry: userData?.selectedCountry || "",
          selectedState: userData?.selectedState || "",
          selectedCity: userData?.selectedCity || "",
          zipCode: userData?.zipCode || "",
          roleName: userData?.roleName || "",
          path: data?.name ? `${api_url}/uploads/profilePictures/${data?.name}` : "",
          userImage: null,
          countries: [],
          states: [],
          cities: []
        }));
        setRenderKey(prevKey => prevKey + 1);
      }
    } catch (error) {
        setLoading(false);
        navigate("/500");
        return;
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    setOpenPage("EditUser");
    fetchUserData();
  }, [setOpenPage, hashId]);

  const handleCloseInfoDialog = () => {
    setShowInfoDialog(false);
    if (status === "OK") {
      navigate(-1);
    }
  };

  const initializeFormData = async () => {
    setImageLoading(true)
    setDefaultFormData();

    if (Object.keys(userData).length !== 0) {
      setTimeout(() => { setLoading(false); }, 100)

    }
    if (formData?.path) {
      try {
        const response = await fetch(formData.path);
        if (response.status === 400) {
          setLoading(false);
          navigate("/500");
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }
        const blob = await response.blob();
        const file = new File([blob], userData?.name || 'image.png', { type: 'image/png' });

        setFormData(prevState => ({
          ...prevState,
          userImage: file,
        }));

        setTimeout(() => { setImageLoading(false); }, 100)
      } catch (error) {

        setFormData(prevState => ({
          ...prevState,
          userImage: null,
        }));
        setImageLoading(false)
      }
    }


  };

  useEffect(() => {
    initializeFormData();
  }, [renderKey]);


  useEffect(() => {
    checkChanges();
  }, [formData, formErrors, warning]);



  const setDefaultFormData = () => {
    setIsPhoneNumberFocused(false)
    setSubmitInfo('')
    setFormData({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      email: userData?.email || "",
      phoneNumber: formatPhoneNumber(userData?.phoneNumber) || "",
      secondPhoneNumber: userData?.secondPhoneNumber || "",
      streetAddress: userData?.streetAddress || "",
      selectedCountry: userData?.selectedCountry || "",
      selectedState: userData?.selectedState || "",
      selectedCity: userData?.selectedCity || "",
      zipCode: userData?.zipCode || "",
      roleName: userData?.roleName || "",
      path: userData?.name ? `${api_url}/uploads/profilePictures/${userData?.name}` : "",
      userImage: null,
      countries: [],
      states: [],
      cities: []
    });
    setWarning(false)
    setFormErrors({});
    fetchCountries();
  };

  const handleInputChange = (event, field) => {
    let newValue;
    if (field === "phoneNumber") {

      newValue = formatPhoneNumber(event.target.value)
      setChanges({ ...changes, [field]: event.target.value });
    } else if (field === "secondPhoneNumber") {
      newValue = event.target.value.replace(/\D/g, '');
      setChanges({ ...changes, [field]: event.target.value });
    } else if (field === "selectedCountry") {
      newValue = event.target.value;
      if (userData[field]?.toString()?.trim() !== newValue?.toString()?.trim())
        setChanges({ ...changes, ["selectedCountry"]: newValue, ["selectedState"]: "No State", ["selectedCity"]: "No State" });
      else {
        setChanges({ ...changes, ["selectedCountry"]: newValue, ["selectedState"]: userData["selectedState"], ["selectedCity"]: userData["selectedCity"] })
      }
    } else if (field === "selectedState") {
      newValue = event.target.value;
      if (userData[field]?.toString()?.trim() !== newValue?.toString()?.trim())
        setChanges({ ...changes, ["selectedState"]: newValue, ["selectedCity"]: "No State" });
      else {
        setChanges({ ...changes, ["selectedState"]: newValue, ["selectedCity"]: userData["selectedCity"] })
      }
    } else {
      newValue = event.target.value;
      setChanges({ ...changes, [field]: newValue });
    }
    setFormData({ ...formData, [field]: newValue });
  };

  const renderAlert = (field) => {

    let fieldValue = userData[field]?.toString()?.trim();
    let changesValue
    if (field === "phoneNumber" || field === "secondPhoneNumber") {
      fieldValue = fieldValue?.replace(/\D/g, '')?.toString()?.trim();
      changesValue = changes[field]?.replace(/\D/g, '')?.toString()?.substring(0, 10).trim();
    } else if (field === "name") {
      changesValue = changes[field]?.toString()?.trim();
    }
    else {
      changesValue = changes[field]?.toString()?.trim();
    }

    if (
      (
        (
          (changesValue || changesValue == "")
          && changesValue !== fieldValue
          && field !== "name"
        )
        ||
        (
          field === "name"
          && !fieldValue
          && (fieldValue || changesValue)
        )
      )
      ||
      (
        field === "name"
        && fieldValue
        && (changesValue !== fieldValue)
      )
    ) {

      if (field == "name" && !(field in difference)) {
        setDifference((prevData) => ({ ...prevData, [field]: changesValue }));
      }
      if (!warning) {
        setWarning(true);
      }

      return (
        <span className="text-red-400 italic pl-1">
          {`Prev => ${fieldValue || "No data"}`}
        </span>
      );

    }
    return null;
  };
  useEffect(() => {

    if (!initialRender.current) {
      setChanges({ ...changes, ["name"]: formData?.userImage?.name || "" });
    } else {
      initialRender.current = false;
    }

  }, [formData?.userImage?.name]);

  const checkChanges = () => {
    let checkName;
    if ("name" in difference) {
      checkName = difference.name;
      setDifference({});
      setDifference((prevData) => ({ ...prevData, ["name"]: checkName }));
    } else {
      setDifference({});
    }

    for (let key in changes) {
      if (changes[key] === userData[key] || (!userData[key])) {
        setWarning(false);
      } else {
        setDifference((prevData) => ({ ...prevData, [key]: changes[key] }));
      }
    }

  };

  const handleReset = async () => {
    initializeFormData();
    const newChanges = {};
    setRenderKey(prevKey => prevKey + 1)
    for (let key in userData) {
      newChanges[key] = userData[key];
    }
    setChanges(newChanges);
  };

  //************** INITALIZE THE COMPONENT *************/

  const fetchCountries = () => {
    const allCountries = Country.getAllCountries();
    const usaIndex = allCountries.findIndex(country => country.name === 'United States');
    const colombiaIndex = allCountries.findIndex(country => country.name === 'Colombia');

    const usaCopy = { ...allCountries[usaIndex] };
    const colombiaCopy = { ...allCountries[colombiaIndex] };

    allCountries.splice(usaIndex, 1);
    allCountries.splice(colombiaIndex, 1);
    allCountries.unshift(usaCopy);
    allCountries.unshift(colombiaCopy);

    setFormData(prevData => ({ ...prevData, countries: allCountries, selectedCountry: userData.selectedCountry, phoneCode: allCountries[1].phonecode }));

  };



  useEffect(() => {
    if (!initialRender.current) {
      const fetchStates = () => {
        if (formData.selectedCountry) {
          const country = formData.countries.find(country => country.name === formData.selectedCountry);
          setFormData((prevData) => ({ ...prevData, phoneCode: country?.phonecode }));
          const countryStates = State?.getStatesOfCountry(country?.isoCode);
          if (!countryStates.length) {
            const countryCities = City?.getCitiesOfCountry(country?.isoCode);
            setFormData((prevData) => ({ ...prevData, cities: countryCities }));
          } else {
            setFormData((prevData) => ({ ...prevData, cities: [] }));
          }
          setFormData((prevData) => ({ ...prevData, states: countryStates }));
          setFormData((prevData) => ({ ...prevData, selectedState: userData.selectedState }));
          setFormData((prevData) => ({ ...prevData, selectedCity: userData.selectedCity }));
        }
      };
      fetchStates();

    } else {
      initialRender.current = false;
    }
  }, [formData?.selectedCountry, formData?.countries, renderKey]);



  useEffect(() => {

    const fetchCities = () => {
      if (formData.selectedState) {
        const state = formData?.states?.find(state => state.name === formData.selectedState);
        const stateCities = City.getCitiesOfState(state?.countryCode, state?.isoCode);
        setFormData((prevData) => ({ ...prevData, cities: stateCities }));
        setFormData((prevData) => ({ ...prevData, selectedCity: userData.selectedCity }));
      }
    };
    fetchCities();

  }, [formData?.selectedState, formData?.states, renderKey]);



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

  const handlePhoneNumberFocus = () => {
    setIsPhoneNumberFocused(true);
    handleInputFocus("phoneNumber")
  };

  const handlePhoneNumberBlur = () => {
    setIsPhoneNumberFocused(false);
  };


  const formatPhoneNumber = (inputValue) => {
    let formattedValue = '';


    let digitsOnly = inputValue?.replace(/\D/g, '');


    if (digitsOnly?.length > 10) {

      digitsOnly = digitsOnly?.slice(0, 10);
    }

    if (digitsOnly?.length > 6) {
      formattedValue = `(${digitsOnly?.slice(0, 3)}) ${digitsOnly?.slice(3, 6)}-${digitsOnly?.slice(6)}`;
    } else if (digitsOnly?.length > 3) {
      formattedValue = `(${digitsOnly?.slice(0, 3)}) ${digitsOnly?.slice(3)}`;
    } else {
      formattedValue = digitsOnly;
    }

    return formattedValue;
  };




  //********* ERROR HANDLING *********/
  const handleError = () => {
    const errors = {};

    if (!formData?.firstName?.trim()) {
      errors.firstName = ('firstName is required');
    } else if (!validateName(formData?.firstName)) {
      errors.firstName = `${(formData?.firstName)} => Name should be alphabet only`;
    }

    if (!formData?.lastName?.trim()) {
      errors.lastName = 'LastName is required';
    } else if (!validateName(formData?.lastName)) {
      errors.lastName = `${(formData?.lastName)} => Name should be alphabet only`;
    }

    if (!formData?.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData?.email)) {
      errors.email = `${(formData?.email)} => Please, follow email format ***@***.*** `;
    }

    if (!formData?.roleName?.trim()) {
      errors.roleName = 'Role Name is required';
    }


    if (!formData?.phoneNumber?.trim()) {
      errors.phoneNumber = `Number is required `;
    } else if (!formData?.selectedCountry) {
      errors.phoneNumber = `Select Country for Code `;
    } else if (!validatePhoneNumber(formData?.phoneNumber)) {
      errors.phoneNumber = `Invalid=>(XXX)-XXX-XXXX  `;
    }

    if (formData?.zipCode && !validateZipCode(formData?.zipCode)) {
      const validZipCode = validateZipCode(formData?.zipCode)

      errors.zipCode = `${(formData?.zipCode)} => special character are not allowed in zip code`;
    }
    if (formData?.userImage) {

      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(formData?.userImage?.type)) {
        errors.userImage = 'Only JPEG and PNG images are allowed';
      }

      const maxSizeInBytes = 500 * 1024;
      if (formData?.userImage?.size > maxSizeInBytes) {
        errors.userImage = 'Image size exceeds 500KB limit';
      }
    }

    if (Object.keys(errors)?.length > 0) {
      setFormErrors(errors);
    }

    return errors;
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
    setSubmitLoading(true);
    checkChanges();

    const errors = handleError();

    if ((errors && Object.keys(errors).length === 0) && warning) {

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
              "createdBy": formData.createdBy,
              "contactInformation": {
                "phoneNumber": formData.phoneNumber.replace(/\D/g, ''),
                "secondPhoneNumber": formData.secondPhoneNumber,
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
        const response = await userService.update(formattedData, formData.userImage, token.token);
        if (response.status === 400) {
          setLoading(false);
          navigate("/500");
          return;
        }
        const data = await response.json();

        setStatus(data?.status)
        if (data?.status === "OK" && data?.msg === "User updated successfully") {
          const changesList = Object.keys(difference).map(key => `<li class='text-left break-words whitespace-pre-wrap' style='word-break: break-all;'><strong>${userData[key] ? userData[key] : "No Data"}</strong> changes to <strong>${difference[key] ? difference[key] : "No Data"}</strong></li>`).join('');
          setInfoMessage(`
            The following user ${Object.keys(difference).length === 1 ? 'information' : 'informations'} updated successfully! <br>
            <ul class='list-disc list-inside ml-2 mt-2'>${changesList}</ul>
        `);

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



  //*********** RENDERING ADD USER COMPONENT ************/
  if (loading) {
    return <LoadingIndicator />
    // return <div className="fixed top-0 left-0 bottom-0 right-0 flex flex-col items-center justify-center z-50">Loading...</div>;
  }


  return (
    <div>
      <div className="z-50 fixed inset-0 flex items-start justify-center bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm overflow-y-auto pt-10">
        <div className="bg-white sm:ml-24 px-8 rounded-lg w-3/5 md:w-1/2 max-h-[800px] max-w-[1200px] overflow-y-auto">
          <div className={`flex flex-col ${warning ? '' : 'mb-10'}`}>
            <div className={`flex justify-between `}>
              <h1 className="text-2xl font-bold mt-2">Edit User</h1>
              <div
                className="mx-center cursor-pointer text-4xl px-3 mb-4  text-red-300  hover:text-red-600"
                onClick={() => navigate(-1)}
              >
                x
              </div>
            </div>

            {warning &&
              (<div className="flex justify-between">
                <div className="px-2 py-1 text-lg italic text-red-900">{submitInfo ? submitInfo : ''}</div>
                <button className="mb-2 px-4 max-h-10 py-1 bg-red-100 hover:bg-red-200  rounded-lg" onClick={handleReset}>
                  Reset
                </button>
              </div>)}

          </div >

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col md:space-x-4">
              <div className="w-full space-y-4">
                <div className={`md:space-x-4 md:flex space-y-4 md:space-y-0 `}>
                  <div className="flex flex-col w-full">
                    <label htmlFor="firstName">First Name {renderAlert('firstName')}</label>
                    <input
                      id="firstName"
                      type="text"
                      value={formErrors.firstName || formData.firstName}
                      onChange={(e) => handleInputChange(e, 'firstName')}
                      className={`border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.firstName ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                      onFocus={() => handleInputFocus('firstName')}
                      placeholder={formErrors.firstName || "First Name *"}
                      required
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label htmlFor="lastName">Last Name {renderAlert('lastName')}</label>
                    <input
                      id="lastName"
                      type="text"
                      value={formErrors.lastName || formData.lastName}
                      onChange={(e) => handleInputChange(e, 'lastName')}
                      className={`border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.lastName ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                      placeholder={formErrors.lastName || "Last Name *"}
                      onFocus={() => handleInputFocus('lastName')}
                      required
                    />
                  </div>
                </div>

                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">
                  <div className="flex flex-col w-full">
                    <label htmlFor="email">Email <span className="pl-3 italic text-blue-400">You can't change the email</span></label>
                    <input
                      id="email"
                      type="email"
                      value={formErrors.email || formData.email}
                      onChange={(e) => handleInputChange(e, 'lastName')}
                      className={`cursor-not-allowed border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.email ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                      placeholder={formErrors.email || "Email Address *"}
                      onFocus={() => handleInputFocus('email')}
                      disabled
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label htmlFor="role">Select Role  <span className="pl-3 italic text-blue-400">You can't change the role</span></label>
                    <select
                      id="UserRoleId"
                      disabled
                      value={formErrors.roleName || formData.roleName}
                      onChange={(e) => handleInputChange(e, 'roleName')}
                      className={`cursor-not-allowed border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.roleName ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                      onFocus={() => handleInputFocus('roleName')}
                    >
                      <option value="" disabled >{formErrors.roleName || "Select Roles "}</option>
                      {roles.map((role, index) => (
                        <option key={index} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                  </div>
                </div>
                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">
                  <div className="flex flex-col w-full">
                    <label htmlFor="country">Country {renderAlert('selectedCountry')}</label>
                    <select
                      id="country"
                      ref={countryRef}
                      value={formData.selectedCountry}
                      onChange={(e) => handleInputChange(e, 'selectedCountry')}
                      className="overflow-y-auto max-h-24 flex flex-row border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                    >
                      <option value="" >Select Country</option>
                      {formData.countries?.map((country, index) => (
                        <option key={index} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col w-full">
                    <label htmlFor="state">State {renderAlert('selectedState')}</label>
                    <select
                      id="state"
                      value={formData.selectedState}
                      onChange={(e) => handleInputChange(e, 'selectedState')}
                      className="flex flex-row border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                    >
                      <option value="" >Select State</option>
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
                </div>
                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">
                  <div className="flex flex-col w-full">
                    <label htmlFor="city">City {renderAlert('selectedCity')}</label>
                    <select
                      id="city"
                      value={formData.selectedCity}
                      onChange={(e) => handleInputChange(e, 'selectedCity')}
                      className="flex flex-row border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                    >
                      <option value="" >Select City</option>
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
                  </div>
                  <div className="flex flex-col w-full">
                    <label htmlFor="streetAddress">Street Address {renderAlert('streetAddress')}</label>
                    <input
                      id="streetAddress"
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => handleInputChange(e, 'streetAddress')}
                      className="flex flex-row border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                      placeholder="Street Address"

                    />
                  </div>
                </div>

                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">
                  <div className="flex flex-col w-full">
                    <label htmlFor="phoneNumber" className=" w-full ">Phone Number {renderAlert('phoneNumber')}</label>
                    <div
                      tabIndex={0}
                      onFocus={() => phoneNumberRef.current.focus()}
                      className={`flex flex-row border p-2 rounded-lg w-full  border-green-400 ${isPhoneNumberFocused ? 'ring-1 ring-green-600' : ''} ${formErrors.phoneNumber ? 'border-red-400' : ''}`}
                    >

                      <input
                        id="phoneCode"
                        type="text"
                        value={formErrors.phoneNumber ? 'Phone ' : formData.phoneCode ? !formData.phoneCode.startsWith('+') ? `+${formData.phoneCode}` : formData.phoneCode : ""}
                        className={`text-right w-2/12 ${formErrors.phoneNumber ? 'text-red-400 italic text-sm' : 'pr-2'}`}
                        placeholder="Phone#"
                        readOnly
                      />
                      <input
                        id="phoneNumber"
                        type="text"
                        value={formErrors.phoneNumber || formData.phoneNumber}
                        onChange={(e) => handleInputChange(e, 'phoneNumber')}
                        onFocus={handlePhoneNumberFocus}
                        onBlur={handlePhoneNumberBlur}
                        ref={phoneNumberRef}
                        className={`focus:outline-none w-10/12 overflow-auto${formErrors.phoneNumber ? 'text-red-400 italic text-sm' : ''}`}
                        placeholder={formErrors.phoneNumber || "Phone Number  *"}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full">
                    <label htmlFor="secondPhoneNumber">Second Phone Number {renderAlert('secondPhoneNumber')}</label>
                    <input
                      id="secondPhoneNumber"
                      type="text"
                      value={formData.secondPhoneNumber}
                      onChange={(e) => handleInputChange(e, 'secondPhoneNumber')}
                      className="border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400"
                      placeholder="If you have secondary Phone Number"
                    />

                  </div>
                </div>
                <div className="md:space-x-4 md:flex space-y-4 md:space-y-0 ">
                  <div className="flex flex-col w-full">
                    <label htmlFor="zipCode">Zip Code {renderAlert('zipCode')}</label>
                    <input
                      id="zipCode"
                      type="text"
                      value={formErrors.zipCode || formData.zipCode}
                      onChange={(e) => handleInputChange(e, 'zipCode')}
                      className={`border p-2 rounded-lg w-full  focus:outline-none focus:ring-1 focus:ring-green-600 border-green-400 ${formErrors.zipCode ? ' border-red-400 italic text-sm text-red-300' : ' '}`}
                      onFocus={() => handleInputFocus('zipCode')}
                      placeholder={formErrors.zipCode || "Zip Code "}
                    />
                  </div>
                  <div className="flex flex-col w-full">

                    <label htmlFor="userImage" className="cursor-pointer">
                      Profile Picture
                      {(!imageloading || !userData.name) && renderAlert('name')}
                    </label>

                    <ProfilePictureUpload formData={formData} setFormData={setFormData} formErrors={formErrors} />
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
            </div>
          </form>
        </div>
      </div>
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

export default EditUser;