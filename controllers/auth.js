/* const User = require('../models/user')
const Token = require('../models/token') */
import jwt from 'jsonwebtoken';
import { expressjwt as jwtExpress } from 'express-jwt';
import { MailerSender } from './mail.js';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

import crypto from 'crypto';
import { MAIL } from '../constants/mail.js';
import { UESRS } from '../constants/user.js';
import axios from "axios";


import { prisma } from '../database/index.js';

import { generateRandomToken, hashTokenWithSalt } from '../index.js';


function hashPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex')
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return {
        salt: salt,
        hash: genHash
    }
}
function verifyPassword(password, hash, salt) {
    const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === checkHash
}

dotenv.config();
export const changeEmail = (username, id, email, activeEmail, callback) => {

    const token = jwt.sign({ id, email, username, activeEmail }, process.env.JWT_ACCOUNT_EDIT_EMAIL, { expiresIn: '10m' })

    let code = makeid(24)

    const tokenn = new Token({ token, code })
    tokenn.save((err, tokene) => {
        if (err) {
            console.log('Token could not be inserted in DB', err)
            return res.status(401).json({
                error: 'Error saving account token in database, Try sign up again.'
            })
        }

        var mailOptions = {
            to: email,
            subject: 'Changing email',
            template: 'changeEmail',
            context: {
                username: username,
                code,
                siteAdress: process.env.SERVER_FULL_ADDRESS
            }
        }



        User.findOne({ email }).exec((err, userr) => {

            if (userr) {

                return callback('Email is taken')
            } else {

                MailerSender(mailOptions, 'changeEmail.handlebars').then(() => {


                    console.log('Email sent.')
                    return callback(true)


                }).catch((err) => {

                    console.log('Email not sent.')
                    return callback(false)
                })
            }

        })

    })





}

