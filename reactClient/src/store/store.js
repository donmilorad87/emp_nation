import { configureStore } from "@reduxjs/toolkit"
import reducer from './reducer'

import storage from "redux-persist/lib/storage";
import {
    persistReducer
} from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";

const presistConfig = {
    key: "root",
    version: 1,
    storage,
}

const combinedReducer = combineReducers({
    reducer: reducer
})

export const persistedReducer = persistReducer(presistConfig, combinedReducer)

export const store = configureStore({

    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
                // Ignore these paths in the state
                ignoredPaths: ['items.dates'],
            },
        }),

})

export const getRootState = () => store.getState;
export const getAppDispatch = () => store.dispatch;