import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  useDevices,
  useDaily,
  useDailyEvent,
  DailyVideo,
  useLocalSessionId,
  useParticipantProperty,
  useAudioTrack,
  useAudioLevelObserver,
  useVideoTrack,
} from '@daily-co/daily-react';
import UserMediaError from '../UserMediaError/UserMediaError';
import { BackgroundSettings, CircleArrowToright, NoiseReductionOff, NoiseReductionOn } from './icons';

import './HairCheck.scss';
import wavingHand from "../../assets/icons/wavingHand.svg";
import EmpowerNation from '../../assets/icons/EmpowerNation.svg';
import {
  CameraOn,
  CameraOff,
  MicrophoneOff,
  MicrophoneOn,
} from '../Tray/Icons';

import { useAuth } from "../../hooks/useAuth";
import { capitalizeFirstLetter } from '../../utility/string';
import BackgroundEffect from '../BackgroundEffect';

export default function HairCheck({ joinCall, cancelCall, isOwner, knockToTheRoom, callObject, isLogo, regularProvider }) {
  const localSessionId = useLocalSessionId();
  const initialUsername = useParticipantProperty(localSessionId, 'user_name');
  const { currentCam, currentMic, currentSpeaker, microphones, speakers, cameras, setMicrophone, setCamera, setSpeaker } = useDevices();
  const [showCameraSettings, setShowCameraSettings] = useState(false);
  const [clientEnteredName, setClientEnteredName] = useState(false);


  const [getUserMediaError, setGetUserMediaError] = useState(false);
  const [noiseReducted, setNoiseReducted] = useState(false);
  const [processiongObject, setProcessingObject] = useState({
    audio: {
      processor: {
        type: 'none',
      },
    },
    video: {
      processor: {
        type: 'none',
      },
    }
  });


  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const mutedVideo = localVideo.isOff;
  const mutedAudio = localAudio.isOff;
  const { user, logout } = useAuth();

  const volRef = useRef(null);
  console.log(user);

  const [username, setUsername] = useState(user.isAuth ? capitalizeFirstLetter(user.user.username) : '');

  user.isAuth && callObject.setUserName(capitalizeFirstLetter(user.user.username));

  useEffect(() => {
    if (callObject) {
      callObject.updateInputSettings(processiongObject)
    }
  }, [processiongObject])

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

  useEffect(() => {
    console.log('initialUsername', initialUsername);
  }, [initialUsername]);

  useEffect(() => {
    if (microphones.length === 0) {
      console.log('no microphones');

    }
    if (cameras.length === 0) {
      console.log('no cameras');
    }
  }, [getUserMediaError])

  useDailyEvent(
    'camera-error',
    useCallback((data) => {
      console.log('camera-error', data);

      setGetUserMediaError(true);
    }, []),
  );

  const handleChange = (e) => {
    console.log(e.currentTarget.value);

    setUsername(e.currentTarget.value);


    if (e.currentTarget.value !== "" && e.currentTarget.value.length > 2) {
      setClientEnteredName(true);
      callObject.setUserName(e.currentTarget.value);
    }

  };



  const handleJoin = (e) => {
    e.preventDefault();
    joinCall(username.trim());
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

  const handleLogout = () => {
    logout();
  };
  /* const joinNextStep = () => {


        let loaddialog = document.getElementById("loadingDialog");
        loaddialog.showModal();
  let joinFirstStep = document.getElementById("joinFirstStep");
  let joinSecondStep = document.getElementById("joinSecondStep");
  joinFirstStep.classList.add("dn");
  joinSecondStep.classList.remove("dn");
     loaddialog.close();
} */

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
    <UserMediaError />
  ) : (
    <div className='hair-check'>


      <form id="joinForm" onSubmit={handleJoin} >

        <div id='joinSecondStep'>

          <div className='tvClass'>
            {!isOwner && (
              <div id="joinFirstStep" className=''>

                {/* <div className='df jcc aic g2rem fdc maxW333px'>
            <img className="w60px" src={wavingHand} alt="" />
            <h1 className='welcomeNote'>Welcome to Your Video Call</h1>
            <p className='welcomeText'>Enter your name below, this is how you will be presented.</p>
          </div> */}

                {/* Username */}
                <div className='df fdc mb1 w-100'>
                  <label htmlFor="username" className='m0'>Your name:</label>
                  <input
                    name="username"
                    id='username'
                    type="text"
                    placeholder="Enter username"
                    onChange={handleChange}
                    value={username}

                  />

                  {/* Phone */}

                  {/*  <label className='dn' htmlFor="phone">Your name:</label>
            <input
              name="phone"
              id="phone"
              type="text"
              placeholder="Enter phone"
              onChange={handleChange}

            /> */}
                </div>
                {/*  
              <div className='button w-100 disabled' id="nextStepButton" type="button" onClick={joinNextStep} >
                Continue
              </div> 
            */
                }
              </div>
            )}
            {
              regularProvider && (
                <div className='df jcc aic fdc maxW333px mb1 mt1'>
                  {isLogo ? (
                    <img className="w60px" src={EmpowerNation} alt="" />
                  ) : (
                    <img className="w60px" src={wavingHand} alt="" />
                  )}

                  <h2 className='welcomeNote'>Before This Video Call</h2>
                  <p className='welcomeText'>Please make sure your camera and microphone are working, and your device is connected to a strong Wi-Fi network.</p>
                  <h2 className='welcomeNote mb0'>On this video call:</h2>
                  <p className='welcomeText'>{username}</p>
                </div>
              )
            }

            {/* Video preview */}
            {localSessionId && <DailyVideo sessionId={localSessionId} mirror />}

            <div className={`df aic jcr g1rem p0dot5rem`}>
              <div className='df g1rem mra'>
                <button onClick={toogleShowCameraSettings} data-opened="0" type="button" className="setUpCallButtons mra" title='Camera background settings'>
                  <BackgroundSettings fillColor="#49627D" />
                </button>
                <button onClick={toggleNoiseReduction} type="button" className="setUpCallButtons mla" data-clicked="0" title={`${noiseReducted ? "Noise reduction off" : "Noise reduction on"}`}>
                  {noiseReducted ? <NoiseReductionOn fillColor="#49627D" /> : <NoiseReductionOff fillColor="#f63135" />}

                </button>
              </div>
              <button onClick={toggleVideo} type="button" className="setUpCallButtons" title='Camera'>
                {mutedVideo ? <CameraOff /> : <CameraOn fillColor="#49627D" />}

              </button>
              <button onClick={toggleAudio} type="button" className="setUpCallButtons" title='Microphone'>
                {mutedAudio ? <MicrophoneOff /> : <MicrophoneOn fillColor="#49627D" />}

              </button>


              <div className="setUpCallButtons">
                <div className="vol" ref={volRef} />

              </div>

            </div>
          </div>
          <div className='innerTvClass'>


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
                ))}0
              </select>
              {/*  <input type="range" min={0} max={1} step={0.01} value={cameraBlur} onInput={blurCamera} /> */}
              <BackgroundEffect callObject={callObject} showCameraSettings={showCameraSettings} processiongObject={processiongObject}
                setProcessingObject={setProcessingObject} />
            </div>
            <div className='df aic jcc fdc g1rem'>

              {!isOwner && (
                <button className="button" type="button" onClick={knockToTheRoom} disabled={clientEnteredName ? false : true}> Request to join</button>
              )}
              {isOwner && (
                <button onClick={handleJoin} className="button" type="submit">
                  I&apos;m Ready to Join <CircleArrowToright fillColor="white" />
                </button>
              )}

              {/* <button onClick={cancelCall} className="button hollow" type="button">
              Leave
            </button> */}
              {/*   {isOwner && (
                <button className="button" onClick={handleLogout}>Logout</button>
              )} */}
            </div>
          </div>
        </div>


      </form>
    </div>

  );
}