export const singup = async (req, res) => {

    const { username, email, password, automaticActive } = req.body

    let user = await prisma.user.findUnique({ where: { email } })

    if (user) {
        return res.status(400).json({
            error: 'Email is taken'
        })
    }
    else {
        let user = await prisma.user.findUnique({ where: { username } })

        if (user) {
            return res.status(400).json({
                error: 'Username is taken'
            })
        } else {

            try {

                const hashedPassword = hashPassword(password);

                const result = await prisma.$transaction(async (prisma_) => {
                    const user = await prisma_.user.create({
                        data: {
                            username,
                            email,
                            password: hashedPassword.hash,  // Store hashed password
                            salt: hashedPassword.salt,
                            activated: true/* automaticActive ? automaticActive : false */,
                            usedPasswords: [hashedPassword.hash],  // Empty array initially
                            emailList: [email], // Initialize email list
                            usernameList: [username], // Initialize username list
                            role: UESRS.CLIENT, // Default role
                        },
                    }).catch((err) => {

                        return res.status(401).json({
                            error: 'Error saving user account in database, Try sign up again.',
                            errorStack: err
                        })
                    })

                    let room_name = username;

                    const myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/json");
                    myHeaders.append("Authorization", `Bearer ${process.env.DAILY_API_KEY}`);
                    const exp = Math.round(Date.now() / 1000) + 60 * 60 * 24 * 365;

                    const raw = JSON.stringify({
                        /*  "name": `${generateRandomString(16)}-${generateRandomString(8)}-${generateRandomString(16)}`, */
                        "privacy": "private",
                        "properties": {
                            "exp": exp,
                            "enable_screenshare": true,
                            "enable_live_captions_ui": true,
                            "enable_chat": true,
                            "enable_advanced_chat": true,
                            "enable_knocking": false,
                            "start_video_off": false,
                            "start_audio_off": false,
                            "enable_emoji_reactions": true,
                            "enable_pip_ui": true,
                            "enable_hand_raising": true,
                            "enable_network_ui": true,
                            "max_participants": null,
                            "enable_knocking": true,
                            "enable_recording": "cloud"
                        }
                    });

                    const requestOptions = {
                        method: "POST",
                        headers: myHeaders,
                        body: raw,
                        redirect: "follow"
                    };

                    await fetch("https://api.daily.co/v1/rooms/", requestOptions)
                        .then((response) => response.json())
                        .then(async (result) => {

                            const raw = JSON.stringify({
                                "properties": {
                                    "is_owner": true
                                }
                            });

                            const myHeaders = new Headers();
                            myHeaders.append("Content-Type", "application/json");
                            myHeaders.append("Authorization", `Bearer ${process.env.DAILY_API_KEY}`);

                            const requestOptions = {
                                method: "POST",
                                headers: myHeaders,
                                body: raw,
                                redirect: "follow"
                            };

                            await fetch("https://api.daily.co/v1/meeting-tokens", requestOptions)
                                .then((response) => response.json())
                                .then(async (resp) => {

                                    let room_url_client = new URL(result.url)

                                    const roomName = room_url_client.pathname;

                                    room_url_client = `${process.env.SERVER_FULL_ADDRESS}${room_name}?roomUrl=${roomName}`
                                    result.url = `${result.url}?t=${resp.token}`


                                    // Example usage
                                    const token = generateRandomToken();

                                    const salt = process.env.SALT_FOR_TOKEN

                                    const hashedToken = hashTokenWithSalt(token, salt);


                                    try {

                                        const upsertedRoomUrl = await prisma_.room.create({

                                            data: {
                                                room_id: result.id,
                                                room_url: result.url,
                                                room_name: room_name,
                                                room_url_client: room_url_client,
                                                token: hashedToken,
                                                provider_name: room_name,
                                                aichat: true,
                                                transcript: true,
                                                user: {
                                                    connect: {
                                                        id: user.id
                                                    }
                                                },
                                                createdAt: new Date(),
                                                updatedAt: new Date(),
                                            },
                                        });

                                        console.log('Upserted Room URL:', upsertedRoomUrl);
                                    } catch (error) {
                                        console.error('Error during upsert operation:', error);
                                    }

                                    result.token = hashedToken;
                                    res.status(200).send(result)
                                })
                                .catch((error) => {
                                    res.status(400).send(error)
                                });



                        })
                        .catch((error) => res.status(400).send(error))

                    /* if (!automaticActive) {
                        const token = jwt.sign({ username, email }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '2h' })
                        const code = hashPassword(password);

                        await prisma_.token.create({
                            data: {
                                token,
                                code: code.hash,
                                user: { connect: { id: user.id }, }
                            }
                        })
                            .catch((err) => {
                                console.log('Token could not be inserted in DB', err)
                                return res.status(401).json({
                                    error: 'Error saving account token in database, Try sign up again.'
                                })
                            })
                        var mailOptions = {
                            to: email,
                            subject: 'Account activation link',
                            template: 'activation',
                            context: {
                                username: username,
                                code: code.hash,
                                siteAdress: process.env.SERVER_FULL_ADDRESS
                            }
                        }

                        await MailerSender(mailOptions, MAIL.ACTIVATION).then(() => {

                            return res.status(200).json({
                                message: 'Activation email succesfuly sent.'
                            })

                        }).catch((err) => {
                            console.log(err)
                            return res.status(401).json({
                                message: 'Email not sent.'
                            })

                        })

                    } else {

                        var mailOptions = {
                            to: email,
                            subject: 'Your account is succesfully created',
                            template: 'account_creation',
                            context: {
                                username: username,
                                siteAdress: process.env.SERVER_FULL_ADDRESS
                            }
                        }

                        await MailerSender(mailOptions, MAIL.ACCOUNT_CREATED).then(() => {

                            return res.status(200).json({
                                message: 'Email for successfuly created account sended.'
                            })

                        }).catch((err) => {
                            console.log(err)
                            return res.status(401).json({
                                message: 'Email not sent.'
                            })

                        })


                    } */



                });

            } catch (error) {
                console.error('Error creating user:', error);
                return res.status(500).json({
                    error: 'Error creating user',
                });
            }

        }
    }
}
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!#@#$%^&*()_+';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const emailChangeVerification = (req, res) => {
    const { code } = req.body
    //console.log(token, 'krmkaaaaa')

    Token.findOneAndRemove({ code }).exec((err, token) => {
        console.log(token)
        if (token !== null) {
            jwt.verify(token.token, process.env.JWT_ACCOUNT_EDIT_EMAIL, function (err, decoded) {
                if (err) {
                    console.log('JWT verify account activation error', err)
                    return res.status(401).json({
                        error: 'Expired link, signup again'
                    })
                }
                const { id, activeEmail, email } = jwt.decode(token.token)

                //console.log(jwt.decode(token),'krmki') 
                User.findOne({ _id: id }, (err, user) => {
                    if (err || !user) {
                        return res.status(400).json({
                            error: 'User not found'
                        })
                    }
                    //console.log(user,'ovde smooooo33')

                    if (user.emailList.data.length === 0) {
                        user.emailList.data.push(activeEmail, email)
                    }
                    else {
                        user.emailList.data.push(email)
                    }
                    user.email = email
                    //ovde upis u listu email
                    //ovde upisivanje novog emaila

                    user.save((err, updatedUser) => {
                        if (err) {
                            console.log('User update error', err)

                            if (err.errmsg.includes('email')) {
                                return res.status(400).json({
                                    error: 'That email is taken'
                                })
                            }


                        } else {

                            updatedUser.hashed_password = undefined
                            updatedUser.salt = undefined
                            res.json(updatedUser)

                        }

                    })
                })



            })

        } else {
            return res.status(401).json({
                message: 'Something went wrong try again.'
            })
        }


    })


}

