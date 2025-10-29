import { Link, useMatch } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth";
import './index.scss'
import { EmpowerNation } from '../../pages/CallFrame/Icons';

const Navigation = () => {
    const homeMatch = useMatch('/');
    const signinMatch = useMatch('/signin');
    const signupMatch = useMatch('/signup');
    const activateAccountMatch = useMatch('/activate-account');

    const secretMatch = useMatch('/secret');
    const secretAdminMatch = useMatch('/secret-admin');

    const settingsMatch = useMatch('/dashboard/settings');
    const profileMatch = useMatch('/dashboard/profile');
    const twoFactorAuthMatch = useMatch('/verify-2fa');

    const providerMatch = useMatch('/provider');
    const notProviderMatch = useMatch('/not-provider');

    const adminMatch = useMatch('/admin');
    const notAdminMatch = useMatch('/not-admin');
    const forgotPasswordMatch = useMatch('/forgot-password');
    const resetPasswordMatch = useMatch('/reset-password');
    const resetPasswordActivationMatch = useMatch('/reset-password-activation');
    const roomAnalyticsMatch = useMatch('/room-analytics');


    const { user, logout } = useAuth();
    console.log(user);


    const handleLogout = () => {
        logout();
    };


    return (
        <>

            {/* <nav className="navigation">
                {
                    !user?.isAuth &&
                    <>

                        <Link className={signupMatch ? 'active' : ''} to="/signup">Signup</Link>
                        <Link className={signinMatch ? 'active' : ''} to="/signin">Signin</Link>

                    </>
                }
                {
                    user?.isAuth &&
                    <>
                        <Link className={settingsMatch ? 'active' : ''} to="/settings">Settings</Link>
                        <Link className={profileMatch ? 'active' : ''} to="/profile">Profile</Link>
                        <Link className={secretMatch ? 'active' : ''} to="/secret">Secret</Link>
                        <Link className={twoFactorAuthMatch ? 'active' : ''} to="/verify-2fa">Two Factor Authentication</Link>
                        <Link className={secretAdminMatch ? 'active' : ''} to="/secret-admin">Secret Admin</Link>

                        <Link className={providerMatch ? 'active' : ''} to="/provider">Provider</Link>
                        <Link className={notProviderMatch ? 'active' : ''} to="/not-provider">Not Provider</Link>

                        <Link className={adminMatch ? 'active' : ''} to="/admin">Admin</Link>
                        <Link className={notAdminMatch ? 'active' : ''} to="/not-admin">Not Provider</Link>


                    </>

                }

            </nav>
            {
                user?.isAuth && (<div>

                    <button onClick={handleLogout}>Logout</button>
                </div>)
            } */}
            <div className="navigation">
                <EmpowerNation />


                <nav className={`${user?.isAuth ? 'df navigationNav2' : 'navigationNav'}`}>
                    {
                        user?.isAuth && (
                            <>
                                <Link className={signupMatch ? 'active' : ''} to={`/${user.user.username}`}>Room</Link>
                                <Link className={roomAnalyticsMatch ? 'active' : ''} to="/room-analytics">Room Analytics</Link>
                            </>
                        )
                    }
                </nav>

                {


                    user?.isAuth && (
                        <div className="mla logOutButtonHeader">

                            <button onClick={handleLogout}>Logout</button>
                        </div>)

                }


            </div >
        </>

    )
}

export default Navigation