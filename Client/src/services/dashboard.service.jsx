const api_url = import.meta.env.VITE_REACT_APP_API_URL;
const user = import.meta.env.VITE_REACT_USERROUTES;
const dashboard_data = import.meta.env.VITE_REACT_DASHBOARDDATA;


const getDashboardData = async (token) => {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
    };
    const response = await fetch(`${api_url}${user}${dashboard_data}`, requestOptions);

    return response;
}

const dashData = {
    getDashboardData
}
export default dashData; 