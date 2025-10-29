
import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';
/* import morgan from 'morgan'; */
import { OpenAI } from 'openai';
/* import bodyParser from 'body-parser'; */

import { prisma } from './database/index.js';
import authRoutes from './routes/auth.js';

import jwt from 'jsonwebtoken';
import { error } from 'console';


import ollama from 'ollama';

//middleware

const app = express();
dotenv.config();

app.use(express.json());

let room_url_object = {};


const corsOptions = {
  origin: '*'
};

app.use(cors(corsOptions));

/* 
app.use(morgan('dev'))
app.use(bodyParser.json())

app.use(express.static('public')); //to access the files in public folder */

app.use('/api/rooms', authRoutes)

export const createRoom = async (req, res, prisma_) => {


  let room_name = req.body.room_name;
  if (!room_name) return res.status(400).send('Room name is required')
  /* 
    let token = req.headers.authorization.split('Bearer ')[1];
  
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log('JWT sign in token create room error', err)
        await prisma.token.delete({
          where: {
            id: token.id
          }
        }).then(() => {
          return res.status(400).json({
            error: 'Expired link for JWT sign in token create. Token removed.'
          })
        }).catch((err) => {
          return res.status(400).json({
            error: 'Expired link for JWT sign in token create. Error removing tokeng.'
          })
        })
  
      }
      try {
        const { id } = decoded
  
        //silence is golden
  
      } catch (error) {
        return res.status(400).json({
          error: 'Error reseting user password. Token removed because of expiration.'
        })
      }
  
    }) */

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

  fetch("https://api.daily.co/v1/rooms/", requestOptions)
    .then((response) => response.json())
    .then(async (result) => {
      console.log('landed22');

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
          /*  console.log(result, resp) */

          let room_url_client = new URL(result.url)

          const roomName = room_url_client.pathname;
          console.log(room_name, roomName);

          room_url_client = `${process.env.SERVER_FULL_ADDRESS}${room_name}?roomUrl=${roomName}`
          result.url = `${result.url}?t=${resp.token}`
          /*   console.log(result); */

          // Example usage
          const token = generateRandomToken();
          console.log('Random Token:', token);

          const salt = process.env.SALT_FOR_TOKEN

          const hashedToken = hashTokenWithSalt(token, salt);
          console.log('Random hashedToken:', prisma_.roomUrl);

          try {

            const user = await prisma_.user.findUnique({
              where: {
                username: room_name
              }
            })

            const upsertedRoomUrl = await prisma_.room.create({
              where: { room_name }, // `room_name` is the unique identifier

              data: {
                room_url: result.url,
                room_name: room_name,
                room_url_client: room_url_client,
                token: hashedToken,
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

          console.log(/* room_url, */ '123123123312');

          result.token = hashedToken;
          res.status(200).send(result)
        })
        .catch((error) => {
          res.status(400).send(error)
        });



    })
    .catch((error) => res.status(400).send(error));
}

app.post('/api/rooms', createRoom);

const getRoomsSessions = async (req, res) => {



  let token = req.headers.authorization.split('Bearer ')[1];

  if (!token) return res.status(400).json({ error: 'Token is required' })

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {

      return res.status(400).json({
        error: 'Expired link for JWT sign in token create. Token removed.1'
      })
    }
    const { id } = decoded

    let user = await prisma.user.findUnique({
      where: {
        id
      }
    })

    if (user) {

      let room = await prisma.room.findFirst({
        where: {
          user: {
            id
          }
        }
      })

      if (room) {

        let room_name = new URL(room.room_url.split('?t=')[0]).pathname.slice(1);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${process.env.DAILY_API_KEY}`);

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };
        fetch(`https://api.daily.co/v1/meetings?room=${room_name}`, requestOptions)
          .then((response) => response.json())
          .then((result) => {
            console.log(result);

            res.status(200).send(result)
          })
          .catch((error) => res.status(400).send(error));

        /* return res.status(200).json({
          room,
          room_name,
        }) */
      } else if (!room) {
        return res.status(400).json({
          "message": "User do not have created room"
        })
      }


    } else if (!user) {
      return res.status(400).json({
        "message": "User with that id is not existed in db."
      })
    }



  }).catch((err) => {
    return res.status(400).json({
      error: 'Expired link for JWT sign in token create. Error removing tokeng.2'
    })
  })

}
/* try {
  const { id } = decoded

  //silence is golden

} catch (error) {
  return res.status(400).json({
    error: 'Error reseting user password. Token removed because of expiration.'
  })
}

res.status(200).send({
  "room": room
}) */


