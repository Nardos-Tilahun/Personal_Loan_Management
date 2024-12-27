const api_url = import.meta.env.VITE_REACT_APP_API_URL;
const user = import.meta.env.VITE_REACT_USERROUTES;
const loan = import.meta.env.VITE_REACT_LOANROUTES;
const payment = import.meta.env.VITE_REACT_PAYMENTROUTES;
const udelete = import.meta.env.VITE_REACT_DELETEUSER;
const lpdelete = import.meta.env.VITE_REACT_DELETEPAYMENT;

const deletedUser = async (deletedData, token) => {
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify(deletedData)
    };
    const response = await fetch(`${api_url}${user}${udelete}`, requestOptions);
    return response;
}
const deletedLoan = async (deletedData, token) => {
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify(deletedData)
    };
    const response = await fetch(`${api_url}${loan}${lpdelete}`, requestOptions);
    return response;
}
const deletedPayment = async (deletedData, token) => {
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        },
        body: JSON.stringify(deletedData)
    };
    
    const response = await fetch(`${api_url}${payment}${lpdelete}`, requestOptions);
    return response;
}


const deletedService = {
    deletedUser,
    deletedLoan,
    deletedPayment
}

export default deletedService; 