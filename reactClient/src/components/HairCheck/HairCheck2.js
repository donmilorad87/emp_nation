import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
    useDevices,

    useDailyEvent,
    DailyVideo,
    useLocalSessionId,
    useParticipantProperty,
    useAudioTrack,
    useAudioLevelObserver,
    useVideoTrack,
} from '@daily-co/daily-react';
import UserMediaError from '../UserMediaError/UserMediaError';

import './HairCheck.scss';
import wavingHand from "../../assets/icons/wavingHand.svg";
import OK from '../../assets/icons/OK.svg';
import {
    CameraOn,
    CameraOff,
    MicrophoneOff,
    MicrophoneOn,
} from '../Tray/Icons';

import { useAuth } from "../../hooks/useAuth";
import { BackgroundSettings, NoiseReductionOff, NoiseReductionOn } from './icons';
import BackgroundEffect from '../BackgroundEffect';

export default function HairCheck2({ callObject, showSettings, setShowSettings, isOwner }) {
    const localSessionId = useLocalSessionId();
    const initialUsername = useParticipantProperty(localSessionId, 'user_name');
    const { currentCam, currentMic, currentSpeaker, microphones, speakers, cameras, setMicrophone, setCamera, setSpeaker } = useDevices();


    console.log('initiial username', initialUsername)

    const [getUserMediaError, setGetUserMediaError] = useState(false);

    const localVideo = useVideoTrack(localSessionId);
    const localAudio = useAudioTrack(localSessionId);
    const mutedVideo = localVideo.isOff;
    const mutedAudio = localAudio.isOff;

    const { user, logout } = useAuth();

    const volRef = useRef(null);
    const [noiseReducted, setNoiseReducted] = useState(false);
    const [processiongObject, setProcessingObject] = useState({});
    useEffect(() => {
        callObject.getInputSettings().then((data) => {
            console.log(data)
            setProcessingObject(data)

        })
    }, [])

    const [showCameraSettings, setShowCameraSettings] = useState(false);

    useAudioLevelObserver(
        localSessionId,
        useCallback((volume) => {
            if (volRef.current) {
                // this volume number will be between 0 and 1
                // give it a minimum scale of 0.15 to not completely disappear 👻
                volRef.current.style.transform = `scale(${Math.max(0.3, volume)})`;
            }

        }, [])
    );
    useAudioLevelObserver(
        localSessionId,
        useCallback((volume) => {
            // this volume number will be between 0 and 1
            // give it a minimum scale of 0.15 to not completely disappear 👻
            volRef.current.style.transform = `scale(${Math.max(0.15, volume)})`;
        }, [])
    );


    useDailyEvent(
        'camera-error',
        useCallback(() => {
            setGetUserMediaError(true);
        }, []),
    );



    const handleLogout = () => {
        logout();
    };

    const updateMicrophone = (e) => {
        setMicrophone(e.target.value);
    };

    const updateSpeakers = (e) => {
        setSpeaker(e.target.value);
    };

    const updateCamera = (e) => {
        setCamera(e.target.value);
    };
    const toggleVideo = useCallback(() => {
        callObject.setLocalVideo(mutedVideo);
    }, [callObject, mutedVideo]);

    const toggleAudio = useCallback(() => {
        callObject.setLocalAudio(mutedAudio);
    }, [callObject, mutedAudio]);

    const handleSetShowSettings = () => {

        setShowSettings(!showSettings)
    }
    const toogleShowCameraSettings = () => {
        setShowCameraSettings(!showCameraSettings);
    };
    const toggleNoiseReduction = (e) => {

        if (e.currentTarget.dataset.clicked === "0") {
            setNoiseReducted(true);

            setProcessingObject({
                ...processiongObject,
                audio: {
                    processor: {
                        type: 'noise-cancellation',
                    },
                },
            })
            e.currentTarget.dataset.clicked = "1"
        } else if (e.currentTarget.dataset.clicked === "1") {
            setNoiseReducted(false);
            setProcessingObject({
                ...processiongObject,
                audio: {
                    processor: {
                        type: 'none',
                    },
                },
            })
            e.currentTarget.dataset.clicked = "0"
        }

    };
    return getUserMediaError ? (

        < UserMediaError />
    ) : (
        <div className={`${showSettings ? 'show' : 'hide'} hair-check`}>
            <button type='button' onClick={handleSetShowSettings} className='close'> &#x2715; </button>
            <form >

                <div id='joinSecondStep'>


                    {/* Video preview */}
                    {localSessionId && <DailyVideo sessionId={localSessionId} mirror />}

                    <div className="df aic jcc g1rem mt2 fwnw">

                        <button onClick={toogleShowCameraSettings} data-opened="0" type="button" className="setUpCallButtons" title='Camera background settings'>
                            <BackgroundSettings fillColor="#49627D" />
                        </button>
                        <button onClick={toggleNoiseReduction} type="button" className="setUpCallButtons mla" data-clicked="0" title={`${noiseReducted ? "Noise reduction off" : "Noise reduction on"}`}>
                            {noiseReducted ? <NoiseReductionOn fillColor="#49627D" /> : <NoiseReductionOff fillColor="#f63135" />}

                        </button>

                        <button onClick={toggleVideo} type="button" className="setUpCallButtons">
                            {mutedVideo ? <CameraOff /> : <CameraOn fillColor="#49627D" />}

                        </button>
                        <button onClick={toggleAudio} type="button" className="setUpCallButtons">
                            {mutedAudio ? <MicrophoneOff /> : <MicrophoneOn fillColor="#49627D" />}

                        </button>

                        <div className="setUpCallButtons volume">
                            <div className="vol" ref={volRef} />
                            <style>{`
            .vol {
              border: 1px solid black;
              border-radius: 100%;
              height: 32px;
              transition: transform 0.1s ease;
              width: 32px;
                  aspect-ratio: 1;
            }
          `}</style>
                        </div>

                    </div>



                    {/* Microphone select */}
                    <div>
                        <label htmlFor="micOptions">Microphone:</label>
                        <select name="micOptions" id="micSelect" onChange={updateMicrophone} value={currentMic?.device?.deviceId}>
                            {microphones.map((mic) => (
                                <option key={`mic-${mic.device.deviceId}`} value={mic.device.deviceId}>
                                    {mic.device.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Speakers select */}
                    <div>
                        <label htmlFor="speakersOptions">Speakers:</label>
                        <select name="speakersOptions" id="speakersSelect" onChange={updateSpeakers} value={currentSpeaker?.device?.deviceId}>
                            {speakers.map((speaker) => (
                                <option key={`speaker-${speaker.device.deviceId}`} value={speaker.device.deviceId}>
                                    {speaker.device.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Camera select */}
                    <div>
                        <label htmlFor="cameraOptions">Camera:</label>
                        <select name="cameraOptions" id="cameraSelect" onChange={updateCamera} value={currentCam?.device?.deviceId}>
                            {cameras.map((camera) => (
                                <option key={`cam-${camera.device.deviceId}`} value={camera.device.deviceId}>
                                    {camera.device.label}
                                </option>
                            ))}
                        </select>
                        <BackgroundEffect callObject={callObject} showCameraSettings={showCameraSettings} processiongObject={processiongObject} setProcessingObject={setProcessingObject} />
                    </div>



                    {
                        isOwner && (
                            <button className="button mt1" onClick={handleLogout}>Logout</button>
                        )
                    }

                </div>


            </form>

        </div>

    );
}
