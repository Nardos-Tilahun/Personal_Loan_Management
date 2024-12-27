import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import getAuth from "../util/auth";
import AdminRoutes from "./AdminRoutes";
import CustomerRoutes from "./CustomerRoutes";
import { useAuth } from "../Contexts/useHook";

const Authenticator = () => {
    const { user, setUser } = useAuth()
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const loggedInUser = await getAuth();
                if (Object.keys(loggedInUser).length === 0) {
                    navigate("/login");
                    return;
                }
                setUser(loggedInUser);
                setLoading(false);
            } catch {
                setLoading(false);
                navigate("/login");
                return;
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return null;
    }

    return (
        <Routes>
            <Route
                path="/*"
                element={user.userRoleId === 1 ? <AdminRoutes /> : <CustomerRoutes />}
            />
        </Routes>
    );
};

export default Authenticator;
