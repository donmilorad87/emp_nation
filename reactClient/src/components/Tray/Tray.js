import React, { useCallback, useState } from 'react';
import {
  /*   useAppMessage, */
  useAudioTrack,
  useDaily,
  useLocalSessionId,
  /*   useScreenShare, */
  useVideoTrack,

} from '@daily-co/daily-react';

import MeetingInformation from '../MeetingInformation/MeetingInformation';



import './Tray.scss';
import {
  CameraOn,
  Leave,
  CameraOff,
  MicrophoneOff,
  MicrophoneOn,
  Settings,
  /*   Screenshare, */
  Info,
  /*   ChatIcon,
    ChatHighlighted, */
} from './Icons';

export default function Tray({ leaveCall, showSettings, setShowSettings }) {
  const callObject = useDaily();
  /* const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare(); */

  const [showMeetingInformation, setShowMeetingInformation] = useState(false);
  /*   const [showChat, setShowChat] = useState(false); */
  /*   const [newChatMessage, setNewChatMessage] = useState(false); */

  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const mutedVideo = localVideo.isOff;
  const mutedAudio = localAudio.isOff;

  /* When a remote participant sends a message in the chat, we want to display a differently colored
   * chat icon in the Tray as a notification. By listening for the `"app-message"` event we'll know
   * when someone has sent a message. */
  /*   useAppMessage({
      onAppMessage: useCallback(() => {
        //Only light up the chat icon if the chat isn't already open.
        if (!showChat) {
          setNewChatMessage(true);
        }
      }, [showChat])
    }); */

  const showSettingsPopOver = () => {
    setShowSettings(!showSettings)
  }

  const toggleVideo = useCallback(() => {
    callObject.setLocalVideo(mutedVideo);
  }, [callObject, mutedVideo]);

  const toggleAudio = useCallback(() => {
    callObject.setLocalAudio(mutedAudio);
  }, [callObject, mutedAudio]);

  /*   const toggleScreenShare = () => isSharingScreen ? stopScreenShare() : startScreenShare();
   */
  const toggleMeetingInformation = () => {
    setShowMeetingInformation(!showMeetingInformation);
  };

  /*  const toggleChat = () => {
     setShowChat(!showChat);
     if (newChatMessage) {
       setNewChatMessage(!newChatMessage);
     }
   }; */

  return (





    <div className="tray">
      {showMeetingInformation && <MeetingInformation />}
      {/*  The chat messages 'live' in the <Chat/> component's state. We can't just remove the component */}
      {/*  from the DOM when hiding the chat, because that would cause us to lose that state. So we're */}
      {/*  choosing a slightly different approach of toggling the chat: always render the component, but only */}
      {/*  render its HTML when showChat is set to true. */}

      {/*   We're also passing down the toggleChat() function to the component, so we can open and close the chat */}
      {/*   from the chat UI and not just the Tray. */}

      <div className="tray-buttons-container">
        <div className="controls aic jcc">
          <button onClick={toggleMeetingInformation} type="button">
            <Info fillColor='#fff' />

          </button>
          <button onClick={toggleVideo} type="button">
            {mutedVideo ? <CameraOff /> : <CameraOn fillColor='#fff' />}

          </button>

          <button onClick={leaveCall} type="button" className="leaveCall">
            <Leave fillColor='#fff' />
          </button>

          <button onClick={toggleAudio} type="button">
            {mutedAudio ? <MicrophoneOff /> : <MicrophoneOn fillColor='#fff' />}

          </button>
          <button onClick={showSettingsPopOver} type="button">
            <Settings fillColor='#fff' />
          </button>

        </div>

      </div>
    </div>


  );
}
