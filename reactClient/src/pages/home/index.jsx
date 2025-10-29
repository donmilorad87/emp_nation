
import { Navigate, Outlet } from "react-router-dom";


import Header from "../../components/Header";

import { useAuth } from "../../hooks/useAuth";


const Home = () => {

    const { user } = useAuth();
    console.log(user);

    if (user.isAuth) {
        return <Navigate to={`/${user.user.username}`} />;
    } else if (!user.isAuth) {
        return <Navigate to={`/signin`} />;
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

export default Home