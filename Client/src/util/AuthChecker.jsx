import { useEffect } from 'react';
import { useAuth } from './../Contexts/useHook';
import getAuth from './auth'; 
function AuthChecker ()  {
    const { setIsAdmin, setUser, setIsLogged, setLoading } = useAuth();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("user");

            if (token) {
                try {
                    const loggedInAdmin = await getAuth(token);
                    setIsLogged(true);
                    setIsAdmin(loggedInAdmin?.userRoleId === 1);
                    setUser(loggedInAdmin);
                } catch (error) {
                    setIsLogged(false);
                    setIsAdmin(false);
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setIsLogged(false);
                setIsAdmin(false);
                setUser(null);
                setLoading(false);
            }
        };

        checkAuth();
    }, [setIsAdmin, setUser, setIsLogged, setLoading]);

};

export default AuthChecker