export const accountActivation = async (req, res) => {
    const { code } = req.body

    const token = await prisma.token.findFirst({
        where: {
            code
        }
    })

    if (token) {

        jwt.verify(token.token, process.env.JWT_ACCOUNT_ACTIVATION, async (err, decoded) => {
            if (err) {
                console.log('JWT verify account activation error', err)

                await prisma.token.delete({
                    where: {
                        id: token.id
                    }
                })

                return res.status(401).json({
                    error: 'Expired link, signup again'
                })
            }


            const { username, email } = decoded
            console.log(token, 'krmki', username);

            await prisma.user.update({
                where: {
                    id: token.user_id,
                    username,
                    email
                },
                data: {
                    activated: true
                }
            }).then(async () => {

                await prisma.token.delete({
                    where: {
                        id: token.id
                    }
                })

                return res.status(200).json({
                    message: 'Account successfully activated'
                })
            }).catch((err) => {
                console.log('User account activation error', err)
                return res.status(401).json({
                    error: 'Error activating account'
                })
            })
        })
    } else {
        return res.status(401).json({
            error: 'We can not find that code for token. Try again.'
        })
    }
}

export const signin = async (req, res) => {
    const { username, email, password } = req.body


    //check if user exist

    let user = null
    if (username === undefined && email !== undefined) {

        user = await prisma.user.findUnique({
            where: {
                email
            }
        })
    } else if (email === undefined && username !== undefined) {
        user = await prisma.user.findUnique({
            where: {
                username
            }
        })
    }

    if (user) {
        const hashedPassword = user.password
        const salt = user.salt

        if (verifyPassword(password, hashedPassword, salt)) {

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' })
            const { username, email, role, twofactorauth } = user

            const room = await prisma.room.findFirst({
                where: {
                    room_name: username
                }
            })

            return res.status(200).json({
                token,
                user: { username, email, role, twofactorauth },
                room: room
            })

        } else {
            return res.status(400).json({
                error: 'incorect credentials',/*  message: ''Provided password is not matchin the real password' */
            })
        }
    } else {
        return res.status(400).json({
            error: 'incorect credentials' /* `User with that does not exist` */
        })
    }
}

export const arrangeInfo = (req, res, next) => {
    User.findById({ _id: req.user._id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            })
        }
        const { username, email, password } = req.body

        console.log(req.body, 'ovde je user profile')
        console.log(user, 'ovde je user')
        let arre = []
        for (let [key, value] of Object.entries(req.body)) {
            if (value) {
                console.log(`${key}: ${value}`);
                arre.push(key)

            }

        }
        for (let i = 0; i < arre.length; i++) {

            console.log(user[arre[i]])
        }
        console.log('ovo je areere', arre)

        next()
    })
}

