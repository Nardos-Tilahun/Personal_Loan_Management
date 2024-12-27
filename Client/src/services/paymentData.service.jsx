const api_url = import.meta.env.VITE_REACT_APP_API_URL;
const payment = import.meta.env.VITE_REACT_PAYMENTROUTES;
const creating = import.meta.env.VITE_REACT_ADDPAYMENT;
const updating = import.meta.env.VITE_REACT_UPDATEPAYMENT;
const information = import.meta.env.VITE_REACT_PAYMENTINFODATA;
const listing = import.meta.env.VITE_REACT_PAYMENTLISTDATA;


const addPayment = async (formattedData, token) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify(formattedData)
    };
    const response = await fetch(`${api_url}${payment}${creating}`, requestOptions);
    return response;
}

const updatePayment = async (formattedData, token) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify(formattedData)
    };
    const response = await fetch(`${api_url}${payment}${updating}`, requestOptions);
    return response;
}

const getPaymentInfoData = async (hashId, token) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'hash-Id': hashId,
            'x-access-token': token
        }
    };
    const response = await fetch(`${api_url}${payment}${information}`, requestOptions);
    return response;
}

const getPaymentListData = async (token) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
    };
    const response = await fetch(`${api_url}${payment}${listing}`, requestOptions);
    return response;
}


const paymentData = {
    addPayment,
    updatePayment,
    getPaymentInfoData,
    getPaymentListData
}

export default paymentData; 