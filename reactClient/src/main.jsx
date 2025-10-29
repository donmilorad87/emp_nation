import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import { Provider } from "react-redux";
import { store } from "./store/store";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import { RouterProvider } from "react-router-dom";
import { router } from "./App.jsx";

const presistor = persistStore(store);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={presistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
)
