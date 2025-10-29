import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import axios from 'axios'

import { ToastContainer, toast } from 'react-toastify'


import GoogleLogin from '../../components/googleLogin'
import { usernameChecker, passwordChecker } from '../../utility/auth'

import { useAuth } from "../../hooks/useAuth";

import './index.scss'
import { CircleArrowToright } from './icons'

const Signin = () => {
    const { login, user, logout } = useAuth();
    const location = useLocation();

    const [usernameAndPasswordNotCorrect, setUsernameAndPasswordNotCorrect] = useState(false)

    const { email, message, pass } = location.state || { email: null, message: null };

    useEffect(() => {
        if (message) {
            toast.success(message);
        }
    }, []);

    const [values, setValues] = useState({
        username: '',
        usernameLabel: '',
        password: pass ?? '',
        passwordLabel: '',
        buttonText: 'Log in',
        buttonState: true
    })

    const { username, usernameLabel, password, passwordLabel, buttonText, buttonState } = values

    const handleChangeUsername = (name) => (event) => {


        let userCheck = usernameChecker(event.target.value)


        let xe
        if (userCheck.length > 0) {
            xe = true
        } else {
            xe = false
        }

        setValues({ ...values, usernameLabel: userCheck.toString(), buttonState: xe, [name]: event.target.value })

    }

    const handleChangePassword = (name) => (event) => {

        let userCheck = passwordChecker(event.target.value)


        let xe
        if (userCheck.length > 0) {
            xe = true
        } else {
            xe = false
        }

        setValues({ ...values, passwordLabel: userCheck.toString(), buttonState: xe, [name]: event.target.value })

    }

    const clickSubmit = (event) => {

        event.preventDefault()


        if (username !== '' && password !== '') {


            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (re.test(String(username).toLowerCase())) {
                let email = username;
                setValues({ ...values, buttonText: 'Loading...' })

                signiner({ email, password })

            } else {


                setValues({ ...values, buttonText: 'Loading...' })
                signiner({ username, password })


            }
        }


    }

    const signiner = (obj) => {
        axios({
            method: 'POST',
            url: `${import.meta.env.VITE_APP_API_URL}/signin`,
            data: obj
        })
            .then(async response => {
                console.log('SIGN IN SUCCESS', response)
                await login(response.data)

                toast.success(`Hello ${response.data.user.username}! You are seccesefly loggioned.`)

                setUsernameAndPasswordNotCorrect(false)
            })
            .catch(error => {
                console.log('SIGN IN error', error.response.data)
                setValues({ ...values, buttonText: 'Log in' })
                toast.error(error.response.data.error)
                setUsernameAndPasswordNotCorrect(true)
            })

    }

    const createValidationMessages = (validationText) => {
        console.log(validationText);
        if (validationText !== '') {
            const validationErrors = validationText.split(',')
            return validationErrors.length >= 1 ? validationErrors : undefined;
        }

    }

    return (
        <>
            {/*  <GoogleLogin /> */}
            {
                user?.isAuth ? (<div className="singInForm">

                    <h1> You are already logged in</h1>
                </div>) : (
                    <form className='signupForm singInForm mb1'>
                        <div className='fdc'>
                            <h1>Login</h1>
                            <h3>to start your Telehealth session</h3>
                        </div>
                        {
                            usernameAndPasswordNotCorrect ? <p className='incorectPasswordOrusername'> User or Password incorrect. </p> : ''
                        }


                        <div className="form-group">
                            <div className='formDiv'><label className="text-muted"> Username / email</label>
                                <input pattern=".{8,}" title="Username must be at least 8 characters long" onChange={handleChangeUsername('username')} value={username} name="username" type="text" className={`form-control ${usernameLabel ? 'is-invalid' : usernameAndPasswordNotCorrect === true ? 'is-invalid' : ''}`} required />
                            </div>

                            <label className="awrp"> {createValidationMessages(usernameLabel) ? createValidationMessages(usernameLabel).map((item, index) => <div className='validationMesage' key={index}>{item}</div>) : ''} </label>
                        </div>

                        <div className="form-group">
                            <div className='formDiv'>    <label className="text-muted"> Password </label>
                                <input pattern=".{8,}" title="Username must be at least 8 characters long" onChange={handleChangePassword('password')} value={password} name="password" type="password" className={`form-control ${passwordLabel ? 'is-invalid' : usernameAndPasswordNotCorrect === true ? 'is-invalid' : ''}`} required />
                            </div>

                            <label className="awrp"> {createValidationMessages(passwordLabel) ? createValidationMessages(passwordLabel).map((item, index) => <div className='validationMesage' key={index}>{item}</div>) : ''} </label>
                        </div>

                        <a href="/forgot-password" className='forgotPassword'>Forgot Password?</a>

                        <div className="mt1">
                            <button className="w-100 br0 signInButton" onClick={clickSubmit} disabled={buttonState}>
                                {buttonText}
                                <CircleArrowToright fillColor="white" />
                            </button>
                            {/*  <Link to="/forgot-password" className="btn btn-outline-danger float-right">
                        Forgot Password
                    </Link> */}
                        </div>

                    </form>
                )
            }

            <ToastContainer />
        </>
    )
}

export default Signin