app.get('/api/rooms/room_sesions', getRoomsSessions);

app.post('/api/rooms/get_room_params', async (req, res) => {
  console.log('zukor');

  try {
    const room_name = req.body.room_name;

    const room = await prisma.room.findFirst({
      where: {
        room_name: room_name
      },
    });
    if (room) {

      let token = req.headers.authorization?.split('Bearer ')[1];
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {

          if (err) {
            return res.status(400).json({
              error: 'JWT sign in token error',
              errorStack: err
            })

          }

          const { id } = decoded

          if (id) {

            const provider = await prisma.user.findUnique({
              where: {
                id: id,
                username: room_name
              },
            });

            if (provider) {
              return res.status(200).send({
                "room_url": room.room_url,
                "message": "User is Provider"
              })
            } else {
              return res.status(200).send({
                "room_url": room.room_url_client,
                "message": "User is not Provider"
              })
            }

          }

          return res.status(200).send({
            room_url: room.room_url,
          })

        })
      } else {
        return res.status(200).send({
          "room_url": room.room_url_client
        })
      }

    } else {
      return res.status(400).send({
        "message": "Room not found"
      })
    }

  } catch (error) {
    return res.status(400).send(error)
  }
})
app.post('/api/rooms/get_room_session_active_from', async (req, res) => {

  const room_name = req.body.room_name;

  if (!room_name) {
    return res.status(400).json({
      error: 'room_name is required'
    })
  }

  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(400).json({
      error: 'JWT sign in token not found'
    })
  }


  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {

      if (err) {
        return res.status(400).json({
          error: 'JWT sign in token error',
          errorStack: err
        })

      }

      const { id } = decoded

      if (id) {

        const user = await prisma.user.findUnique({
          where: {
            id: id
          },
        });
        console.log(user);

        if (user) {
          const room = await prisma.room.findFirst({
            where: {
              room_name: user.username
            },
          });

          if (room) {

            return res.status(200).send({
              "session_active_from": room.session_active_from
            })

          } else {
            return res.status(400).send({
              "message": "Room not found"
            })
          }
        } else if (!user) {
          return res.status(400).json({
            "message": "User with that id is not existed in db."
          })
        } else {
          return res.status(400).json({
            "message": "User with that id is not existed in db."
          })
        }





      }



    })
  }


});

app.post('/api/rooms/set_session_active_to_null', async (req, res) => {

  const room_name = req.body.room_name;

  if (!room_name) {
    return res.status(400).json({
      error: 'room_name is required'
    })
  }

  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(400).json({
      error: 'JWT sign in token not found'
    })
  }


  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {

      if (err) {
        return res.status(400).json({
          error: 'JWT sign in token error',
          errorStack: err
        })

      }

      const { id } = decoded
      console.log(id);

      if (id) {

        const user = await prisma.user.findUnique({
          where: {
            id: id
          },
        });

        if (user) {
          const room = await prisma.room.findFirst({
            where: {
              room_name: room_name
            },
          });

          if (room) {

            await prisma.room.update({
              where: {
                room_name: user.username
              },
              data: {
                session_active_from: ''
              }
            }).then(() => {
              return res.status(200).send({
                "message": "Session active from updated"
              })
            }).catch((error) => {
              return res.status(400).send({
                "message": "Error updating session active from",
                errorStack: error
              })
            })

          } else {
            return res.status(400).send({
              "message": "Room not found"
            })
          }
        } else if (!user) {
          return res.status(400).json({
            "message": "User with that id is not existed in db."
          })
        }





      }



    })
  }


});

app.post('/api/rooms/set_session_active', async (req, res) => {
  console.log('213123132123');

  try {
    const room_name = req.body.room_name;

    if (!room_name) return res.status(400).send({
      "message": "Room name is required"
    })

    const session_active_from = req.body.session_active_from;

    if (!session_active_from) return res.status(400).send({
      "message": "Session active from is required"
    })



    console.log(session_active_from);


    const room = await prisma.room.findFirst({
      where: {
        room_name: room_name
      },
    });

    if (room) {


      if ((room.session_active_from === '' || room.session_active_from === null)) {
        await prisma.room.update({
          where: {
            room_name: room_name
          },
          data: {
            session_active_from: session_active_from ?? ''
          }
        }).then(() => {
          return res.status(200).send({
            "message": "Session active from updated"
          })
        }).catch((error) => {
          return res.status(400).send({
            "message": "Error updating session active from",
            errorStack: error
          })
        })
      } else {
        return res.status(200).send({
          "message": "Session active from not updated because is allready setted"
        })
      }






    } else {
      return res.status(400).send({
        "message": "Room not found"
      })
    }












  } catch (error) {
    return res.status(400).send(error)
  }
})

