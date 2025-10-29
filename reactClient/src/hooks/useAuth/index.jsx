import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    setUser,
    clearTranscriptMesages,
    clearAssistantMessages
} from "../../store/reducer";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.reducer.user);

    const [is2FAVerified, setIs2FAVerified] = useState(false);
    const navigate = useNavigate();

    const login = async (data) => {
        data.isAuth = true;

        dispatch(setUser(data));

        if (data.user.twofactorauth) {
            navigate("/verify-2fa");
        } else {
            navigate(`/${user.user.username}`);
        }
    };

    const logout = () => {
        dispatch(setUser({
            token: '',
            isAuth: false,
            user: {
                username: '',
                email: '',
                role: 0,
                twofactorauth: false,
            },
        }));
        window.stopAddingTranscripts = false
        dispatch(clearTranscriptMesages([]));
        dispatch(clearAssistantMessages([]));
        setIs2FAVerified(false);
        navigate("/signin", { replace: true });
    };

    const verify2FACode = async (code) => {
        if (code === "0000") {
            setIs2FAVerified(true);
            navigate("/secret");
            return true;
        }
        return false;
    };

    const value = {
        user,
        is2FAVerified,
        login,
        logout,
        verify2FACode,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
