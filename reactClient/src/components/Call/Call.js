import React, { useState, useEffect, useCallback } from 'react';
import {
  useParticipantIds,
  /*   useScreenShare, */
  useDailyEvent,
  useLocalSessionId,
  useActiveSpeakerId
} from '@daily-co/daily-react';

import './Call.scss';
import Tile from '../Tile/Tile';
import UserMediaError from '../UserMediaError/UserMediaError';
import markdownit from 'markdown-it'

import {
  HalfSplit,
  LeftSplit,
  RightSplit,
  InfoIcon
} from './Icons'
import {
  setTranscriptMessages,
  setAssistantMessages,
  clearTranscriptMesages,
  clearAssistantMessages
} from "../../store/reducer";
import { useDispatch, useSelector } from "react-redux";
export default function Call({ callObject, joinUrl, setStartedCall, startedCall, isOwner, isAiEnabled, isLogo, top_header, threadIdentifier }) {

  const dispatch = useDispatch();

  // Extract the pathname (e.g., /aria_aria)
  const pathname = window.location.href;

  const loggedUser = useSelector(
    (state) => state.reducer.user
  );
  let token = loggedUser.token

  /* If a participant runs into a getUserMedia() error, we need to warn them. */
  const [getUserMediaError, setGetUserMediaError] = useState(false);
  const activeSpeakerId = useActiveSpeakerId();
  const [switcher, setSwitcher] = useState(0);

  const showWaitingRoomText = () => {
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
  /* We can use the useDailyEvent() hook to listen for daily-js events. Here's a full list
   * of all events: https://docs.daily.co/reference/daily-js/events */
  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );





  /* This is for displaying remote participants: this includes other humans, but also screen shares. */
  /*   const { screens } = useScreenShare(); */
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });

  /* This is for displaying our self-view. */
  const localSessionId = useLocalSessionId();
  const isAlone = remoteParticipantIds.length < 1 /* || screens.length < 1 */;

  const [split, setSplit] = useState('half');
  useEffect(() => {
    if (remoteParticipantIds.length > 0) {
      setStartedCall(true)

      // Get the current date and time
      const localDate = new Date();

      // Get the timezone offset in minutes

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        "room_name": window.location.pathname.slice(1),
        "session_active_from": localDate.toISOString()
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/set_session_active`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          console.log(result)
          if (isOwner) {
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

                } catch (e) {

                  console.error('Error creating room', e);
                }

              })
              .catch((error) => console.error(error));
          }


        })
        .catch((error) => console.error(error));


      document.querySelector('#root .app')?.classList.add('withOthers')
      if (isAiEnabled) {
        if (typeof document.body.dataset.added === "undefined") {
          document.addEventListener("keyup", (event) => {
            if (remoteParticipantIds.length > 0) {
              if (callObject.participants().local.owner) {
                if (event.code === "KeyQ" && event.shiftKey === true) {

                  const raw = JSON.stringify({
                    "threadId": window.threadId,
                    "transciptionMessage": window.transciptionMessage
                  });
                  let chatLoader = document.querySelectorAll('.chatLoader')
                  chatLoader.forEach((loader) => {
                    loader.classList.remove('dn')
                  })
                  let transcript = document.getElementById("transcript");
                  transcript.scrollTop = transcript.scrollHeight;
                  let assistant = document.getElementById("assistant");
                  assistant.scrollTop = assistant.scrollHeight;

                  fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/create-thread${isAiEnabled ? '?aichat=on' : ''}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: raw,
                  })
                    .then((response) => response.json())
                    .then(async (result) => {
                      window.threadId = result.threadId

                      window.transciptionMessage = '';


                      const md = markdownit();


                      const resulter = md.render(result.message);
                      dispatch(setAssistantMessages({
                        msg: resulter,
                        name: 'Assistant',
                        class: resulter === '<p>No Suggestions</p>' ? "assistant noSuggestion" : 'assistant regular'
                      }));
                      /* setTranscriptMessage(
                        {
                          msg: resulter,
                          name: 'Assistant',
                          class: resulter === '<p>No Suggestions</p>' ? "assistant noSuggestion" : 'assistant regular'
                        }
                      ) */

                    })
                    .catch((error) => console.error(error))
                    .finally(() => {
                      chatLoader.forEach((loader) => {
                        loader.classList.add('dn')
                      })
                      let transcript = document.getElementById("transcript");
                      transcript.scrollTop = transcript.scrollHeight;
                      let assistant = document.getElementById("assistant");
                      assistant.scrollTop = assistant.scrollHeight;
                    })

                }
              }
            }

          });

          document.body.dataset.added = 1;
        }
      } else {
        console.log('assistant not available');
      }
    } else {
      document.querySelector('#root .app')?.classList.remove('withOthers')
    }
  }, [remoteParticipantIds])

  useEffect(() => {

    document.querySelector('#root .app')?.classList.add('in-call')
    if (callObject) {

      if (callObject.participants().local.owner === true) {

        callObject.startTranscription({
          language: 'en-US',
          model: 'meeting',
          includeRawResponse: true
        })

        async function getPersistedTranscripts(room_id, session_id) {
          try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/get_presisted_transcripts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ room_id, session_id }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'An error occurred while fetching transcripts.');
            }

            const messages = await response.json();
            console.log('Persisted Messages:', messages);
            return messages;
          } catch (error) {
            console.error('Error fetching persisted transcripts:', error.message);
            throw error;
          }
        }
        if (!window.stopAddingTranscripts) {
          callObject.room().then((data) => {

            window.stopAddingTranscripts = true
            let sessionId = callObject.meetingSessionSummary().id
            getPersistedTranscripts(data.id, sessionId)
              .then(messages => {
                console.log(messages);
                dispatch(clearTranscriptMesages())
                dispatch(clearAssistantMessages())
                messages.forEach((message) => {
                  console.log(message);



                  dispatch(setTranscriptMessages(
                    {
                      msg: `${message.message} `,
                      name: `${message.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'Provider' : 'Client'} `,
                      class: `${message.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'provider' : 'client'}`
                    }
                  ));

                  /*  setTranscriptMessage(
                     {
                       msg: `${message.message} `,
                       name: `${message.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'Provider' : 'Client'} `,
                       class: `${message.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'provider' : 'client'}`
                     }
                   ) */
                  document.querySelector('.firstMesage')?.remove()



                })

                /* setTranscriptMessage(
                           {
                             msg: `${data.data.text} `,
                             name: `${data.data.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'Provider' : 'Client'} `,
                             class: `${data.data.user_name === callObject.participants().local.user_name && callObject.participants().local.owner ? 'provider' : 'client'}`
                           }
                         ) */

              })
              .catch(error => {
                console.log(error);

              });
          })
        }



      } else {
        showWaitingRoomText()
      }
    }

  }, []);
  const handleClickIcon = (e) => {


    const svgs = e.currentTarget.parentElement.querySelectorAll('svg')
    svgs.forEach((element) => {

      element.setAttribute('fill', '#3F3F3F')

    });

    e.currentTarget.setAttribute('fill', '#fff')
    setSplit(e.currentTarget.dataset.split)

  }

  /*  const toggleCallInfo = () => {
     if (document.querySelector('.callInfo')) {
       document.querySelector('.callInfo').classList.toggle('close')
     }
   
   } */

  const copyRoomUrl = async () => {

    let text = document.querySelector('#joinUrlInput').value

    if (isLogo) {
      text = text + '&logo=en'
    }

    try {
      await navigator.clipboard.writeText(text);

      if (document.querySelector('.roomUrlCopyPointer')) {
        document.querySelector('.roomUrlCopyPointer').classList.remove('hidden')
        setTimeout(() => {
          document.querySelector('.roomUrlCopyPointer')?.classList.add('hidden')
        }, 10000)
      }

    } catch (err) {
      console.error('Failed to copy: ', err);
    }

  }

  const swtichCameras = (e) => {


    if (e.currentTarget.classList.contains('switchBorrower')) {
      if (remoteParticipantIds.length > 0 && remoteParticipantIds.length === 1) {
        let provider = document.querySelector('.tile-video.provider')
        let client = document.querySelector('.tile-video.client')


        if (provider && client) {


          if (switcher === 0) {
            console.log(top_header, window.top_header, switcher)
            provider.classList.remove('switchBorrower')
            client.classList.add('switchBorrower')
            provider.style.cssText = `width:100%; height:100%; top:0rem; left:0rem; z-index:8; position: absolute; ${top_header ? 'padding-top: 1rem;' : ''}`
            provider.querySelector('video').style.cssText = 'width:100%; height:100%;'
            client.style.cssText = `width:159px; height:${top_header ? 'calc(159px + 1rem);' : '159px'}; top:1rem; left:1rem; top:1rem; left:1rem; z-index:9; position: absolute;
            ${top_header ? 'padding-top: 1rem;' : ''}`
            client.querySelector('video').style.cssText = `width:159px; height:159px`

            setSwitcher(1)
          } else if (switcher === 1) {
            console.log(top_header, window.top_header, switcher)
            client.classList.remove('switchBorrower')
            provider.classList.add('switchBorrower')
            provider.style.cssText = `width:159px; height:${top_header ? 'calc(159px + 1rem);' : '159px'}; top:1rem; left:1rem; z-index:9;position: absolute; ${top_header ? 'padding-top: 1rem;' : ''}`
            provider.querySelector('video').style.cssText = `width:159px; height:159px;`
            client.style.cssText = `width:100%; height:100%; top:0rem; left:0rem;  top:0rem; left:0rem; z-index:8; position: absolute; 
            ${top_header ? 'padding-top: 1rem;' : ''}`
            client.querySelector('video').style.cssText = 'width:100%; height:100%;'

            setSwitcher(0)
          }

        }
      }
    }
  }

  const renderCallScreen = () => (
    <>
      {/* <div>Current speaker id: {activeSpeakerId ?? 'none'}</div>; */}


      <div className={`call ${split} ${remoteParticipantIds.length > 0 ? 'withParticipants' : ''}`}>
        {/* Your self view */}
        {localSessionId && (
          <Tile
            id={localSessionId}
            isLocal={true}
            isAlone={isAlone}
            isOwner={'provider'}
            me={true}
            clicker={swtichCameras}
            switcher={switcher}
            top_header={top_header}
          />
        )}
        {/* Videos of remote participants and screen shares */}
        {remoteParticipantIds.length > 0 /* || screens.length > 0 */ ? (
          <>
            {remoteParticipantIds.map((id) => (
              <Tile
                key={id}
                id={id}
                isOwner={`client ${top_header ? 'top_header' : ''}`}
                me={false}
                clicker={swtichCameras}
                switcher={switcher}
              />
            ))}
            {/*  {screens.map((screen) => (
            <Tile key={screen.screenId} id={screen.session_id} isScreenShare />
          ))} */}
          </>
        ) : (
          // When there are no remote participants or screen shares

          <div className="info-box " id="infoJoinScreen">
            <h1>Waiting for Client</h1>
            <p className="infoBoxP">Invite manually by sharing this link:</p>
            {
              isOwner && (
                <>
                  <button className='button js-textareacopybtn' type='button' onClick={copyRoomUrl}> Copy room URL </button>
                  <p className='hidden roomUrlCopyPointer'>Room url copied to clipboard</p>
                  <input type="hidden" id="joinUrlInput" value={pathname} />
                </>

              )
            }

          </div>
        )}
      </div>
    </>

  );

  return getUserMediaError ? <UserMediaError /> : renderCallScreen();
}
