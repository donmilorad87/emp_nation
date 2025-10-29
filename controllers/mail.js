import hbs from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';

import dotenv from 'dotenv';
dotenv.config();
export const MailerSender = async (mailOptions, defaultLayout) => {

    let transporter = nodemailer.createTransport({

        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "djmyle@gmail.com",
            pass: "qera oyes hmlt dqcl",
        },
    },
        {
            // default message fields

            // sender info
            from: 'Empower Nation <empowernation@empowernation.com>',
            headers: {
                'X-Laziness-level': 9999 // just an example header, no need to use this
            }
        })

    const handlebarOptions = {
        viewEngine: {
            partialsDir: './templates/',
            layoutsDir: './templates/',
            defaultLayout: defaultLayout
        },
        viewPath: './templates/'
    }

    transporter.use('compile', hbs(handlebarOptions))

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            /* console.log(error)
             res.json({
               message: err.message
           })*/
            return error
        } else {
            /*
              res.json({
                          message: 'Email Send'
                      })
        
              console.log('Email sent: ' + info.response);
              */
            return info
        }
    })

}