app.post('/api/rooms/get_room_info', async (req, res) => {

  try {
    let room_name = req.body.room_name;
    let provider = req.body.provider;
    let token = req.body.token;

    if (room_name && token) {
      console.log('praseee');
      const room = await prisma.room.findFirst({
        where: {
          room_name: room_name,
          token: token,
        },
      });

      if (room && typeof room.id === 'bigint') {
        room.id = parseInt(room.id);
      }
      return res.status(200).send(room ?? "Room not found")
    } else if (room_name && !token && !provider) {
      console.log('ne praseee');
      const room = await prisma.room.findFirst({
        where: {
          room_name: room_name
        },
      });

      if (room && typeof room.id === 'bigint') {
        room.id = parseInt(room.id);
      }
      let returnObject = {
        room_url: room.room_url_client,

      }
      return res.status(200).send(returnObject ?? "Room not found")
    } else if (room_name && provider) {

      const room = await prisma.room.findFirst({
        where: {
          room_name: room_name
        },
      });

      if (room && typeof room.id === 'bigint') {
        room.id = parseInt(room.id);
      }
      let returnObject = {
        token: room.token,
      }

      return res.status(200).send(returnObject ?? "Room not found")

    } else if (!room_name && !token) {
      return res.status(400).send('room_name and token are required')

    }
  } catch (error) {
    return res.status(400).send(error)
  }



})

app.post('/api/rooms/get_join_urls', async (req, res) => {

  try {
    let room_name = req.body.room_name;
    if (!room_name) return res.status(400).send('room_name is required')

    const room = await prisma.room.findFirst({
      where: {
        room_name: room_name
      },
    });

    if (!room) return res.status(400).send('Room not found')

    if (room && typeof room.id === 'bigint') {
      room.id = parseInt(room.id);
    }

    let returnObject = {
      room_url_provider: `${process.env.SERVER_FULL_ADDRESS}${room_name}?token=${room.token}`,
      room_url_client: `${process.env.SERVER_FULL_ADDRESS}${room_name}`
    }


    return res.status(200).send(returnObject)

  } catch (error) {
    return res.status(400).send(error)
  }



})

app.post('/api/rooms/get_room_name', async (req, res) => {

  try {
    let room_name = req.body.room_name;
    if (!room_name) return res.status(400).send('room_name is required')

    const room = await prisma.room.findFirst({
      where: {
        room_name: room_name
      },
    });

    if (!room) return res.status(400).send('Room not found')

    if (room && typeof room.id === 'bigint') {
      room.id = parseInt(room.id);
    }
    let real_room_name = new URL(room.room_url.split('?t=')[0]).pathname.slice(1)

    return res.status(200).send({
      room_name: real_room_name
    })

  } catch (error) {
    return res.status(400).send(error)
  }



})

