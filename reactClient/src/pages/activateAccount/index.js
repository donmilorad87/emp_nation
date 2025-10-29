import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'
import { useEffect, useState } from 'react';
import axios from 'axios'

import { useNavigate } from 'react-router-dom';
import './index.scss'
const ActivateAccount = () => {
    const navigate = useNavigate();
    const location = useLocation();


    const { email, username } = location.state || {};

    useEffect(() => {

        if (!email && !username) {
            navigate('/',
                {
                    state: {
                        unseccesfulActivationTry: true
                    },
                }
            )
        } else {
            toast.success(`Please check your email account: ${email}`)
        }

    }, [])

    const [values, setValues] = useState({
        email: email,
        username,
        code: ''
    })

    const { code } = values

    const handleChange = (name) => (event) => {
        setValues({ ...values, [name]: event.target.value })
        console.log(values)
    }


    const clickSubmit = (event) => {

        event.preventDefault()

        if (code) {
            setValues({ ...values })
        }
        axios({
            method: 'POST',
            url: `${import.meta.env.VITE_APP_API_URL}/account-activation`,
            data: { code }
        })
            .then(response => {
                console.log('Acount Activation Success', response)
                setValues({ ...values })


                navigate('/signin', {
                    state: {
                        email: email, // Replace with the actual username
                        message: 'You have successfully activated your account. Please login.'
                    },
                });


                toast.success(response.data.message)
            })
            .catch(error => {
                console.log('Acount Activation Error', error.response.data)
                toast.error(error.response.data.error)
            })
    }

    return (
        <>



            <form className='activateForm'>
                <div >
                    <h1>Account Activation</h1>
                    <h2 className="">Hey, {username}. Ready to activate youre account? </h2>
                    <p>Email with activation code has been send to {email}</p>
                    <p>Please check your inbox</p>
                </div>
                <div className="form-group">
                    <div className='formDiv'>
                        <label className="text-muted"> Code </label>
                        <input onChange={handleChange('code')} value={code} type="password" className="form-control" required />
                    </div>


                    <button className="btn btn-outline-primary" onClick={clickSubmit}> Activate Account</button>

                </div>

            </form>

            <ToastContainer />
        </>
    )
}

export default ActivateAccount