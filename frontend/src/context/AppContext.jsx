import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);

    const getAuthState = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/is-auth`);

            if (data.success) {
                // toast.success(data.message);
                await getUserData();
                setIsLoggedIn(true);
            }
        } catch (error) {
            // toast.error(error.message);
        }
    }

    useEffect(() => {
        getAuthState();
    }, []);

    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/data`, { withCredentials: true });
            data.success ? setUserData(data.userData) : toast.error(data.message);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Something Went Wrong')
        }
    }

    const value = {
        backendUrl, isLoggedIn, setIsLoggedIn, userData, setUserData, getUserData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}