app.post('/api/rooms/threads_api_assistant', async (req, res) => {

  const aichat = req.query.aichat;

  if (aichat !== 'on') return res.status(400).send('AI Chat is disabled')


  let room_name = req.body.room_name;
  let threadIdentifier = req.body.threadIdentifier;



  if (!room_name) return res.status(400).send('room_name is required')
  if (!threadIdentifier) return res.status(400).send('threadIdentifier is required')



  try {
    const transcriptedMessages = await prisma.threadsMessages.findMany({
      where: {
        room_name,
        threadIdentifier
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    console.log(transcriptedMessages);

    if (transcriptedMessages.length > 0) {

      const messages = []

      transcriptedMessages.forEach((element) => {
        messages.push(element.message)
      });


      const quiestion = req.body.quiqestion;

      const response = await ollama.chat({
        model: 'llama3.2-vision:11b',
        messages: [{ role: 'user', content: messages.join('') + ' Please return answer in Markdown Syntax.' }]
      });

      /*   const country = Country.parse(JSON.parse(response.message.content));
        console.log(country); */
      return res.status(200).json({
        "message": response.message.content,
        "user": response.message.role
      })

    } else {
      return res.status(400).send({
        error: 'Thread messages not found',
        message: 'Thread messages not found'
      })
    }


  } catch (error) {
    return res.status(400).send({
      error: error,
      message: 'Error happend in prepparing Thread messages.'
    })

  }

})

app.post('/api/rooms/store_mesage', async (req, res) => {

  const aichat = req.query.aichat;

  if (aichat !== 'on') return res.status(400).send('AI Chat is disabled')


  let room_name = req.body.room_name;
  let threadIdentifier = req.body.threadIdentifier;
  let message = req.body.transciptionMessage;


  if (!room_name) return res.status(400).send('room_name is required')
  if (!threadIdentifier) return res.status(400).send('threadIdentifier is required')
  if (!message) return res.status(400).send('transciptionMessage is required')

  try {
    const transcriptedMessage = await prisma.threadsMessages.create({
      data: {
        room_name,
        threadIdentifier,
        message,
        createdAt: new Date()
      }
    });

    return res.status(200).send({
      thread: transcriptedMessage,
      message: 'Thread message created.'
    })
  } catch (error) {
    return res.status(400).send({
      error: error,
      message: 'Error creating thread message.'
    })

  }

})

app.get('/api/rooms/:room_name', (req, res) => {

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${process.env.DAILY_API_KEY}`);
  const room_name = req.params.room_name

  console.log(room_name);
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  fetch("https://api.daily.co/v1/rooms/" + room_name, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      console.log(result);

      res.status(200).send(result)
    })
    .catch((error) => res.status(400).send(error));
});

app.post('/api/rooms/meeting-tokens', (req, res) => {

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${process.env.DAILY_API_KEY}`);

  const raw = JSON.stringify(req.body);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  fetch("https://api.daily.co/v1/meeting-tokens", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      console.log(result)
      res.status(200).send(result)
    })
    .catch((error) => {
      res.status(400).send(error)
    });

});

app.post('/api/rooms/enable-transcriptions', (req, res) => {

  let deepgram_api = req.body.deepgram_api;
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${process.env.DAILY_API_KEY}`);
  myHeaders.append("Content-Type", "text/plain");

  const raw = {
    properties: {
      enable_transcription: `deepgram ${deepgram_api}`
    }
  }

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(raw),
    redirect: "follow"
  };

  fetch("https://api.daily.co/v1/", requestOptions)
    .then((response) => response.text())
    .then((result) => res.status(200).send(result))
    .catch((error) => res.status(400).send(error));

})

app.post('/api/rooms/delete', (req, res) => {

  let room_name = req.body.deepgram_api;

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${process.env.DAILY_API_KEY}`);

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow"
  };

  fetch(`https://api.daily.co/v1/rooms/${room_name}`, requestOptions)
    .then((response) => response.text())
    .then((result) => res.status(200).send(result))
    .catch((error) => res.status(400).send(error));
})

app.post('/api/rooms/open-ai-answer', async (req, res) => {

  const aichat = req.query.aichat;

  if (aichat !== 'on') return res.status(400).send('AI Chat is disabled')

  let question = req.body.question;
  const openai = new OpenAI();
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: question,
        },
      ],
    });


    res.status(200).send(completion.choices)
  } catch (error) {
    res.status(400).send(error)
  }

})

app.get('/api/rooms/retrive-assistant', async (req, res) => {
  const aichat = req.query.aichat;

  if (aichat !== 'on') return res.status(400).send('AI Chat is disabled')

  const openai = new OpenAI();
  const myAssistant = await openai.beta.assistants.retrieve(
    process.env.OPENAI_ASSISTANT_ID
  );


  res.status(200).send(myAssistant)
})

app.post('/api/rooms/create-thread', async (req, res) => {

  const aichat = req.query.aichat;

  if (aichat !== 'on') return res.status(400).send('AI Chat is disabled')

  const threadId = req.body.threadId;
  const transciptionMessage = req.body.transciptionMessage;

  if (typeof req.body.transciptionMessage === 'undefined' || !req.body.transciptionMessage || req.body.transciptionMessage === '') {
    return res.status(400).send('transciptionMessage is required')
  }

  const openai = new OpenAI();
  try {
    let thread
    if (!threadId) {
      thread = await openai.beta.threads.create();
    } else {
      thread = await openai.beta.threads.retrieve(
        threadId
      );
    }


    const message = await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "user",
        content: transciptionMessage
      }
    );

    const assistant = await openai.beta.assistants.retrieve(
      process.env.OPENAI_ASSISTANT_ID
    );
    console.log(thread);

    let run = await openai.beta.threads.runs.createAndPoll(
      thread.id,
      {
        assistant_id: assistant.id
      }
    );
    try {
      let answer
      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(run.thread_id);
        for (const message of messages.data.reverse()) {
          answer = `${message.content[0].text.value}`
          console.log(`${message.role} > ${message.content[0].text.value}`);

        }

      } else {
        console.log(run.status);
        res.status(200).send(run.status)
      }
      res.status(200).send({ message: answer, threadId: thread.id })
    } catch (error) {
      res.status(400).send(error)
    }
  } catch (error) {
    console.log(error);

  }


})