export const requireSignin = jwtExpress({
    secret: process.env.JWT_SECRET, //req.user._id
    algorithms: ['HS256']
})

export const adminMiddleware = (req, res, next) => {
    User.findById({ _id: req.user._id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            })
        }


        if (user.role !== 'admin') {
            return res.status(400).json({
                error: 'Admin recourse. Access Denided.'
            })
        }

        req.profile = user

        next()
    })
}
export const forgotPassword = async (req, res) => {
    const { email } = req.body
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })
    if (!user) {
        return res.status(400).json({
            error: 'User with that email does not exist'
        })
    } else {
        const token = jwt.sign({ username: user.username, email }, process.env.JWT_RESET2_PASSWORD, { expiresIn: '10m' })


        const code = hashPassword(email);

        await prisma.token.create({
            data: {
                token,
                code: code.hash,
                user: { connect: { id: user.id }, }
            }
        }).then(async (data) => {

            const mailOptions = {
                to: email,
                subject: 'Password reset link',
                template: 'passwordReset',
                context: {
                    username: user.username,
                    code: code.hash,
                    siteAdress: process.env.SERVER_FULL_ADDRESS
                }
            }

            await MailerSender(mailOptions, 'forgotPassword.handlebars').then(() => {

                res.json({
                    message: `Email has been sent to ${user.email}. Follow the instructions.`
                })

            }).catch((err) => {

                res.json({
                    message: 'Email not sent.'
                })
                console.log(err)
            })
        }).catch((err) => {
            return json.status(400).json({
                error: 'Database connection error on user password forgot request'
            })
        })

    }

}
export const resetPasswordActivation = async (req, res) => {

    const { code } = req.body
    const token = await prisma.token.findFirst({
        where: {
            code
        }
    })
    if (token) {

        jwt.verify(token.token, process.env.JWT_RESET2_PASSWORD, async (err, decoded) => {
            if (err) {
                console.log('JWT verify password activation error', err)
                await prisma.token.delete({
                    where: {
                        id: token.id
                    }
                }).then(() => {
                    return res.status(400).json({
                        error: 'Expired link for Password Reset. Token removed.'
                    })
                }).catch((err) => {
                    return res.status(400).json({
                        error: 'Expired link for Password Reset. Error removing tokeng.'
                    })
                })

            }
            try {
                const { username, email } = decoded
                console.log(token, 'krmki', username);

                await prisma.user.update({
                    where: {
                        id: token.user_id,
                        username,
                        email
                    },
                    data: {
                        activated: true
                    }
                }).then(async () => {

                    /*    await prisma.token.delete({
                           where: {
                               id: token.id
                           }
                       }) */

                    return res.status(200).json({
                        code: code,
                        user: {
                            username,
                            email
                        },
                        message: 'Password change succesfuly activated'
                    })
                }).catch((err) => {
                    console.log('User password activation request error', err)
                    return res.status(401).json({
                        error: 'Error password change activating'
                    })
                })
            } catch (error) {
                return res.status(400).json({
                    error: 'Error reseting user password. Token removed because of expiration.'
                })
            }


        })
    } else {
        return res.status(401).json({
            error: 'We can not find that code for token. Try again.'
        })
    }
}
export const resetPassword = async (req, res) => {
    const { code, newPassword } = req.body

    if (!code) return res.status(400).json({ error: 'Code for password reset is required' })

    const token = await prisma.token.findUnique({
        where: {
            code
        }
    })

    if (token) {
        jwt.verify(token.token, process.env.JWT_RESET2_PASSWORD, async function (err, decoded) {
            if (err) {
                await prisma.token.delete({
                    where: {
                        id: token.id
                    }
                }).then(() => {
                    return res.status(400).json({
                        error: 'Expired link for Password Reset. Token removed.'
                    })
                }).catch((err) => {
                    return res.status(400).json({
                        error: 'Expired link for Password Reset. Error removing tokeng.'
                    })
                })

            }
            try {
                const { username, email } = decoded

                await prisma.user.findUnique({
                    where: {
                        id: token.user_id,
                        username,
                        email
                    }
                }).then(async (user) => {
                    console.log(newPassword);

                    const hashedNewPassword = hashPassword(newPassword);

                    const result = await prisma.$transaction(async (prisma_) => {
                        await prisma_.user.update({
                            where: {
                                id: token.user_id,
                                username,
                                email
                            },
                            data: {
                                salt: hashedNewPassword.salt,
                                password: hashedNewPassword.hash
                            }
                        }).catch((err) => {
                            console.log(err)
                            return res.status(400).json({
                                error: 'Error reseting user password.'
                            })
                        })

                        await prisma.token.delete({
                            where: {
                                id: token.id
                            }
                        }).catch((err) => {
                            return res.status(400).json({
                                error: 'Error removing tokeng.'
                            })
                        })

                        var mailOptions = {
                            to: email,
                            subject: 'Password reset succesfuly',
                            template: 'password reseted',
                            context: {
                                username: username,
                            }
                        }

                        await MailerSender(mailOptions, MAIL.RESET_PASSWORD).then(() => {

                            console.log('Password succesfuly reset. Email sent')

                        }).catch((err) => {

                            return res.status(401).json({
                                message: 'Password not succesfuly reset. Email not sent.'
                            })

                        })

                    }).then(() => {
                        return res.status(200).json({
                            username: username,
                            message: 'Password reset successfuly. Token deleted. Email sent.'
                        })
                    }).catch((err) => {

                        return res.status(400).json({
                            error: 'Error reseting user password.'
                        })
                    })


                }).catch((err) => {
                    return res.status(400).json({
                        error: 'Error finding user. Try Again.'
                    })
                })
            } catch (error) {
                return res.status(400).json({
                    error: 'Error reseting user password. Token removed because of expiration.'
                })
            }


        })
    } else {
        return res.status(401).json({
            error: 'We can not find that code for token. Try again.'
        })
    }



}



