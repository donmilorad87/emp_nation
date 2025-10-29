import cookie from 'js-cookie'


// set in cookie

export const setCookie = (key, value) => {
    if (typeof window !== 'undefined') {
        cookie.set(key, value, {
            expires: 1
        })
    }
}

// remove from cookie

export const removeCookie = (key) => {

    cookie.remove(key, {
        expires: 1
    })

}

// get from cookie such as stored token
// will be useful when we need to make request to server with token

export const getCookie = (key) => {

    return cookie.get(key) || false

}

// set in localstorage

export const setLocalStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value))
    }
}

// remove from localstorage

export const removeLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key)
    }
}

// authenticate user by passing data to cookie and localstorage during signin

/* export const authenticate = (response:User, next:void) => {
    console.log('AUTHENTICATE HELPER ON SIGNIN RESPONSE', response)
    setCookie('token', response.data.token)
    setLocalStorage('user', response.data.user)
    next()
} */

// access user info from localstorage

export const isAuth = () => {
    if (typeof window !== 'undefined') {
        const cookieChecked = getCookie('token')
        if (cookieChecked) {
            if (localStorage.getItem('user')) {
                return JSON.parse(localStorage.getItem('user') || '[]')
            } else {
                return false
            }
        }
    }
}

// logout

export const signout = (next) => {
    removeCookie('token')
    if (getCookie('G_AUTHUSER_H')) {
        removeCookie('G_AUTHUSER_H')
    }
    if (getCookie('G_ENABLED_IDPS')) {
        removeCookie('G_ENABLED_IDPS')
    }
    removeLocalStorage('user')
    next()
}

/* export const updateUser = (response, next) => {
    console.log('UPDATE USER IN LOCALSTORADGE helpers', response)
    if (typeof window !== 'undefined') {
        let auth = JSON.parse(localStorage.getItem('user'))
        auth = response.data
        localStorage.setItem('user', JSON.stringify(auth))
    }
    next()
} */

export const usernameChecker = (username) => {



    const errors = [];

    // Rule 1: Username must be at least 3 characters long
    if (username.length < 3) {
        errors.push("Username must be at least 3 characters long.");
    }

    // Rule 2: Username must not contain any special characters except . _ - @
    const invalidSpecialChars = username.match(/[^a-zA-Z0-9._@-]/);
    if (invalidSpecialChars) {
        errors.push("Username must not contain any special characters. (. and - and _ and @ are allowed)");
    }

    // Rule 3: There can be a maximum of 4 special characters (., -, _, @)
    const specialChars = username.match(/[-._@]/g);
    const specialCharCount = specialChars ? specialChars.length : 0;
    if (specialCharCount > 4) {
        errors.push("Username cannot contain more than 4 special characters.");
    }

    // Rule 4: There can be a maximum of 6 numbers in the username
    const numbers = username.match(/[0-9]/g);
    const numberCount = numbers ? numbers.length : 0;
    if (numberCount > 6) {
        errors.push("Username cannot contain more than 6 numbers.");
    }

    // Return all errors, or an empty array if no errors
    return errors;



}

const countSpecialCharacters = (s) => {
    if (typeof s !== 'string') return false; // Handle non-string or undefined inputs early

    // Regex to match special characters
    const specialChars = /[^\w\s.@-]/g;  // This matches any character that is NOT a word character (a-zA-Z0-9_), a space, dot, @, or hyphen

    const matches = s.match(specialChars); // Find all matches

    // If there are more than 4 special characters, return true
    return matches && matches.length > 4;
};

export const passwordChecker = (password) => {
    let array = []

    if (password.length < 8) {
        array.push('Pasword must be at least 8 characters long is required')
    }
    if (!/\d/.test(password)) {
        array.push('Password must have at least 1 number')
    }
    if (!password.match(/[a-z]/)) {
        array.push('Password must have at least 1 lower case character')
    }
    if (!password.match(/[A-Z]/)) {
        array.push('Password must have at least 1 upper case character')
    }
    if (!/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~_\:]/.test(password)) {
        array.push('Password must have at least 1 special character');
    }

    return array;

}

export const emailChecker = (email) => {
    const regex = /^(?=[a-zA-Z0-9@._%+-]{1,256}$)(?=\S)(?=\S{1,256}@)(?=\S+\.[a-zA-Z]{2,})(?!.*[^\x00-\x7F]+$)(?!.*[^a-zA-Z0-9@._%+-]).*$/;


    let array = []

    if (email.length < 1) {
        array.push('Email must be provided.');
    }
    if (!regex.test(String(email).toLowerCase())) {
        array.push('Email must be in e-mail format.');
    }

    return array;
}

export const confirmPasswordChecker = (x, y) => {
    let array = []

    if (x !== y) {
        array.push('Password does not match.')
    }
    if (x === '') {
        array.push('Confirm password is required.')
    }

    return array

}


export const iAgreeChecker = (x) => {

    let array = []

    if (!x) {
        array.push('You must agree Therms and Conditions')
    }

    return array

}