app.post('/api/rooms/get-transcriptions-messages', async (req, res) => {


  let message = req.body.message;
  let time = req.body.time;
  let callId = req.body.callId;
  /* 
    tempDB.push({
      message: message,
      time: time,
      callId: callId
    }) */



  console.log(message, time, callId);
  res.status(200).send(message, time, callId)
  /*  const openai = new OpenAI();
   const messageThread = await openai.beta.threads.create({
     messages: [
       {
         role: "user",
         content: "Hello, what is AI?"
       },
       {
         role: "user",
         content: "How does AI work? Explain it in simple terms.",
       },
     ],
   });
 
   console.log(messageThread);
   res.status(200).send(messageThread) */
})

app.post('/api/rooms/store_room_url', async (req, res) => {
  console.log(req.body);

  let room_url = req.body.room_url;
  let room_name = req.body.room_name;
  /*  const new_room_url = await prisma.room.upsert({
     where: {
       room_name: room_name, // Unique identifier for checking if it exists
     },
     update: {
       // Fields to update if it exists
       room_url: room_url,
     },
     create: {
       // Fields to create if it doesn't exist
       room_name: room_name,
       room_url: room_url,
     },
   }); */

  room_url_object = {
    "room_url": room_url,
    "room_name": room_name,
  }

  console.log('Upserted RoomUrl:', room_url_object);

  res.status(200).send(room_url_object)
  /*   await prisma.$disconnect(); */

})

app.post('/api/rooms/get_room_url', async (req, res) => {


  /*  let room_name = req.body.room_name;
   const room_url = await prisma.room.findUnique({
     where: {
       room_name: room_name
     }
   }); */

  console.log('Upserted RoomUrl:',);

  res.status(200).send(room_url_object)
  /*  await prisma.$disconnect(); */

})


app.post('/api/rooms/store_room_url', async (req, res) => {

  let room_name = req.body.room_name;

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${process.env.DAILY_API_KEY}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  fetch(`https://api.daily.co/v1/rooms/${room_name}/presence`, requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));


})

app.post('/api/rooms/add_presisted_transcript_message', async (req, res) => {

  const {
    room_name,
    room_name_en,
    session_id,
    participant_id,
    room_id,
    timestamp,
    duration_in_sec,
    user_name,
    callclient_id,
    message,
  } = req.body;


  try {

    console.log({
      room_name,
      session_id: session_id.id,
      participant_id,
      room_id,
      timestamp,
      duration_in_sec,
      user_name,
      callclient_id,
      message,
      room: {
        connect: {
          room_id: room_id,
        },
      }
    });


    const room = await prisma.room.findUnique({
      where: {
        room_name: room_name_en,
      },
    });

    if (room) {
      const newMessage = await prisma.PresistedMessages.create({
        data: {
          room_name,
          session_id: session_id.id,
          participant_id,
          room_id,
          timestamp,
          duration_in_sec,
          user_name,
          callclient_id,
          message,
          room: {
            connect: {
              id: room.id,
            },
          }
        },
      });

      res.status(200).json(newMessage);
    } else {
      res.status(400).json({ error: 'Room not found' });
    }

  } catch (error) {
    console.error('Error inserting message:', error);
    res.status(500).json({ error: 'Failed to insert message' });
  }


})

app.post('/api/rooms/get_presisted_transcripts', async (req, res) => {

  let room_id = req.body.room_id;

  if (!room_id) return res.status(400).json({ error: 'Room id is required' })

  let session_id = req.body.session_id;

  if (!session_id) return res.status(400).json({ error: 'Session id is required' })

  const messages = await prisma.PresistedMessages.findMany({
    where: {
      room_id: room_id,
      session_id: session_id
    }
  });

  res.status(200).json(messages)

})

app.post('/api/rooms/get_olama_answer2', async (req, res) => {

  const quiestion = req.body.quiqestion;

  const response = await ollama.chat({
    model: 'llama3.2-vision:11b',
    messages: [{ role: 'user', content: quiestion }]
  });

  /*   const country = Country.parse(JSON.parse(response.message.content));
    console.log(country); */
  return res.status(200).json({
    "olama_answer": response
  })

})

app.listen(process.env.SERVER_PORT, process.env.SERVER_IP, () => {
  console.log(`Listening on port ${process.env.SERVER_PORT}`);
});

export function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex'); // 32 bytes for a 64-character hex token
}

export function hashTokenWithSalt(token, salt) {
  return crypto.createHash('sha256').update(token + salt).digest('hex');
}