import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,

} from "react-router-dom";

import { isObjectEmpty } from "./utility/json";

import CallFrame from "./pages/CallFrame/CallFrame";

import SignUp from "./pages/signup";
import Registration from "./pages/signup";
import ActivateAccount from "./pages/activateAccount";
import Signin from "./pages/signin";
import Login from "./pages/signin";

import NotLoggedIn from "./pages/notLoggedIn";

import Home from "./pages/home";

import { HomeLayout } from "./layout/homeLayout";
import { AuthLayout } from "./layout/authLayout";
import { ProtectedLayout } from "./layout/protectedLayout";
import RoomAnalytics from "./pages/roomAnalytics";
const getUserData = async () => {
  return new Promise((resolve) => {
    let user = localStorage.getItem("persist:root") ? JSON.parse(JSON.parse(localStorage.getItem("persist:root")).reducer).user : JSON.parse("{}");

    if (isObjectEmpty(user)) {
      user = {
        token: "",
        isAuth: false,
        user: {
          username: "guest",
          email: "guest",
          role: 0,
          twofactorauth: false

        }

      }
    }

    resolve(user);
  });
}
const url = new URL(window.location.href);

const params = new URLSearchParams(url.search);

const provider_name = params.get('provider_name');
if (provider_name) {
  window.provider_name = provider_name
} else {
  window.provider_name = 'Kevin Bland'
}

const client_name = params.get('client_name');
if (client_name) {
  window.client_name = client_name
} else {
  window.client_name = 'John Thompson'
}

const regular_provider = params.get('regular_provider');
if (regular_provider) {
  window.regular_provider = true
} else {
  window.regular_provider = false
}

const logo = params.get('logo');
if (logo === 'en') {
  window.logoState = true
}

const top_header = params.get('top_header');
if (top_header) {
  window.top_header = true
}
const auto_join = params.get('auto_join');
if (auto_join) {
  window.auto_join = true
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={<AuthLayout />}
      loader={() => getUserData()}
    >

      <Route element={<HomeLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/not-logged-in" element={<NotLoggedIn />} />

      </Route>

      <Route path="/:room_name" element={<CallFrame isLogo={window.logoState} />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/room-analytics" element={<RoomAnalytics />} />



      </Route>


    </Route>
  )
);


