import './Username.scss';
import { useParticipantProperty, useDaily } from '@daily-co/daily-react';
import React, { useState, useEffect, useCallback } from 'react';
import { CameraOff, CameraOn, MicrophoneOff, MicrophoneOn } from './Icons';
export default function Username({ id, isLocal, me }) {
  const username = useParticipantProperty(id, 'user_name');
  const [participant, setParticipant] = useState({});

  const callObject = useDaily();
  useEffect(() => {

    if (!me) {

      window.particpant = callObject.participants()[id]
    } else {
      window.particpant = callObject.participants().local
    }

  }, [])



  return (
    <div className={`username ${window.particpant ? '' : 'dn'}`}>
      <div className="df aic iconContainers">
        <div className={`videoIcon ${window.particpant ? '' : 'dn'}`}>

        </div>
        <div className={`audioIcon ${window.particpant ? '' : 'dn'}`}>

        </div>

      </div>
      {username || id}
    </div>
  );
}