export const googleLogin = async (req, res) => {
    const oauth_google = {
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_SECRET || "",
        endpoint: "https://www.googleapis.com/oauth2/v4/token",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
        scopes: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
    }

    const oauthRequest = {
        url: new URL("https://www.googleapis.com/oauth2/v4/token"),
        params: {
            client_id: oauth_google.client_id,
            client_secret: oauth_google.client_secret,
            code: req.body.code,
            grant_type: "authorization_code",
            redirect_uri: oauth_google.redirect_uri,
        },
    };
    const postData = new URLSearchParams(oauthRequest.params);

    try {
        const response = await axios.post(oauthRequest.url.toString(), postData);
        const { access_token, refresh_token, id_token } = response.data;

        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: oauth_google.client_id,
        });
        const payload = ticket.getPayload();

        const user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        })
        console.log(payload);

        const data = {
            username: payload.name.replaceAll(" ", "_"),
            email: payload.email,
            password: "asdqwE123~~",
            confirmPassword: "asdqwE123~~",
            automaticActive: true,
        };
        console.log(data);

        if (!user) {


            try {
                const response = await axios.post(`http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/api/rooms/singup`, data)
                    .then(async (response) => {
                        console.log('Signup successful:', response.data);

                        const data = {
                            email: payload.email,
                            password: "asdqwE123~~",
                            confirmPassword: "asdqwE123~~"
                        };
                        try {
                            const response = await axios.post(`http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/api/rooms/signin`, data); // Replace with your API's URL

                            return res.status(200).json(response.data);
                        } catch (error) {
                            console.error('Error during signin:', error.response?.data || error.message);
                        }

                    }); // Replace with your API's URL



            } catch (error) {
                console.error('Error during signup:', error.response?.data || error.message);
            }

        } else {
            try {
                const data = {
                    email: payload.email,
                    password: "asdqwE123~~",
                    confirmPassword: "asdqwE123~~"
                };
                const response = await axios.post(`http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/api/rooms/signin`, data); // Replace with your API's URL

                return res.status(200).json(response.data);
            } catch (error) {
                console.error('Error during signin2:', error.response?.data || error.message);
            }
        }


    } catch (error) {
        console.error("Error exchanging code for token:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error exchanging code for token" });
    }



}