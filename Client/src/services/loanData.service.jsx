const api_url = import.meta.env.VITE_REACT_APP_API_URL;
const user = import.meta.env.VITE_REACT_USERROUTES;
const customer = import.meta.env.VITE_REACT_CUSTOMERDATA;
const loan = import.meta.env.VITE_REACT_LOANROUTES;
const creating = import.meta.env.VITE_REACT_ADDLOAN;
const updating = import.meta.env.VITE_REACT_UPDATELOAN;
const information = import.meta.env.VITE_REACT_LOANINFODATA;
const listing = import.meta.env.VITE_REACT_LOANLISTDATA;
const payment = import.meta.env.VITE_REACT_LOANLISTDATAFORPAYMENT;


const addLoan = async (formattedData, token) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify(formattedData)
    };
    const response = await fetch(`${api_url}${loan}${creating}`, requestOptions);
    return response;
}
const updateLoan = async (formattedData, token) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify(formattedData)
    };
    const response = await fetch(`${api_url}${loan}${updating}`, requestOptions);
    return response;
}

const getLoanInfoData = async (hashId, token) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'hash-Id': hashId,
            'x-access-token': token
        }
    };
    const response = await fetch(`${api_url}${loan}${information}`, requestOptions);
    return response;
}

const getCustomerData = async (token, hashId) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
            'hash-Id': hashId
        }
    };
    const response = await fetch(`${api_url}${user}${customer}`, requestOptions);
    return response;
}

const getLoanListData = async (token) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
    };
    const response = await fetch(`${api_url}${loan}${listing}`, requestOptions);
    return response;
}

const getLoanListDataForPayment = async (token) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
    };
    const response = await fetch(`${api_url}${loan}${payment}`, requestOptions);
    return response;
}



const loanData = {
    addLoan,
    updateLoan,
    getLoanInfoData,
    getCustomerData,
    getLoanListData,
    getLoanListDataForPayment,
}

export default loanData; 