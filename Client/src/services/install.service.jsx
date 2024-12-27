const api_url = import.meta.env.VITE_REACT_APP_API_URL;
const installing = import.meta.env.VITE_REACT_INSTALL;


const install = async () => {
    const requestOption = {
        method: "GET",
        headers: {
            'Content-Type': 'Applcation/json'
        }
    }

    const response = await fetch(`${api_url}${installing}`, requestOption);
    return response;
}

export default install;