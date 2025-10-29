
import { Navigate, Outlet } from "react-router-dom";


import './index.scss'
import Header from "../../components/Header";

import { useAuth } from "../../hooks/useAuth";


export const HomeLayout = () => {

    const { user } = useAuth();
    console.log(user);

    if (user.isAuth) {
        return <Navigate to={`/${user.user.username}`} />;
    }


    return (
        <>
            <main className="home-layout">
                <Header />
                <Outlet />
            </main>

        </>
    )
};