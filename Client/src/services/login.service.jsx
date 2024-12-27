const api_url = import.meta.env.VITE_REACT_APP_API_URL;
const user = import.meta.env.VITE_REACT_USERROUTES
const signIn = import.meta.env.VITE_REACT_LOGINUSER;
const passwordForget = import.meta.env.VITE_REACT_FORGOTPASSWORD;
const passwordUpdate = import.meta.env.VITE_REACT_UPDATEPASSWORD;

const logIn = async (formData) => {

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  };

  const response = await fetch(`${api_url}${user}${signIn}`, requestOptions);

  return response;

};
const forgotPassword = async (formData) => {

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  };

  const response = await fetch(`${api_url}${user}${passwordForget}`, requestOptions);

  return response;


};

const updatePassword = async (formData) => {

  const requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  };

  const response = await fetch(`${api_url}${user}${passwordUpdate}`, requestOptions);

  return response;

};



const logOut = () => {
  localStorage.removeItem("token");
};

const loginService = {
  logIn,
  forgotPassword,
  updatePassword,
  logOut
};

export default loginService;