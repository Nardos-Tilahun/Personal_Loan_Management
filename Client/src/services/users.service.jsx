const api_url = import.meta.env.VITE_REACT_APP_API_URL;
const user = import.meta.env.VITE_REACT_USERROUTES
const registeration = import.meta.env.VITE_REACT_REGISTER
const updating = import.meta.env.VITE_REACT_GETUSERDATAFORUPDATE
const list = import.meta.env.VITE_REACT_CUSTOMERLISTDATA
const adminList = import.meta.env.VITE_REACT_ADMINLISTDATA
const listLoan = import.meta.env.VITE_REACT_CUSTOMERLISTDATAFORLOAN
const updateVerify = import.meta.env.VITE_REACT_UPDATEVERIFICATION

const register = async (formData, profilePicture, loggedInUserToken) => {
  const formDataObj = new FormData();
  const appendData = (obj, prefix = '') => {

    for (const key in obj) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        appendData(obj[key], `${prefix}${key}.`);
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item, index) => {
          appendData(item, `${prefix}${key}[${index}].`);
        });
      } else {
        formDataObj.append(`${prefix}${key}`, obj[key]);
      }
    }
  };

  appendData(formData.data[0].user);
  formDataObj.append('profilePicture', profilePicture);

  const requestOptions = {
    method: 'POST',
    headers: {
      'x-access-token': loggedInUserToken
    },
    body: formDataObj
  };


  const response = await fetch(`${api_url}${user}${registeration}`, requestOptions);
  return response;
};



const update = async (formData, profilePicture, loggedInUserToken) => {
  const formDataObj = new FormData();
  const appendData = (obj, prefix = '') => {

    for (const key in obj) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        appendData(obj[key], `${prefix}${key}.`);
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item, index) => {
          appendData(item, `${prefix}${key}[${index}].`);
        });
      } else {
        formDataObj.append(`${prefix}${key}`, obj[key]);
      }
    }
  };

  appendData(formData.data[0].user);
  formDataObj.append('profilePicture', profilePicture);

  const requestOptions = {
    method: 'PUT',
    headers: {
      'x-access-token': loggedInUserToken
    },
    body: formDataObj
  };


  const response = await fetch(`${api_url}${user}${updating}`, requestOptions);
  return response;
};


const getAllUsers = async (token) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    }
  };
  const response = await fetch(`${api_url}${user}`, requestOptions);
  return response;
}

const getCustomerListData = async (token) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    }
  };
  const response = await fetch(`${api_url}${user}${list}`, requestOptions);
  return response;
}
const getAdminListData = async (token) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    }
  };
  const response = await fetch(`${api_url}${user}${adminList}`, requestOptions);
  return response;
}

const getCustomerListDataForLoan = async (token) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    }
  };
  const response = await fetch(`${api_url}${user}${listLoan}`, requestOptions);
  return response;
}
const getUserForUpdate = async (hashId, token) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'hash-Id': hashId,
      'x-access-token': token

    }
  };
  const response = await fetch(`${api_url}${user}${updating}`, requestOptions);
  return response;
}
const updateVerification = async (email, token, confirm) => {

  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'email': email,
      'confirm': confirm,
      'x-access-token': token

    }
  };
  const response = await fetch(`${api_url}${user}${updateVerify}`, requestOptions);
  return response;
}



const userService = {
  register,
  update,
  getAllUsers,
  getCustomerListData,
  getAdminListData,
  getCustomerListDataForLoan,
  getUserForUpdate,
  updateVerification
}

export default userService; 