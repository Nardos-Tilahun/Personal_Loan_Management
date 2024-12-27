import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from "react-router-dom";
import './LoginPage.css';
import loginService from '../../../services/login.service';
import logo from '../../../assets/images/FinancialLogo.png';
import ConfirmationPanel from '../../../util/ConfirmationPage';
import InfoDialog from '../../../util/InformationPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function LoginForm({ reset, confirm }) {

  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [infoType, setInfoType] = useState('');
  const [loading, setLoading] = useState(false);
  const [expToken, setExpToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);




  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams?.get('email');
    const tokenParam = queryParams?.get('token');
    const expiredParam = queryParams?.get('expired');
    if (reset && !confirm) {
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam));
        setExpToken(false)
      } else {
        setExpToken(true)
        setInfoMessage("Sent token has been exprired! Reset again!");
        setInfoType('error');
        setShowInfoDialog(true);

      }
      if (tokenParam) {
        setToken(tokenParam);

      }
    } else if (!reset && confirm) {
      if (emailParam) {
        setStatus(decodeURIComponent(emailParam))
        setInfoMessage(`
        Your Account  ${decodeURIComponent(emailParam)}
        has been successfully Confirmed!<br>
        From now on, you will receive notification!`);
        setInfoType('success');
        setShowInfoDialog(true);
        setExpToken(false)
      } else {
        setExpToken(true)
        setInfoMessage("Sent token has been exprired! Confirmation must be sent again!");
        setInfoType('error');
        setShowInfoDialog(true);
      }
      if (tokenParam) {
        setToken(tokenParam);

      }
    }
  }, [location, reset]);

  const checkEmailRegex = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const checkPasswordRegex = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return true
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('')
    setServerMessage('')
    setLoading(true);
    if (!email || !checkEmailRegex(email)) {
      setEmail('')
      setServerError('Please enter a valid email or Password');
      setLoading(false);
      return;
    }
    if (!password || !checkPasswordRegex(password)) {
      setServerError('Please enter a valid email or Password');
      setLoading(false);
      return;
    }
    try {
      const formData = {
        data: [{ user: { email, password } }]
      };
      const response = await loginService.logIn(formData);
      if (response.status === 400) {
        setLoading(false);
        navigate("/500");
        return;
      }
      const data = await response.json();
      if (response.ok && data.response.status === 'OK') {
        const tokenData = {
          token: data.response.userData
        };
        try {
          localStorage.setItem("user", JSON.stringify(tokenData));
          navigate('/');
        } catch (err) {
          setLoading(false);
          navigate("/500");
          return;
        }
      } else {
        setServerError(data.response.msg || 'An error occurred');
      }
    } catch (error) {
      setLoading(false);
      navigate("/500");
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordChange = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = {
        user: { email }
      };
      const response = await loginService.forgotPassword(formData);
      const data = await response.json();

      if (data?.status === 'OK' && data.msg === 'Password reset Email sent') {
        setInfoMessage("Your password reset link has been sent!<br> <br> Please check your email! <br><br> The link will expire after 10 minutes!");
        setInfoType("success");
      } else if (data.status === 'FAIL' || data.msg === "No Account found") {
        setInfoMessage("Your Email is not found in our Database <br>Please Check your email again");
        setInfoType('error');

      } else if (data.status === 'CONFLICT') {
        setInfoMessage("Your previous token hasn't expired yet! <br>Please check your email, <br> or try again in 10 minutes.");
        setInfoType('error');
      } else {
        setServerError(data.msg);

      }
      setServerMessage('');
      setEmail('');
      setPassword('');
      setShowInfoDialog(true);
      setLoading(false)
    } catch (error) {
      setInfoMessage("An error occurred. Please try again later.");
      setInfoType('error');
      setServerMessage('');
      setServerError('');
      return;
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    if (!email || !checkEmailRegex(email)) {
      setEmail('')
      setEmailError('Please enter your valid email to reset your password');
      return;
    }
    setConfirmMessage(`${`Are you sure you want to send a password reset link to <br> <strong>${email}<strong>?`}`);
    setShowConfirmation(true);
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (!password || !checkPasswordRegex(password)) {
      setPasswordError('Please enter your new password');
      setServerError('at least 8 characters, one uppercase letter, one lowercase letter, one digit, one special character');
    }
    if (!confirmPassword || !checkPasswordRegex(confirmPassword)) {
      setConfirmPasswordError('Please enter your new password again');
      setServerError('at least 8 characters, one uppercase letter, one lowercase letter, one digit, one special character');
    }
    if (password !== confirmPassword) {
      setServerError('Your password is not matched');
    }
    if (!(password && confirmPassword && password === confirmPassword)) {
      setLoading(false);
      return;
    }
    try {
      const formData = {
        user: { email, password, confirmPassword, token }
      };
      const response = await loginService.updatePassword(formData);
      if (response.status === 400) {
        setLoading(false);
        navigate("/500");
        return;
      }
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setInfoMessage("Your password has been successfully changed.");
        setInfoType("success");
        setShowInfoDialog(true);
        setServerError('');
      } else {
        setInfoMessage("Token has been expired!");
        setInfoType("error");
        setShowInfoDialog(true);
        setServerError('');
      }
    } catch (error) {
      setLoading(false);
      navigate("/500");
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleCloseInfoDialog = () => {
    setShowInfoDialog(false);
    if (reset || confirm) {
      if (status) {
        setEmail(status)
      }
      navigate('/login');
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'email') {
      setEmail(value);
      setEmailError('');
    } else if (name === 'password') {
      setPassword(value);
      setPasswordError('');
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
      setConfirmPasswordError('');
    }
    setServerError('');
    setServerMessage('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="2xl:max-w-full 2xl:flex 2xl:justify-center">
      <div className="flex items-center h-screen min-h-screen w-screen min-w-screen flex-col md:flex-row md:justify-center md:h-screen md:w-screen login-page min-w-[400px]">
        <div className="min-w-[400px] max-w-[1500px] w-full flex flex-col md:flex-row justify-center items-center">
          <div className="bg-gray-300 bg-opacity-80 p-[100px] xl:p-[70px] w-96 h-20 shadow-md rounded-l-lg md:w-[20vw] md:h-3/5 md:min-w-64 flex justify-center items-center">
            <img src={logo} className="w-2/5 max-w-[150px] xl:max-w-[200px] mx-auto md:w-auto" alt="Logo" loading="lazy"  />
          </div>
          <div className="bg-gray_ p-[8px] w-96 sm:w-2/5 sm:h-4/5 md:h-[370px] sm:min-w-96 shadow-md rounded-r-lg">
            <div className={`text-xl text-center font-bold text-gray-700 mt-2 ${serverError || serverMessage ? '' : 'mb-10'}`}>{`${reset && !expToken ? `Reset your Password` : `Sign-In to your account`}`}</div>
            <form onSubmit={handleSubmit} noValidate>
              <div className={`text-center ${reset && !expToken ? 'pb-2' : 'pb-4'}`}>
                {(serverError || serverMessage) && (
                  <div className={`w-2/3 flex justify-center items-start px-4 rounded-md shadow-md border-l-4 ${serverError ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'} my-2 mx-auto`} role="alert">
                    <div className="mr-3 ">
                      <FontAwesomeIcon icon={serverError ? faExclamationCircle : faCheckCircle} className={`text-xl ${serverError ? 'text-red-400' : 'text-green-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${serverError ? 'text-red-600' : 'text-green-600'}`}>
                        {serverError || serverMessage}
                      </p>
                    </div>
                  </div>
                )}

                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={emailError ? emailError : 'Email Address'}
                  value={email}
                  onChange={handleInputChange}
                  onFocus={() => {
                    setServerError('');
                    setServerMessage('');
                  }}
                  readOnly={reset && !expToken}
                  className={`w-2/3 border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-green-600 ${emailError ? 'border-red-400 bg-red-100' : 'border-green-400'}`}
                />

              </div>
              <div className={`text-center ${reset && !expToken ? 'py-2' : 'py-4'}`}>
                <div className="relative w-2/3 mx-auto">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder={passwordError ? passwordError : reset && !expToken ? 'Enter your new password' : 'Password'}
                    value={password}
                    onChange={handleInputChange}
                    onFocus={() => {
                      setServerMessage('');
                      setServerError(false)
                    }}
                    className={`w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-green-600 ${passwordError ? 'border-red-400 bg-red-100' : 'border-green-400'}`}
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    className={`absolute inset-y-0 right-0 flex items-center cursor-pointer ${showPassword ? ' pr-[9px]' : ' pr-[10px]'}`}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-600" size="sm" />
                  </span>
                </div>
              </div>
              {reset && !expToken &&
                <div className={`text-center ${reset && !expToken ? 'py-2' : 'py-4'}`}>
                  <div className="relative w-2/3 mx-auto">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder={confirmPasswordError ? confirmPasswordError : 'Enter again to confirm your new password'}
                      value={confirmPassword}
                      onFocus={() => {
                        setServerError('');
                        setServerMessage('');
                      }}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-green-600 ${passwordError ? 'border-red-400 bg-red-100' : 'border-green-400'}`}
                    />
                    <span
                      onClick={toggleConfirmPasswordVisibility}
                      className={`absolute inset-y-0 right-0 flex items-center cursor-pointer ${showConfirmPassword ? ' pr-[9px]' : ' pr-[10px]'}`}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="text-gray-600" size="sm" />
                    </span>
                  </div>
                </div>
              }
              {!(reset && !expToken) ?
                <div className="pt-4 text-center">
                  <button
                    type="submit"
                    className={`w-2/3 px-10 py-2 bg-green-500 text-white border-none rounded-md mb-8 border border-white transition duration-400 ease-in-out hover:bg-green-600 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={loading}
                    data-loading-text="Please wait..."
                  >
                    {loading ? 'Loading...' : 'Sign In'}
                  </button>

                </div> :
                <div className="pt-4 text-center">
                  <button onClick={handleUpdatePassword} className={`w-2/3 px-10 py-2 bg-green-500 text-white border-none rounded-md mb-8 border border-white transition duration-400 ease-in-out hover:bg-green-600 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} disabled={loading}>
                    {loading ? 'Loading...' : 'Update Password'}
                  </button>
                </div>}
              <div className="text-green-600 mx-24 p-1 w-full cursor-pointer transition duration-400 ease-in-out hover:text-green-500 hover:underline">
                {!(reset && !expToken) ? <button onClick={handleForgotPassword}>Forgot Password?</button> : <Link to="/login">Back to Login</Link>}
              </div>
            </form>
          </div>
        </div>
      </div>
      {showConfirmation && (
        <ConfirmationPanel
          message={confirmMessage}
          onConfirm={handleConfirmPasswordChange}
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

export default LoginForm;