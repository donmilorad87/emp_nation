import { validationResult } from 'express-validator';

/* import Token from '../models/token.js'; // Ensure .js extension */


//za povezivanje sa pythonom
//const {spawn} = require('child_process');``

export const runValidationForgotPassword = (req, res, next) => {

    //console.log(username, email, password)
    const errors = validationResult(req)
    //console.log(errors)

    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errorIterator(errors)
        })
    }
    next()
}

export const runValidationResetPassword = (req, res, next) => {

    //console.log(username, email, password)
    const errors = validationResult(req)
    //console.log(errors)

    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errorIterator(errors)
        })
    }
    next()
}

export const runValidationSignIn = (req, res, next) => {
    const { username, email, password } = req.body
    //console.log(username, email, password)
    const errors = validationResult(req)
    //console.log(errors)
    let arrayh = []
    console.log(username, email)
    if (username === undefined && email !== undefined) {
        arrayh = errors.errors.filter(error => error.username === 'username');
    }
    else if (email === undefined && username !== undefined) {
        arrayh = errors.errors.filter(error => error.email === 'email');
    } else if (username === undefined && email === undefined) {
        arrayh = ['morate imati bar username ili password jebem mu lebac']
    }
    console.log(errors, arrayh)
    if (arrayh.length > 0) {
        return res.status(422).json({
            error: errorIterator(errors)
        })
    }
    next()
}
export const runUpdateEmailValidation = (req, res, next) => {
    const { email } = req.body

    const errors = validationResult(req)



}

export const runUpdateUsernameValidation = (req, res, next) => {
    const { username } = req.body

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errorIterator(errors)
        })
    }
    next()

}

export const runUpdatePasswordValidation = (req, res, next) => {
    const { activePassword, newPassword, confirmNewPassword } = req.body

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errorIterator(errors)
        })
    }
    next()

}


const errorIterator = (errors) => {
    let array = []

    errors.errors.forEach(error => array.push(error.msg));

    return array.toString()

}

