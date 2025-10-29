import './CallFrame.scss';

import React, { useEffect, useState, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { DailyAudio, DailyProvider } from '@daily-co/daily-react';

import { useParams } from 'react-router-dom';

import { roomUrlFromPageUrl, pageUrlFromRoomUrl } from './utils';
import TimeLeft from '../../components/TimeLeft/TimeLeft';
import HomeScreen from '../../components/HomeScreen/HomeScreen';
import Call from '../../components/Call/Call';
import Chat from '../../components/Chat/Chat';
import Tray from '../../components/Tray/Tray';
import HairCheck from '../../components/HairCheck/HairCheck';
import HairCheck2 from '../../components/HairCheck/HairCheck2';
import { ChatIcon, EmpowerNation, UserIcon } from './Icons';
import wavingHand from '../../assets/icons/wavingHand.svg';
/* We decide what UI to show to users based on the state of the app, which is dependent on the state of the call object. */
const STATE_IDLE = 'STATE_IDLE';
const STATE_CREATING = 'STATE_CREATING';
const STATE_JOINING = 'STATE_JOINING';
const STATE_JOINED = 'STATE_JOINED';
const STATE_LEAVING = 'STATE_LEAVING';
const STATE_ERROR = 'STATE_ERROR';
const STATE_HAIRCHECK = 'STATE_HAIRCHECK';
window.messageTimeout = null
window.messageTime = 0;
window.messageArrayForThread = []
window.threadId = null
window.transciptionMessage = ''
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import {
    setTranscriptMessages,
    setAssistantMessages,
    clearTranscriptMesages,
    clearAssistantMessages
} from "../../store/reducer";
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

export default function CallFrame({ isLogo }) {

    const loggedUser = useSelector(
        (state) => state.reducer.user
    );
    let token = loggedUser.token
    const location = useLocation();
    const isAiEnabled = loggedUser.room?.aichat ?? false
    const isTranscirptEnabled = loggedUser.room?.transcript ?? false

    const dispatch = useDispatch();


    const { room_name } = useParams();

    const [appState, setAppState] = useState(STATE_IDLE);
    const [roomUrl, setRoomUrl] = useState(null);
    const [roomName, setRoomName] = useState(null);
    const [callObject, setCallObject] = useState(null);
    const [apiError, setApiError] = useState(false);
    const [specialErrorCase, setSpecialErrorCase] = useState('');
    const [joinUrl, setJoinUrl] = useState(false)
    /*    const [transcriptMessage, setTranscriptMessage] = useState('') */
    const [closedChat, setClosedChat] = useState(false)
    const [startedCall, setStartedCall] = useState(false)

    const [isOwner, setIsOwner] = useState(false)

    const [showSettings, setShowSettings] = useState(false)
    const [top_header, setTopHeader] = useState(window.top_header)

    const [regularProvider, setRegularProvider] = useState(window.regular_provider)
    const [auto_join, setAutoJoin] = useState(window.auto_join)

    const [sessionName, setSessionName] = useState('')
    const [preSessionName, setPreSessionName] = useState('')
    const { logout } = useAuth();

    const threadIdentifier = window.provider_name + '|' + window.client_name
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
    };


    const createCall = useCallback(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const room_name = window.location.pathname.split('/').pop();




        setAppState(STATE_CREATING);

        const myHeaders = new Headers();
        if (token) myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "room_name": room_name
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/get_room_params`, requestOptions)
            .then((response) => {


                return response.json()
            })
            .then((result) => {

                if (result?.errorStack?.message === "jwt expired") {
                    handleLogout();
                }

                if (result.message === "Room not found") {
                    setApiError(true)
                    setSpecialErrorCase("Room not found")
                }

                window.roomer = result.room_url
            })
            .catch((error) => console.error(error));


        return window.roomer




    }, []);

    /*  const showOwnerPanel = () => {
         // Show the allow/deny buttons for anyone in the waiting room
         const buttons = document.getElementById('ownerKnockingButtons');
         buttons.classList.remove('dn');
     };
 
     const hideOwnerPanel = () => {
         // Hide the allow/deny buttons for anyone in the waiting room
         const buttons = document.getElementById('ownerKnockingButtons');
         buttons.classList.add('dn');
     };
  */
    const checkAccessLevel = async (callObject) => {


        // https://docs.daily.co/reference/daily-js/instance-methods/access-state
        const state = callObject.accessState();
        /* Access level could be:
         - lobby (must knock to enter)
         - full (allowed to join the call)
         - none (can't join)
        */

        return state.access.level ?? 'lobby';
    };
    const findVideoForParticipant = (sessionId) => {
        // Find the video element with a session id that matches
        const videos = document.getElementsByTagName('video');
        const participantVideo = Array.from(videos).filter(
            (v) => v.session_id === sessionId
        );
        if (participantVideo.length > 0) {
            return participantVideo[0];
        }
        return null;
    };

    /*    const findParticipantVideoFrame = () => {
   
       } */

    const addParticipantVideo = (participant) => {
        if (!participant) return;
        // If the participant is an owner, we'll put them up top; otherwise, in the guest container
        /* const videoContainer = findParticipantVideoFrame(participant.session_id)


        let vid = findVideoForParticipant(participant.session_id);
        // Only add the video if it's not already in the UI
        if (!vid && participant.video) {
            // Create video element, set attributes
            vid = document.createElement('video');
            vid.session_id = participant.session_id;
            vid.style.width = '100%';
            vid.autoplay = true;
            vid.muted = true;
            vid.playsInline = true;
            // Append video to container (either guest or owner section)
            videoContainer.appendChild(vid);
            // Set video track
            vid.srcObject = new MediaStream([participant.tracks.video.persistentTrack]);
        } */
        setAppState(STATE_JOINED)

    };


    const allowAccess = () => {

        // Retrieve list of waiting participants
        const waiting = obje.waitingParticipants();

        const waitList = Object.keys(waiting);
        // We'll let the whole list in to keep this functionality simple.
        // You could also add a button next to each name to let individual guests in and then have an "Accept all" and "Deny all" option to respond in one batch.
        waitList.forEach((id) => {
            obje.updateWaitingParticipant(id, {
                grantRequestedAccess: true,
            });
        });
        // You could also use callObject.updateWaitingParticipants(*) to let everyone in at once. The example above to is show the more common example of programmatically letting people in one at a time.
    };

    const denyAccess = () => {

        const waiting = obje.waitingParticipants();

        const waitList = Object.keys(waiting);
        // We'll deny the whole list to keep the UI simple
        waitList.forEach((id) => {
            obje.updateWaitingParticipant(id, {
                grantRequestedAccess: false,
            });
        });
    };




    const hideRejectedFromCallText = () => {
        // Hide message a knocking request was denied
        const guestDenied = document.getElementById('guestDenied');
        guestDenied.classList.add('dn');
    };

    const showRejectedFromCallText = () => {
        // Show message a knocking request was denied

        if (document.getElementById('infoJoinScreen')) {
            if (document.querySelector('#infoJoinScreen h1')) {
                document.querySelector('#infoJoinScreen h1').textContent = 'Your request to join has been denied'
            }
            if (document.querySelector('#infoJoinScreen p.wordBreak')) {
                document.querySelector('#infoJoinScreen p.wordBreak')?.remove()
            }
            if (document.querySelector('#infoJoinScreen p')) {
                document.querySelector('#infoJoinScreen p').textContent = 'The owner of the call will not let you enter this call. Click "Leave call" before knocking again.'
            }

        }


    };



    const hideWaitingRoomText = () => {
        // Show waiting room message after knocking


        if (document.getElementById('infoJoinScreen')) {
            if (document.querySelector('#infoJoinScreen h1')) {
                document.querySelector('#infoJoinScreen h1').textContent = 'You are in the waiting room.'
            }
            if (document.querySelector('#infoJoinScreen p.wordBreak')) {
                document.querySelector('#infoJoinScreen p.wordBreak')?.remove()
            }
            if (document.querySelector('#infoJoinScreen p')) {
                document.querySelector('#infoJoinScreen p').textContent = 'Owner of the call will be notified that you have requested to enter the room. Please wait owner response.'
            }

        }
    };
    const handleRejection = (e) => {
        logEvent(e);
        // The request to join (knocking) was rejected :(
        if (e.errorMsg === 'Join request rejected') {
            // Update UI so the guest knows their request was denied
            hideWaitingRoomText();
            showRejectedFromCallText();
        }
    };

    const handleParticipantUpdate = (e) => {

        if (callObject) {
            const level = checkAccessLevel(callObject);

            // Don't use this event for participants who are waiting to join
            if (level === 'lobby') return;

            // Don't use this event for the local participant
            const participant = e?.participant;
            if (!participant || participant.local) return;

            // In a complete video call app, you would listen for different remote participant updates (e.g. toggling video/audio).
            // For now, we'll just see if a video element exists for them and add it if not.
            const vid = findVideoForParticipant(participant.session_id);
            if (!vid) {
                // No video found for remote participant after update. Add one.
                console.log('Adding new video');
                addParticipantVideo(participant);
            }
        }

    };
    const logEvent = (e) => console.log('Daily event: ', e);

    const addWaitingParticipant = (e) => {

        const clickClackSound = new Audio('/airport_bell.mp3');

        clickClackSound.play().catch((error) => {
            console.error('Audio playback failed:', error);
        });

        let knockKnockList = document.createElement('div');
        knockKnockList.id = e.participant.id

        knockKnockList.className = 'knockKnockList';
        knockKnockList.style.height = `${document.querySelector('.callHeader') ? document.querySelector('.callHeader').offsetHeight + 'px' : 'auto'}`
        let innerJoinDiv = document.createElement('div');
        innerJoinDiv.dataset.userId = e.participant.id;

        let innerJoinDivSpan = document.createElement('h4');
        innerJoinDivSpan.innerHTML = `<b>${e.participant.name}</b> is requesting to join the call`;
        innerJoinDivSpan.className = 'innerJoinDivSpan';
        innerJoinDiv.appendChild(innerJoinDivSpan);

        let buttonContaner = document.createElement('div');
        buttonContaner.className = 'buttonContaner df jcc aic';

        let allowAccessButton = document.createElement('button');
        allowAccessButton.id = 'allowAccessButton';
        allowAccessButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="#EBEBEB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        allowAccessButton.addEventListener('click', allowAccess);



        let denyAccessButton = document.createElement('button');
        denyAccessButton.id = 'denyAccessButton';
        denyAccessButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="#EBEBEB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        denyAccessButton.addEventListener('click', denyAccess);

        buttonContaner.prepend(denyAccessButton);
        setTimeout(() => {
            buttonContaner.append(allowAccessButton);
        }, 10)

        innerJoinDiv.appendChild(buttonContaner);

        knockKnockList.appendChild(innerJoinDiv);


        document.body.appendChild(knockKnockList);

        setTimeout(() => {
            knockKnockList.style.right = '1rem'
        }, 1);
    };
    const updateWaitingParticipant = (e) => {
        logEvent(e);
        // Get the li of the waiting participant who was removed from the list
        // They would be "removed" whether they were accepted or rejected -- they're just not waiting anymore.
        const { id } = e.participant;
        const li = document.getElementById(id);
        // If the li exists, remove it from the list
        if (li) {
            li.remove();
        }
    };
    const addOwnerEvents = (callObject) => {
        callObject


            .on('participant-joined', logEvent)
            .on('participant-updated', handleParticipantUpdate)

            .on('waiting-participant-added', addWaitingParticipant)
            .on('waiting-participant-updated', logEvent)
            .on('waiting-participant-removed', updateWaitingParticipant)
            .on('error', logEvent);
    };
    /**
     * We've created a room, so let's start the hair check. We won't be joining the call yet.
     */
    const handleGuestJoined = (e) => {
        logEvent(e);
        // Update UI to show they're now in the waiting room
        // Request full access to the call (i.e. knock to enter)
        obje.requestAccess({ name: e?.participants?.local?.user_name });
    };

    const handleAccessStateUpdate = (e) => {

        // If the access level has changed to full, the knocking participant has been let in.
        if (e.access.level === 'full') {
            // Add the participant's video (it will only be added if it doesn't already exist)
            const { local } = obje.participants();
            addParticipantVideo(local);
            // Update messaging in UI
            hideWaitingRoomText();
        } else {
            logEvent(e);
        }
    };


    const addGuestEvents = (callObject) => {
        callObject
            .on('joined-meeting', handleGuestJoined)
            .on('left-meeting', logEvent)
            .on('participant-joined', logEvent)
            .on('participant-updated', handleParticipantUpdate)
            .on('error', handleRejection)
            .on('access-state-updated', handleAccessStateUpdate);
    };

    const startHairCheck = useCallback(async (url) => {

        console.log(url);

        let urlHelper = url
        let newCallObject


        if (typeof window.obje === 'undefined') {
            console.log(newCallObject, 'newCallObject');
            try {
                newCallObject = DailyIframe.createCallObject({
                    dailyConfig: {
                        proxyUrl: import.meta.env.VITE_APP_DAILY_PROXY
                    }
                });

            } catch (error) {
                window.obje.destroy()
                newCallObject = DailyIframe.createCallObject({
                    dailyConfig: {
                        proxyUrl: import.meta.env.VITE_APP_DAILY_PROXY
                    }
                });
            }

            window.obje = newCallObject

            setCallObject(newCallObject);
            let urlForToken
            let urlForTokenHelper
            console.log(urlHelper);

            if (urlHelper?.includes('roomUrl')) {
                console.log('krna');

                if (auto_join) {

                    setAppState(STATE_HAIRCHECK);

                    urlForToken = urlHelper.split('?roomUrl=')[1]
                    if (isLogo) {
                        urlForToken = urlForToken.split('&logo=')[0]
                    }
                    console.log(urlForToken);

                    setRoomName(urlForToken.slice(1))
                    urlForTokenHelper = import.meta.env.VITE_APP_DAILY_DOMAIN + urlForToken

                    /* addGuestEvents(newCallObject); */

                    window.roomUrler = urlForTokenHelper

                    console.log(urlForToken, urlForTokenHelper, 'sssssss2222');




                    const raw = JSON.stringify({
                        "properties": {
                            "room_name": urlForToken.slice(1)
                        }
                    });



                    await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/meeting-tokens`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: raw,
                    })
                        .then((response) => response.json())
                        .then(async (result) => {


                            try {


                                urlHelper = `${import.meta.env.VITE_APP_DAILY_DOMAIN}/${urlForToken.slice(1)}/?t=${result.token}`
                            } catch (e) {

                                console.error(e);
                            }
                        }).catch((error) => console.error(error));

                    console.log(urlHelper, 'asdsdasdasda2222333');

                    setRoomUrl(urlHelper);
                    window.obje = newCallObject
                    setCallObject(newCallObject);
                    setAppState(STATE_HAIRCHECK);


                    const newUrl = new URL(urlHelper)
                    const urlParams2 = new URLSearchParams(newUrl.search);

                    const token = urlParams2.get('t');
                    console.log(urlHelper, 'kkkrna');

                    window.autojoinurl = urlHelper
                    await newCallObject.preAuth({ url: urlHelper, token }); // add a meeting token here if your room is private
                    await newCallObject.startCamera();
                    history.pushState({}, 'Create Call', window.location.pathname);
                } else {
                    setAppState(STATE_HAIRCHECK);

                    urlForToken = urlHelper.split('?roomUrl=')[1]
                    if (isLogo) {
                        urlForToken = urlForToken.split('&logo=')[0]
                    }
                    console.log(urlForToken);

                    setRoomName(urlForToken.slice(1))
                    urlForTokenHelper = import.meta.env.VITE_APP_DAILY_DOMAIN + urlForToken

                    addGuestEvents(newCallObject);

                    window.roomUrler = urlForTokenHelper
                    console.log(urlForTokenHelper, "_____________________");

                    await newCallObject.preAuth({ userName: window.client_name, url: window.roomUrler });
                    await newCallObject.startCamera();
                }






            } else {

                console.log(urlHelper, '0909');

                urlForToken = urlHelper
                setIsOwner(true)

                newCallObject.startTranscription({
                    language: 'en-US',
                    model: 'meeting',
                    includeRawResponse: true
                })


                const newUrl0 = new URL(urlHelper.split('?t=')[0])

                setRoomName(newUrl0.pathname.slice(1))

                setJoinUrl(`${window.location.href}?roomUrl=${newUrl0.pathname}`)


                /* const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const raw = JSON.stringify({
                    "room_url": `${window.location.href}?roomUrl=${newUrl0.pathname}`,
                    "room_name": 'Kevin Bland'
                });

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/store_room_url`, requestOptions)
                    .then((response) => response.text())
                    .then((result) => console.log(result))
                    .catch((error) => console.error(error)); */

                addOwnerEvents(newCallObject);
                /*   showOwnerPanel() */
                window.roomUrler = urlHelper
                setRoomUrl(urlHelper);
                window.obje = newCallObject
                setCallObject(newCallObject);
                setAppState(STATE_HAIRCHECK);



                const newUrl = new URL(urlHelper)
                const urlParams2 = new URLSearchParams(newUrl.search);

                const token = urlParams2.get('t');


                await newCallObject.preAuth({ url: urlHelper, token }); // add a meeting token here if your room is private

                await newCallObject.startCamera();

                history.pushState({}, 'Create Call', window.location.pathname);

            }



        }

    }, []);

    const knockToTheRoom = async () => {

        const permissions = await checkAccessLevel(obje);
        console.log('kkk)_))', permissions);


        // If they're in the lobby, they need to knock
        if (permissions === 'lobby') {
            // Guests must call .join() before they can knock to enter the call
            joinCall()
        } else if (permissions === 'full') {
            // If the guest can join the call, it's probably not a private room.
            console.log('Guest can join the call.');
            obje.join({ url: window.autojoinurl, userName: window.client_name })

        } else {
            console.error('Something went wrong while joining.');
        }

    }




    /**
     * Once we pass the hair check, we can actually join the call.
     * We'll pass the username entered during Haircheck to .join().
     */
    const joinCall = useCallback((userName) => {

        obje.join({ url: window.roomUrler, userName })
        obje.on("app-message", (event) => {


        }).on("active-speaker-change", (event) => {



        }).on("transcription-message", (event) => {


        }).on("participant-updated", (event) => {


        }).on("track-stopped", (event) => {


            if (document.querySelector('.call video')) {
                let videos = document.querySelectorAll('.call video')
                videos.forEach((video) => {
                    if (video.dataset.sessionId === event.participant.session_id) {
                        if (event.type === 'video') {
                            let videoMute = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.5303 4.53033C20.8232 4.23744 20.8232 3.76256 20.5303 3.46967C20.2374 3.17678 19.7626 3.17678 19.4697 3.46967L14.6168 8.32252L14.6162 8.32164L6.43781 16.5H6.43934L3.46967 19.4697C3.17678 19.7626 3.17678 20.2374 3.46967 20.5303C3.76256 20.8232 4.23744 20.8232 4.53033 20.5303L8.56066 16.5H13C14.1046 16.5 15 15.6046 15 14.5V10.0607L20.5303 4.53033Z" fill="#f63135"></path><path d="M13.2949 7.52159C13.1987 7.50737 13.1002 7.5 13 7.5H5C3.89543 7.5 3 8.39543 3 9.5V14.5C3 15.3978 3.59155 16.1574 4.40614 16.4104L13.2949 7.52159Z" fill="#f63135"></path><path d="M16.5 10.9491C16.5 10.6634 16.6221 10.3914 16.8356 10.2017L19.3356 7.97943C19.9805 7.40618 21 7.86399 21 8.72684V15.2732C21 16.136 19.9805 16.5938 19.3356 16.0206L16.8356 13.7983C16.6221 13.6086 16.5 13.3366 16.5 13.0509V10.9491Z" fill="#f63135"></path></svg>'
                            let videoMuteIconContainer = video.parentElement.querySelector('.videoIcon')

                            videoMuteIconContainer.innerHTML = videoMute

                        } else if (event.type === 'audio') {
                            let muteAudioIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" ><path d="M12 3C13.5979 3 14.904 4.24928 14.9949 5.8244L9 11.8193V6C9 4.34315 10.3431 3 12 3Z" fill="#f63135"></path><path d="M15 10.0607L20.5303 4.53033C20.8232 4.23744 20.8232 3.76256 20.5303 3.46967C20.2374 3.17678 19.7626 3.17678 19.4697 3.46967L3.46967 19.4697C3.17678 19.7626 3.17678 20.2374 3.46967 20.5303C3.76256 20.8232 4.23744 20.8232 4.53033 20.5303L8.19557 16.8651C9.05938 17.5005 10.1108 17.8583 11.25 17.9654V20.25C11.25 20.6642 11.5858 21 12 21C12.4142 21 12.75 20.6642 12.75 20.25V17.9654C14.0989 17.8386 15.3247 17.3603 16.2617 16.4858C17.3784 15.4436 18 13.9175 18 12C18 11.5858 17.6642 11.25 17.25 11.25C16.8358 11.25 16.5 11.5858 16.5 12C16.5 13.5825 15.9966 14.6814 15.2383 15.3892C14.4713 16.105 13.3583 16.5 12 16.5C10.919 16.5 9.9933 16.2498 9.27382 15.7868L10.476 14.5846C10.9227 14.8486 11.4436 15 12 15C13.6569 15 15 13.6569 15 12V10.0607Z" fill="#f63135"></path><path d="M7.6111 13.2082C7.53881 12.8415 7.5 12.4394 7.5 12C7.5 11.5858 7.16421 11.25 6.75 11.25C6.33579 11.25 6 11.5858 6 12C6 12.8969 6.13599 13.7082 6.39503 14.4243L7.6111 13.2082Z" fill="#f63135"></path></svg>'
                            let muteIconContainer = video.parentElement.querySelector('.audioIcon')

                            muteIconContainer.innerHTML = muteAudioIcon

                        }
                    }
                })
            }

        }).on("track-started", (event) => {


            if (document.querySelector('.call video')) {
                let videos = document.querySelectorAll('.call video')
                videos.forEach((video) => {
                    if (video.dataset.sessionId === event.participant.session_id) {
                        if (event.type === 'video') {

                            video.parentElement.querySelector('.videoIcon').innerHTML = ''
                        } else if (event.type === 'audio') {
                            video.parentElement.querySelector('.audioIcon').innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3ZM7.5 12C7.5 11.5858 7.16421 11.25 6.75 11.25C6.33579 11.25 6 11.5858 6 12C6 13.9175 6.62158 15.4436 7.73826 16.4858C8.67527 17.3603 9.90114 17.8386 11.25 17.9654V20.25C11.25 20.6642 11.5858 21 12 21C12.4142 21 12.75 20.6642 12.75 20.25V17.9654C14.0989 17.8386 15.3247 17.3603 16.2617 16.4858C17.3784 15.4436 18 13.9175 18 12C18 11.5858 17.6642 11.25 17.25 11.25C16.8358 11.25 16.5 11.5858 16.5 12C16.5 13.5825 15.9966 14.6814 15.2383 15.3892C14.4713 16.105 13.3583 16.5 12 16.5C10.6417 16.5 9.52867 16.105 8.76174 15.3892C8.00342 14.6814 7.5 13.5825 7.5 12Z" fill="#01CE22"></path></svg>'


                        }
                    }
                })
            }

        })





    }, [callObject, roomUrl]);

    /**
     * Start leaving the current call.
     */
    const startLeavingCall = useCallback(async () => {
        console.log('meeeee');

        if (!callObject) return;
        console.log('meeeee222');
        // If we're in the error state, we've already "left", so just clean up
        if (appState === STATE_ERROR) {
            callObject.destroy().then(() => {
                setRoomUrl(null);
                setCallObject(null);
                setAppState(STATE_IDLE);

            });
        } else {
            /* This will trigger a `left-meeting` event, which in turn will trigger
            the full clean-up as seen in handleNewMeetingState() below. */
            setAppState(STATE_LEAVING);
            callObject.leave();

        }


        console.log('meeeee222333');
        if (isOwner) {



            console.log(token);


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

            await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/set_session_active_to_null`, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    console.log(result);

                }).then(() => {


                    dispatch(clearTranscriptMesages())
                    dispatch(clearAssistantMessages())
                    navigate(`/${window.location.pathname.slice(1)}`);

                }).then(() => {
                    window.location.reload();
                })
                .catch((error) => {
                    console.error(error)
                    window.location.reload();
                });


        } else {
            let innerDiv = document.createElement('div')
            innerDiv.className = 'innerDivLeaveCall'

            let masterDiv = document.createElement('div')

            let innerDivH2 = document.createElement('h2')
            innerDivH2.textContent = "👋"
            masterDiv.append(innerDivH2)

            let innerDivH1 = document.createElement('h1')
            innerDivH1.textContent = "You've Left The Call"
            masterDiv.append(innerDivH1)

            let innerDivP = document.createElement('p')
            innerDivP.textContent = "Have a nice day!"
            masterDiv.append(innerDivP)

            innerDiv.append(masterDiv)

            document.querySelector('#root').append(innerDiv)

            if (document.querySelector('.knockKnockList')) {
                document.querySelector('.knockKnockList').remove()
            }
        }

    }, [callObject, appState]);
    useEffect(() => {
        console.log('Executing function due to route change');
        window.shstarted = undefined
        if (window.obje) {
            window.obje.leave()
            setTimeout(() => {
                window.obje.destroy()
                window.obje = undefined
            }, 0)

        }
    }, [location])

    /**
     * If a room's already specified in the page's URL when the component mounts,
     * join the room.
     */
    useEffect(() => {
        const url = roomUrlFromPageUrl();
        console.log(url, window.roomer);

        if (url) {
            startHairCheck(url);
        }
    }, [startHairCheck]);

    /**
     * Update the page's URL to reflect the active call when roomUrl changes.
     */
    useEffect(() => {
        const pageUrl = pageUrlFromRoomUrl(roomUrl);
        if (pageUrl === window.location.href) return;
        window.history.replaceState(null, null, pageUrl);
    }, [roomUrl]);



    /**
     * Update app state based on reported meeting state changes.
     *
     * NOTE: Here we're showing how to completely clean up a call with destroy().
     * This isn't strictly necessary between join()s, but is good practice when
     * you know you'll be done with the call object for a while, and you're no
     * longer listening to its events.
     */



    useEffect(() => {

        if (!callObject) return;

        const events = ['joined-meeting', 'participant-joined', 'participant-left', 'left-meeting', 'error', 'camera-error', 'app-message'];

        async function handleNewMeetingState(data) {

            function createSessionName(data) {

                let participants = callObject.participants();
                let isOwnerOnline = false
                let keyOfTheOwner = ''
                let keyOfTheNotOwner = ''


                for (let key in participants) {
                    if (participants[key].owner) {
                        isOwnerOnline = true
                        keyOfTheOwner = key
                    } else {
                        keyOfTheNotOwner = key
                    }
                }
                console.log(participants, isOwnerOnline);
                if (isOwnerOnline) {
                    console.log(callObject.participantCounts().present === 2, callObject.participantCounts().present);
                    if (callObject.participantCounts().present < 2) {
                        setSessionName('')
                        setPreSessionName('')

                    } else if (callObject.participantCounts().present === 2) {
                        setPreSessionName(isLogo ? 'EN' : 'Session')
                        setSessionName(` with ${participants[keyOfTheOwner].user_name} And ${participants[keyOfTheNotOwner]?.user_name}`)
                    } else if (callObject.participantCounts().present > 2) {
                        setPreSessionName(isLogo ? 'EN' : 'Session')
                        setSessionName(` with ${participants[keyOfTheOwner].user_name} And guests`)
                    }



                } else {
                    setSessionName('')
                    setPreSessionName('')
                }


            }

            createSessionName(data)

            if (isTranscirptEnabled) {
                if (data) {
                    if (data.action === 'app-message') {
                        if (data.data) {
                            if (data.data.text !== '' && typeof data.data.text !== 'undefined') {
                                window.transciptionMessage += `${data.data.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'Provider' : 'Client'} said: ` + data.data.text + ' \n ';
                                if (callObject.participantCounts().present > 1) {
                                    if (callObject.participants().local.owner) {

                                        document.querySelector('.firstMesage')?.remove()


                                        dispatch(setTranscriptMessages({
                                            msg: `${data.data.text} `,
                                            name: `${data.data.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'Provider' : 'Client'} `,
                                            class: `${data.data.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'provider' : 'client'}`
                                        }));

                                        /*  setTranscriptMessage(
                                             {
                                                 msg: `${data.data.text} `,
                                                 name: `${data.data.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'Provider' : 'Client'} `,
                                                 class: `${data.data.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'provider' : 'client'}`
                                             }
                                         ) */

                                    }

                                }

                            }
                        }
                    }

                }
            }

            if (data) {
                if (data.action === 'app-message') {
                    if (data.data) {
                        if (data.data.text !== '' && typeof data.data.text !== 'undefined') {

                            if (callObject.participantCounts().present > 1) {
                                if (callObject.participants().local.owner) {


                                    await callObject.room().then(async (results) => {
                                        const messageData = {
                                            room_name: results.name,
                                            room_name_en: location.pathname.slice(1),
                                            session_id: callObject.meetingSessionSummary(),
                                            participant_id: data.data.session_id,
                                            room_id: results.id,
                                            timestamp: data.data.timestamp,
                                            duration_in_sec: data.data.duration_seconds.toString(),
                                            user_name: data.data.user_name,
                                            callclient_id: data.callClientId,
                                            message: data.data.text,
                                        };

                                        try {
                                            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/add_presisted_transcript_message`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify(messageData),
                                            });

                                            if (!response.ok) {
                                                throw new Error('Failed to send message');
                                            }

                                            const data = await response.json();
                                            console.log('Message saved:', data); // You can handle the response as needed
                                        } catch (error) {
                                            console.error('Error sending message:', error);
                                        }
                                    })

                                }

                            }

                        }
                    }
                }

            }

            switch (callObject.meetingState()) {
                case 'joined-meeting':
                    setAppState(STATE_JOINED);

                    break;
                case 'left-meeting':
                    callObject.destroy().then(() => {
                        setRoomUrl(null);
                        setCallObject(null);
                        setAppState(STATE_IDLE);
                    });
                    break;

                case 'error':
                    setAppState(STATE_ERROR);
                    break;
                default:
                    break;
            }


        }

        // Use initial state
        handleNewMeetingState();

        /*
         * Listen for changes in state.
         * We can't use the useDailyEvent hook (https://docs.daily.co/reference/daily-react/use-daily-event) for this
         * because right now, we're not inside a <DailyProvider/> (https://docs.daily.co/reference/daily-react/daily-provider)
         * context yet. We can't access the call object via daily-react just yet, but we will later in Call.js and HairCheck.js!
         */
        events.forEach((event) => {
            console.log('event1', event);

            return callObject.on(event, handleNewMeetingState)
        });

        // Stop listening for changes in state
        return () => {
            events.forEach((event) => {
                console.log('event2', event);

                return callObject.off(event, handleNewMeetingState)
            });
        };


    }, [callObject]);

    /**
     * Show the call UI if we're either joining, already joined, or have encountered
     * an error that is _not_ a room API error.
     */
    const showCall = !apiError && [STATE_JOINING, STATE_JOINED, STATE_ERROR].includes(appState);


    /* When there's no problems creating the room and startHairCheck() has been successfully called,
     * we can show the hair check UI. */
    const showHairCheck = !apiError && appState === STATE_HAIRCHECK;
    const toggleChat = () => {
        setClosedChat(!closedChat)
    }
    const showSettingsFunction = () => {
        setShowSettings(!showSettings)
    }

    /* const renderSessionName = () => {

       

        const isProviderOnline = false
        
        callObject.participants().local.owner ? setTopHeader('Provider') : setTopHeader('Client')
        return (
            <>
                  <span>
                    {isLogo ? (
                        <b> EN</b>
                    ) : (
                        <b> Session </b>
                    )}

                    {callObject.participantCounts().present > 1 ? (
                        
                    )}

                    {`- Session with ${window.provider_name} And ${window.client_name}`}</span>

            </>
        )
    } */

    const renderApp = () => {
        // If something goes wrong with creating the room.
        if (apiError) {
            return (
                <div className="signupForm singInForm mb1 g2rem">
                    <h1>Error</h1>
                    <p className='tal m0'>

                        {specialErrorCase ? (
                            <p className='tal m0'>
                                {specialErrorCase}
                            </p>
                        ) : (
                            <>
                                <p> Room could not be created. Check if your `.env` file is set up correctly. For more information, see the{' '}
                                </p>
                                <a href="https://github.com/daily-demos/custom-video-daily-react-hooks#readme">
                                    readme
                                </a>
                            </>
                        )

                        }

                    </p>
                </div>
            );
        }

        if (showHairCheck || showCall) {
            return (
                <DailyProvider callObject={callObject}>
                    {showHairCheck ? (
                        // No API errors? Let's check our hair then.
                        <HairCheck joinCall={joinCall} cancelCall={startLeavingCall} knockToTheRoom={knockToTheRoom} isOwner={isOwner} callObject={callObject} isLogo={isLogo} regularProvider={regularProvider} />
                    ) : (
                        // No API errors, we passed the hair check, and we've joined the call? Then show the call.
                        <>

                            {!top_header && (
                                <div className="df aic g1 callHeader">
                                    {isLogo ? (
                                        <EmpowerNation />
                                    ) : (
                                        <img src={wavingHand} alt="" />
                                    )}



                                    <>
                                        <span className='inCallHeader'>
                                            <b> {preSessionName}</b>


                                            {sessionName}
                                        </span>

                                    </>


                                    <div className='profileIcon' onClick={showSettingsFunction}>
                                        <UserIcon fillColor={'#3c2211'} />
                                    </div>

                                </div>
                            )}

                            <div className={`mainFrame ${closedChat ? 'closed' : ''}`}>


                                {/*  {startedCall && (
                                    <button type="button" onClick={toggleChat} className='toggleChatButton'>
                                        <ChatIcon fillColor='#fff' />
                                    </button>
                                )} */}
                                <div className={`callFrame ${top_header ? 'topHeader' : ''}`}>
                                    {!top_header && (
                                        <TimeLeft roomName={roomName} startedCall={startedCall} isOwner={isOwner} />
                                    )}


                                    <Call

                                        callObject={callObject}
                                        joinUrl={joinUrl}
                                        startedCall={startedCall}
                                        setStartedCall={setStartedCall}
                                        isOwner={isOwner}
                                        isAiEnabled={isAiEnabled}
                                        isTranscirptEnabled={isTranscirptEnabled}
                                        isLogo={isLogo}
                                        top_header={top_header}
                                        threadIdentifier={threadIdentifier}

                                    />

                                    <Tray leaveCall={startLeavingCall} showSettings={showSettings} setShowSettings={setShowSettings} />
                                </div>
                                {isOwner && (isAiEnabled || isTranscirptEnabled) && (
                                    <Chat

                                        callObject={callObject}
                                        isAiEnabled={isAiEnabled} isTranscirptEnabled={isTranscirptEnabled} threadIdentifier={threadIdentifier} />
                                )}
                                <HairCheck2 callObject={callObject} showSettings={showSettings} setShowSettings={setShowSettings} isOwner={isOwner} />
                            </div>

                            <DailyAudio />
                        </>
                    )
                    }
                </DailyProvider >
            );
        }

        // The default view is the HomeScreen, from where we start the demo.
        return <HomeScreen createCall={createCall} startHairCheck={startHairCheck} />;
    };

    return (
        <div className="app">
            <div className='callFrameNavigation'>    <Header /></div>

            {renderApp()}

            {/*  <div id="ownerKnockingButtons" className="dn">
                <h3>Waiting room list</h3>
                <ul id="knockingList"></ul>
                <hr />
                <p>
                    Wait for a guest to join the list before responding. If multiple
                    guests are waiting, your response will apply to everyone.
                </p>
                <h4>Respond to knocking</h4>
                <button id="allowAccessButton" onClick={allowAccess}>Allow access</button>
                <button id="denyAccessButton" onClick={denyAccess}>Deny guest access</button>
            </div> */}


        </div>
    );
}
