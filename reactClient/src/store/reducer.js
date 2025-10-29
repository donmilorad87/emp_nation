import { createSlice } from '@reduxjs/toolkit'



const initialState = {
    user: {
        token: '',
        isAuth: false,
        user: {
            username: '',
            email: '',
            role: 0,
            twofactorauth: false
        }
    },
    transcriptMessages: [],
    assistantMessages: []
}

export const reducer = createSlice({
    name: 'reducer',
    initialState,
    reducers: {

        setUser: (state, action) => {
            state.user = action.payload;
        },
        setTranscriptMessages: (state, action) => {
            state.transcriptMessages.push(action.payload);
        },
        setAssistantMessages: (state, action) => {
            state.assistantMessages.push(action.payload);
        },
        clearTranscriptMesages: (state) => {
            state.transcriptMessages = [];
        },
        clearAssistantMessages: (state) => {
            state.assistantMessages = [];
        },
    },
})

export const {
    setUser,
    setTranscriptMessages,
    setAssistantMessages,
    clearTranscriptMesages,
    clearAssistantMessages
} = reducer.actions

export default reducer.reducer