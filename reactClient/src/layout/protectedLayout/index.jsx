import { Navigate, Outlet, useMatch } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/Header";


export const ProtectedLayout = () => {
    const { user } = useAuth();
    const roomAnalyticsMatch = useMatch('/room-analytics');
    if (!user.isAuth) {
        return <Navigate to="/not-logged-in" />;
    }

    return (
        <main className={`home-layout`}>
            <div className={`w-100 ${roomAnalyticsMatch ? 'room-analytics' : ''}`}>
                <Header />
                <Outlet />
            </div>



        </main>
    );
};