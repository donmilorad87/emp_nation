import { useCallback, useState, useEffect } from 'react';
import { useAppMessage, useLocalSessionId, useParticipantProperty, useParticipantIds } from '@daily-co/daily-react';

import { Arrow } from '../Tray/Icons/index';
import { EmptyChat } from './Icons'
import './Chat.scss';

import markdownit from 'markdown-it'
import { getTimeNow } from '../../utility/date';

import {
  setTranscriptMessages,
  setAssistantMessages
} from "../../store/reducer";
import { useDispatch, useSelector } from "react-redux";

export default function Chat({ /* transcriptMessage, */ callObject, /* setTranscriptMessage, */ isAiEnabled, isTranscirptEnabled, threadIdentifier }) {
  console.log('chat rendered');

  const [messages, setMessages] = useState([]);
  const dispatch = useDispatch();
  /*   const [assistantMesages, setAssistantMessages] = useState([]); */
  /*   const [inputValue, setInputValue] = useState(''); */
  const localSessionId = useLocalSessionId();
  const username = useParticipantProperty(localSessionId, 'user_name');
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });

  const transcriptMessages = useSelector(
    (state) => state.reducer.transcriptMessages
  );
  const assistantMessages = useSelector(
    (state) => state.reducer.assistantMessages
  );

  /* const sendAppMessage = useAppMessage({
    onAppMessage: useCallback(
      (ev) =>
        setMessages((existingMessages) => {

          const result = existingMessages.filter((object) => object !== '');
          return [
            ...result,
            {
              msg: ev.data.msg,
              name: ev.data.name,
              class: ev.data.class,
            },
          ]
        }),
      [],
    ),
  }); */

  /*  useEffect(() => {
 
     if (
       transcriptMessage.class === 'assistant' ||
       transcriptMessage.class === 'assistant regular' ||
       transcriptMessage.class === 'assistant generateInterpretiveSummary' ||
       transcriptMessage.class === 'assistant treatmentPlan' ||
       transcriptMessage.class === 'assistant noSuggestion'
     ) {
       const result = assistantMesages.filter((object) => (object !== '' && (typeof object.msg !== 'undefined' && typeof object.name !== 'undefined')));
       setAssistantMessages([
         ...result,
         transcriptMessage,
       ]);
     } else {
       const result = messages.filter((object) => (object !== '' && (typeof object.msg !== 'undefined' && typeof object.name !== 'undefined')));
       setMessages([
         ...result,
         transcriptMessage,
       ]);
     }
 
 
   }, [transcriptMessage]);
  */
  /* const sendMessage = useCallback(
    (message) => {



      Send the message to all participants in the chat - this does not include ourselves!
       * See https://docs.daily.co/reference/daily-js/events/participant-events#app-message
      
      sendAppMessage(
        {
          msg: `${message} `,
          name: username ? `${username === callObject.participants().local.user_name && callObject.participants().local.owner ? 'Provider' : 'Client'} (${username})  ` : 'Guest',
          class: `${callObject.participants().local.owner ? 'provider' : 'client'}`
        },
        '*',
      );

      Since we don't receive our own messages, we will set our message in the messages array.
       * This way _we_ can also see what we wrote.
      
      setMessages([
        ...messages,
        {
          msg: `${message} `,
          name: username ? `${username === callObject.participants().local.user_name && callObject.participants().local.owner ? 'Provider' : 'Client'} (${username}) ` : 'Guest',
          class: `${callObject.participants().local.owner ? 'provider' : 'client'}`
        },
      ]);
    },
    [messages, sendAppMessage, username],
  ); */

  useEffect(() => {
    if (document.getElementById("transcript")) {
      let transcript = document.getElementById("transcript");
      transcript.scrollTop = transcript.scrollHeight;
    }


  }, [transcriptMessages]);

  useEffect(() => {
    if (document.getElementById("assistant")) {
      let assistant = document.getElementById("assistant");
      assistant.scrollTop = assistant.scrollHeight;
    }



  }, [assistantMessages]);

  /* const handleChange = (e) => {
    setInputValue(e.target.value);
  }; */

  /*   const handleSubmit = (e) => {
      e.preventDefault();
      if (!inputValue.trim()) return; // don't allow people to submit empty strings
      sendMessage(inputValue);
      setInputValue('');
    }; */
  /*   const submitToOpenAI = () => {
  
      if (isAiEnabled) {
        if (callObject.participants().local.owner === true) {
  
  
          fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/open-ai-answer${isAiEnabled ? '?aichat=on' : ''}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "question": document.getElementById('chatMessages').textContent
            }),
          })
            .then((response) => response.json())
            .then(async (result) => {
  
  
              const resultMesages = messages.filter((object) => (object !== '' && (typeof object.msg !== 'undefined' && typeof object.name !== 'undefined')));
              const md = markdownit();
              const resulter = md.render(result[0].message.content);
  
              setMessages([
                ...resultMesages,
                {
                  msg: resulter,
                  name: 'Assistant',
                  class: 'assistant'
                },
              ]);
  
            })
            .catch((error) => console.error(error))
            .finally(() => {
  
  
  
  
            })
  
  
  
        } else {
          console.log('only owner can submit to ai')
        }
      } else {
        console.log('assistant not available');
      }
  
  
  
  
  
    } */

  const toggleTabs = (e) => {

    let tabs = e.currentTarget
    tabs.parentElement.querySelector('.active').classList.remove('active')
    tabs.querySelector('.chatHeadingInnerDiv').classList.add('active')

    if (tabs.querySelector('.chatHeadingInnerDiv span').textContent === 'Transcripts') {
      document.getElementById('transcript').classList.remove('dn')
      document.getElementById('assistant').classList.add('dn')
    } else if (tabs.querySelector('.chatHeadingInnerDiv span').textContent === 'Assistant') {

      document.getElementById('assistant').classList.remove('dn')
      document.getElementById('transcript').classList.add('dn')
    }

  }

  const generateSummary = () => {
    if (isAiEnabled) {
      if (remoteParticipantIds.length > 0) {


        if (callObject.participants().local.owner) {
          window.transciptionMessage += "Provider completed an assessment, provide a suggested treatment plan";

          showLoadingAndDisableButtons()
          const raw = JSON.stringify({
            "threadId": window.threadId,
            "transciptionMessage": window.transciptionMessage
          });



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
                class: 'assistant treatmentPlan'

              }));
              /* setTranscriptMessage(
                {
                  msg: resulter,
                  name: 'Assistant',
                  class: 'assistant treatmentPlan'

                }
              ) */

            })
            .catch((error) => console.error(error))
            .finally(() => {
              hideLoadingAndEnableButtons()

            })

        }
      }
    } else {
      console.log('assistant not available');
    }

  }
  const showLoadingAndDisableButtons = () => {
    let chatLoader = document.querySelectorAll('.chatLoader')
    chatLoader.forEach((loader) => {
      loader.classList.remove('dn')
    })
    let transcript = document.getElementById("transcript");
    transcript.scrollTop = transcript.scrollHeight;
    let assistant = document.getElementById("assistant");
    assistant.scrollTop = assistant.scrollHeight;

    let generateSummaryButtonContainer = document.querySelectorAll('.generateSummaryButtonContainer button')
    generateSummaryButtonContainer.forEach((button) => {
      button.disabled = true
      button.style.opacity = '0.5'
      button.style.cursor = 'not-allowed'
    })
  }

  const hideLoadingAndEnableButtons = () => {
    let chatLoader = document.querySelectorAll('.chatLoader')
    chatLoader.forEach((loader) => {
      loader.classList.add('dn')
    })
    let transcript = document.getElementById("transcript");
    transcript.scrollTop = transcript.scrollHeight;
    let assistant = document.getElementById("assistant");
    assistant.scrollTop = assistant.scrollHeight;

    let generateSummaryButtonContainer = document.querySelectorAll('.generateSummaryButtonContainer button')
    generateSummaryButtonContainer.forEach((button) => {
      button.disabled = false
      button.style.opacity = '1'
      button.style.cursor = 'pointer'
    })

  }
  const sendMessageToThreadsApiAssistant = () => {
    if (isAiEnabled) {

      if (remoteParticipantIds.length > 0) {


        if (callObject.participants().local.owner) {

          showLoadingAndDisableButtons()

          const raw = JSON.stringify({
            "threadIdentifier": threadIdentifier,
            "room_name": new URL(window.roomer).pathname.slice(1)
          });

          fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/threads_api_assistant${isAiEnabled ? '?aichat=on' : ''}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: raw,
          })
            .then((response) => response.json())
            .then((response) => {
              console.log(response)


              const md = markdownit();


              const resulter = md.render(response.message);

              dispatch(setAssistantMessages({
                msg: resulter,
                name: 'Assistant',
                class: 'assistant generateInterpretiveSummary'
              }));
            })
            .catch((error) => console.error(error))
            .finally(() => {
              hideLoadingAndEnableButtons()
            })
        }
      }
    }
  }
  const sendMesageToThreadsApi = () => {
    if (isAiEnabled) {



      if (remoteParticipantIds.length > 0) {


        if (callObject.participants().local.owner) {


          showLoadingAndDisableButtons()


          const raw = JSON.stringify({

            "room_name": new URL(window.roomer).pathname.slice(1),
            "threadIdentifier": threadIdentifier,
            "transciptionMessage": window.transciptionMessage
          });

          fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/store_mesage${isAiEnabled ? '?aichat=on' : ''}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: raw,
          })
            .then((response) => response.json())
            .then(() => {

              window.transciptionMessage = '';
            })
            .catch((error) => console.error(error))
            .finally(() => {
              hideLoadingAndEnableButtons()

            })

        }
      }
    }
  }
  const generateInterpretiveSummary = () => {
    if (isAiEnabled) {
      if (remoteParticipantIds.length > 0) {


        if (callObject.participants().local.owner) {
          window.transciptionMessage += "Generate Interpretive Summary, ICD10 Codes, and Overall Rating";
          showLoadingAndDisableButtons()

          const raw = JSON.stringify({
            "threadId": window.threadId,
            "transciptionMessage": window.transciptionMessage
          });

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
                class: 'assistant generateInterpretiveSummary'
              }));
              /* setTranscriptMessage(
                {
                  msg: resulter,
                  name: 'Assistant',
                  class: 'assistant generateInterpretiveSummary'
                }
              ) */


            })
            .catch((error) => console.error(error))
            .finally(() => {
              hideLoadingAndEnableButtons()

            })

        }
      }
    } else {
      console.log('assistant not available');
    }

  }
  return (
    <aside className="chat">
      <div className='firstMesage'>
        <EmptyChat />
      </div>
      {/* <div className="w-100 df fdc open callInfo">
        <div>Client Name: John Thompson</div>
        <div>Last Assessment: TBD</div>
        <div>Next Assessment: TBD</div>
        <div>Diagnosis: TBD</div>
      </div> */}

      <ul className='chatHeading' >

        {
          isAiEnabled && (
            <li onClick={toggleTabs}>
              <div className='chatHeadingInnerDiv active' >
                <span>Assistant</span>
              </div>
            </li>
          )
        }
        {
          isTranscirptEnabled && (
            <li onClick={toggleTabs}>
              <div className='chatHeadingInnerDiv ' >
                <span>Transcripts</span>
              </div>
            </li>
          )
        }

      </ul>
      {
        isTranscirptEnabled && (
          <div id="transcript" className={`${isAiEnabled && isTranscirptEnabled ? 'dn' : isTranscirptEnabled ? '' : 'dn'}`}>

            <ul className="chat-messages" id="chatMessages">
              {transcriptMessages && transcriptMessages.map((message, index) => message.name && message.msg && (
                <li key={`message-${index}`} className={`chat-message w-100 ${message.class === 'provider' ? 'provider left' : 'client right'}`}>
                  <div className='innerChatDiv'>
                    <span className="chat-message-author">{message.name}</span>
                    <div className={`${message.class}`}>


                      <div className="innerChatMesage">
                        <p className="chat-message-body" dangerouslySetInnerHTML={{ __html: message.msg }} />
                        <span className='chatTime'>
                          {getTimeNow()}
                        </span>

                      </div>
                    </div>
                  </div>

                </li>
              ))}
              <li>
                <div className='w-100 df aic jcfs g0dot5rem dn chatLoader mt1'>

                  <div className='threeDots'>
                    <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                  </div>
                  <span>Assistant is typing, please check assistant tab...</span>
                </div>
              </li>
            </ul>
          </div>
        )
      }


      {isAiEnabled && (
        <div id="assistant">

          <ul className="chat-messages">
            {assistantMessages && assistantMessages.map((assistantMesage, index) => assistantMesage.name && assistantMesage.msg && (
              <li key={`message-${index}`} className={`chat-message ${assistantMesage.class}`}>
                <div className='innerChatDiv'>
                  <span className="chat-message-author">{assistantMesage.name}</span>
                  <div className={`${assistantMesage.class} ${assistantMesage.msg.trim() == '<p>No Suggestions</p>' ? 'noSuggestion' : ''}`}>
                    <div className="innerChatMesage">
                      <div>
                        <p className={`chat-message-body`} dangerouslySetInnerHTML={{ __html: assistantMesage.msg }} />
                        <span className='chatTime'>
                          {getTimeNow()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            <li>
              <div className='w-100 df aic jcfs g0dot5rem dn mt1 chatLoader'>

                <div className='threeDots'>
                  <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                </div>
                <span>Assistant...</span>
              </div>
            </li>
          </ul>
        </div>
      )}



      {/* <ul className='participants'>
        {
          Object.values(callObject._participants).map((participant, index) => participant.user_name && participant.networkThreshold && (
            <li key={`message-${index}`} data-id={participant.user_id} className='df aic jcsb'>
              <span className="chat-message-author">{participant.user_name}</span>:{' '}
              <span className="chat-message-body"> {participant.video} </span>
              <span className="chat-message-body"> {participant.audio} </span>
              <span className="chat-message-body"> {participant.networkThreshold} </span>
            </li>
          ))
        }
      </ul > */}
      {isAiEnabled && (
        <div className="add-message">
          {/*   <form className="chat-form dn" onSubmit={handleSubmit}>
          <input
            className="chat-input dn"
            type="text"
            placeholder="Type your message here.."
            value={inputValue}
            onChange={handleChange}
          />
          <button type="submit" className="chat-submit-button">
            <Arrow />
          </button>
        </form>
        <button type="button" className='dn' onClick={submitToOpenAI}>
          Submit question to assistant
        </button> */}

          <div className="generateSummaryButtonContainer">
            <button type="button" onClick={generateInterpretiveSummary}>
              Generate Interpretive Summary
            </button>
            <button type="button" onClick={generateSummary}>
              Generate Treatment Plan
            </button>

          </div>


          <div className="generateSummaryButtonContainer">
            <button type="button" onClick={sendMesageToThreadsApi}>
              Send to threads API
            </button>
            <button type="button" onClick={sendMessageToThreadsApiAssistant}>
              Send Messages To Assistant
            </button>
          </div>
        </div>
      )}

    </aside >
  ) /* : null */;
}
