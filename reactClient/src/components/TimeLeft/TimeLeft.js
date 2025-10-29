import React, { useRef, useEffect, useState } from 'react';

import './TimeLeft.scss';
import {
    Clock
} from './Icons';

import { useSelector } from "react-redux";

export default function TimeLeft({ roomName, startedCall, isOwner }) {
    const loggedUser = useSelector(
        (state) => state.reducer.user
    );
    let token = loggedUser.token

    const formatWithLeadingZero = (num) => {
        return num < 10 ? `0${num}` : num.toString();
    }

    function formatTime(seconds) {
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${secs}`;
    }

    const updateTimer = () => {

        if (document.querySelector('.timeLeftText')) {


            const startDate = new Date(window.roomInfo);
            const currentDate = new Date();

            // Calculate the time difference in milliseconds
            const diffInMs = currentDate - startDate;

            // Convert milliseconds to seconds
            const diffInSeconds = Math.floor(diffInMs / 1000);

            // Calculate hours, minutes, and seconds
            const hours = Math.floor(diffInSeconds / 3600);
            const minutes = Math.floor((diffInSeconds % 3600) / 60);
            const seconds = diffInSeconds % 60;


            // Format time as hh:mm:ss (always 2 digits)
            /*   const formattedTime =
                  `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              console.log(formattedTime, hours, minutes, seconds, diffInSeconds); */

            /*  document.querySelector('.timeLeftText').innerHTML = formattedTime;
  */
            document.querySelector('.timeLeftText .hours').textContent = String(hours).padStart(2, '0');
            document.querySelector('.timeLeftText .minutes').textContent = String(minutes).padStart(2, '0');
            document.querySelector('.timeLeftText .seconds').textContent = String(seconds).padStart(2, '0');

            // Time difference condition checks
            if (diffInSeconds > 3600) {
                console.log("More than 60 minutes have passed.");

            } else if (diffInSeconds > 2700) {
                console.log("More than 45 minutes have passed.");
                document.querySelector('.timeLeft').classList.add('green');
                document.querySelector('.timeLeft').classList.remove('orange');
                document.querySelector('.billable').innerHTML = `<b>90837</b> - Individual Psychotherapy, 60 Min`
            } else if (diffInSeconds > 1800) {
                console.log("More than 30 minutes have passed.");
                document.querySelector('.timeLeft').classList.add('orange');
                document.querySelector('.timeLeft').classList.remove('lightBlue');
                document.querySelector('.billable').innerHTML = `<b>90834</b> - Individual Psychotherapy, 45 Min`
            } else if (diffInSeconds > 900) {
                console.log("More than 15 minutes have passed.");
                document.querySelector('.timeLeft').classList.add('lightBlue');
                document.querySelector('.timeLeft').classList.remove('gray');
                document.querySelector('.billable').innerHTML = `<b>90832</b> - Individual Psychotherapy, 30 Min`
            } else {
                document.querySelector('.timeLeft').classList.add('gray');
                document.querySelector('.billable').textContent = `Billable in ${formatTime(900 - diffInSeconds)}`
                console.log("Less than 15 minutes have passed.");
            }


            // Display the formatted time




        }

    };

    if (typeof window.roomInfo === 'undefined') {

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const raw = JSON.stringify({
            "room_name": window.location.pathname.slice(1)
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/get_room_session_active_from`, requestOptions)
            .then((response) => response.json())
            .then((results) => {
                try {



                    window.roomInfo = results.session_active_from


                    // Start the timer
                    updateTimer();
                    const intervalId = setInterval(updateTimer, 1000);


                    // Cleanup on unmount
                    return () => clearInterval(intervalId);


                } catch (e) {

                    console.error('Error creating room', e);
                }

            })
            .catch((error) => console.error(error));


    }





    return (
        <>
            {
                isOwner && (
                    <div className={`timeLeft ${startedCall ? '' : 'dn'}`}>
                        <div className='timeLeftInner'>
                            <div className='clockDiv'>
                                <Clock />
                                <div className='timeLeftText'>
                                    <div className='hours'></div>
                                    <div className='colon'>:</div>
                                    <div className='minutes'></div>
                                    <div className='colon'>:</div>
                                    <div className='seconds'></div>
                                </div>
                            </div>
                        </div>
                        <div className='billable'></div>
                    </div>
                )
            }
        </>


    );
};