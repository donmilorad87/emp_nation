import { Router } from 'express'

const router = Router()

//import controller

import { singup, accountActivation, resetPasswordActivation, emailChangeVerification, signin, forgotPassword, resetPassword, googleLogin } from '../controllers/auth.js'

//import validatotrs
import { userSingupValidator, userSignInValidator, forgotPasswordValidator, resetPasswordValidator } from '../validators/auth.js'
import { /* runValidationSignIn, */ runValidationForgotPassword, runValidationResetPassword } from '../validators/index.js'

router.post('/singup', userSingupValidator, singup)
router.post('/account-activation', accountActivation)
router.post('/email-change-verification', emailChangeVerification)
router.post('/signin', userSignInValidator, /* runValidationSignIn, */ signin)

//forgot reset password
router.put('/forgot-password', forgotPasswordValidator, runValidationForgotPassword, forgotPassword)
router.post('/reset-password-activation', resetPasswordActivation)
router.put('/reset-password', resetPasswordValidator, runValidationResetPassword, resetPassword)

//google auth

router.post('/google-login', googleLogin)

export default router