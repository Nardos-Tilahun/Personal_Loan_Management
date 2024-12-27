import React, { useState } from "react";
import PropTypes from 'prop-types';


const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [openPage, setOpenPage] = useState('Home');
    const [user, setUser] = useState(null);
    const [addedData, setAddedData] = useState({});
    const [loading, setLoading] = useState(false);

    const value = {
        user, setUser, openPage, setOpenPage, addedData, setAddedData, loading, setLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node
};

export default AuthContext;
