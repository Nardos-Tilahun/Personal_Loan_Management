import React, { useEffect, useState } from "react";
import install from "../services/install.service";

const Install = () => {
    const [installing, setInstalling] = useState(false);
    const [error, setError] = useState(null);
    const handleInstall = async () => {

        setInstalling(true);
        try {
            const response = await install();
            if (response.status === 400) {
                setLoading(false);
                navigate("/500");
                return;
            }
            if (response.ok) {
                console.log("Installed successfully");
            } else {
                setError("Installation failed. Please try again.");
            }
        } catch (error) {
            setLoading(false);
            navigate("/500");
            return;
        } finally {
            setInstalling(false);
        }
    };

    useEffect(() => {
        console.log("install 1")
        handleInstall();
        console.log("install 2")
    }, []);

    return (
        <div>
            <h2>Installation</h2>
            {installing ? (
                <p>Installing...</p>
            ) : (
                <>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                </>
            )}
        </div>
    );
};

export default Install;
