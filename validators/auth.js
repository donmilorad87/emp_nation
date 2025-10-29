import { check } from 'express-validator';


export const userSingupValidator = [
    check('username')
        .not()
        .isEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .custom((value) => !(/[ `!#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/.test(value)))
        .withMessage('Username must not contain any special caracters (. and - and _ and @ are allowed)')
        .custom((value) => (countSpecialCharacters(value)))
        .withMessage('There is maximum 4 special caracters allowed')
        .custom((value) => (countNumbers(value)))
        .withMessage('There is maximum 6 numbers in userame allowed'),
    check('email')
        .isEmail()
        .withMessage('Valid email adress is required'),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Pasword must be at least 8 characters long is required')
        .custom((value) => (/\d/.test(value)))
        .withMessage('Password must have at least 1 number')
        .custom((value) => (value.match(/[a-z]/)))
        .withMessage('Password must have at least 1 lower case character')
        .custom((value) => (value.match(/[A-Z]/)))
        .withMessage('Password must have at least 1 upper case character')
        .custom((value) => (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value)))
        .withMessage('Password must have at least 1 special character'),
    check('confirmPassword').custom((value, { req }) => (value === req.body.password))
        .withMessage('Passwords do not match')
]
export const userUpdatePasswordVlidationParameters = [
    check('activePassword')
        .isLength({ min: 8 })
        .withMessage('Active Pasword must be at least 8 characters long is required')
        .custom((value) => (/\d/.test(value)))
        .withMessage('Active Password must have at least 1 number')
        .custom((value) => (value.match(/[a-z]/)))
        .withMessage('Active Password must have at least 1 lower case character')
        .custom((value) => (value.match(/[A-Z]/)))
        .withMessage('Active Password must have at least 1 upper case character')
        .custom((value) => (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value)))
        .withMessage('Active Password must have at least 1 special character'),
    check('newPassword')
        .isLength({ min: 8 })
        .withMessage('New Pasword must be at least 8 characters long is required')
        .custom((value) => (/\d/.test(value)))
        .withMessage('New Password must have at least 1 number')
        .custom((value) => (value.match(/[a-z]/)))
        .withMessage('New Password must have at least 1 lower case character')
        .custom((value) => (value.match(/[A-Z]/)))
        .withMessage('New Password must have at least 1 upper case character')
        .custom((value) => (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value)))
        .withMessage('New Password must have at least 1 special character'),
    check('confirmNewPassword')
        .custom((value, { req }) => (value === req.body.newPassword))
        .withMessage('New Passwords do not match')
]
export const userUpdateUsernameaVlidationParameters = [
    check('username')
        .not()
        .isEmpty()
        .withMessage('Username is required')
        .isLength({ min: 8 })
        .withMessage('Username must be at least 8 characters long')
        .custom((value) => !(/[ `!#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/.test(value)))
        .withMessage('Username must not contain any special caracters (. and - and _ and @ are allowed)')
        .custom((value) => (countSpecialCharacters(value)))
        .withMessage('There is maximum 4 special caracters allowed')
]
export const userUpdateEmailValidationParameters = [
    check('email')
        .isEmail()
        .withMessage('Valid email adress is required')
]
export const userUpdateValidationParameters = [
    check('username')
        .not()
        .isEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .custom((value) => !(/[ `!#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/.test(value)))
        .withMessage('Username must not contain any special caracters (. and - and _ and @ are allowed)')
        .custom((value) => (countSpecialCharacters(value)))
        .withMessage('There is maximum 4 special caracters allowed')
        .custom((value) => (countNumbers(value)))
        .withMessage('There is maximum 6 numbers in userame allowed'),
    check('email')
        .isEmail()
        .withMessage('Valid email adress is required'),
    check('activePassword')
        .isLength({ min: 8 })
        .withMessage('Active Pasword must be at least 8 characters long is required')
        .custom((value) => (/\d/.test(value)))
        .withMessage('Active Password must have at least 1 number')
        .custom((value) => (value.match(/[a-z]/)))
        .withMessage('Active Password must have at least 1 lower case character')
        .custom((value) => (value.match(/[A-Z]/)))
        .withMessage('Active Password must have at least 1 upper case character')
        .custom((value) => (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value)))
        .withMessage('Active Password must have at least 1 special character'),
    check('newPassword')
        .isLength({ min: 8 })
        .withMessage('New Pasword must be at least 8 characters long is required')
        .custom((value) => (/\d/.test(value)))
        .withMessage('New Password must have at least 1 number')
        .custom((value) => (value.match(/[a-z]/)))
        .withMessage('New Password must have at least 1 lower case character')
        .custom((value) => (value.match(/[A-Z]/)))
        .withMessage('New Password must have at least 1 upper case character')
        .custom((value) => (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value)))
        .withMessage('New Password must have at least 1 special character'),
    check('confirmNewPassword')
        .custom((value, { req }) => (value === req.body.newPassword))
        .withMessage('New Passwords do not match')
]

export const userSignInValidator = [
    check('username')
        .not()
        .isEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .custom((value) => !(/[ `!#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/.test(value)))
        .withMessage('Username must not contain any special caracters (. and - and _ and @ are allowed)')
        .custom((value) => (countSpecialCharacters(value)))
        .withMessage('There is maximum 4 special caracters allowed')
        .custom((value) => (countNumbers(value)))
        .withMessage('There is maximum 6 numbers in userame allowed'),
    check('email')
        .isEmail()
        .withMessage('Valid email adress is required'),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Pasword must be at least 8 characters long is required')
        .custom((value) => (/\d/.test(value)))
        .withMessage('Password must have at least 1 number')
        .custom((value) => (value.match(/[a-z]/)))
        .withMessage('Password must have at least 1 lower case character')
        .custom((value) => (value.match(/[A-Z]/)))
        .withMessage('Password must have at least 1 upper case character')
        .custom((value) => (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value)))
        .withMessage('Password must have at least 1 special character')

]

export const forgotPasswordValidator = [
    check('email')
        .isEmail()
        .withMessage('Valid email adress is required'),
]

export const resetPasswordValidator = [
    check('newPassword')
        .isLength({ min: 8 })
        .withMessage('New Pasword must be at least 8 characters long is required')
        .custom((value) => (/\d/.test(value)))
        .withMessage('New Password must have at least 1 number')
        .custom((value) => (value.match(/[a-z]/)))
        .withMessage('New Password must have at least 1 lower case character')
        .custom((value) => (value.match(/[A-Z]/)))
        .withMessage('New Password must have at least 1 upper case character')
        .custom((value) => (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value)))
        .withMessage('New Password must have at least 1 special character'),
    check('confirmNewPassword')
        .custom((value, { req }) => (value === req.body.newPassword))
        .withMessage('New Passwords do not match')

]

function countSpecialCharacters(s) {
    let a
    if (s !== undefined) {
        a = s.match(/[#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g)
    }

    if (a !== undefined) {
        if (a !== null && a.length > 4) {
            return false
        }
    }
    return true
}
function countNumbers(s) {
    let a
    if (s !== undefined) {
        a = s.replace(/[^0-9]/g, "")
    }

    if (a !== undefined) {
        if (a !== null && a.length > 6) {
            return false
        }
    }
    return true
}


function atLeastOneLowerChar(s) {
    let a
    if (s !== undefined) {
        a = s.match(/[a-z]/)

        if (a !== null && a.length > 1) {
            return true
        }
    }
    return false
}

function atLeastOneUpperChar(s) {
    let a
    if (s !== undefined) {
        a = s.match(/[A-Z]/)
        if (a !== null && a.length > 1) {
            return true
        }
    }
    return false
}