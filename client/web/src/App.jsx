import "./styles/global.scss";

import Home from "./pages/screen-page/screen/screen.jsx";
import Login from "./pages/screen-page/login/login.jsx";
import AdminRegistration from "./Accounts/Admin/admin-registration/admin.jsx";
import DisplayAccount from "./Accounts/Admin/admin-accounts/accounts.jsx";
import UserRegistration from "./Accounts/Users/user-registration/user.jsx";
import UserAccount from "./Accounts/Users/user-accounts/userAccounts.jsx";
import Report from "./pages/home-page/report/report.jsx";
import Dashboard from "./pages/home-page/dashboard/dashboard";
import ViewReports from "./pages/home-page/process-report/view-report/view";
import OngoingReports from "./pages/home-page/process-report/contact-user/ongoing-process.jsx";

import { API_URL } from "./constants.js";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import { Screen, Layout } from "./layout/layout.jsx";
import Responder from "./Accounts/Responder/responder-registration/responder-register.jsx";
import ResponderAccounts from "./Accounts/Responder/responder-accounts/responder-display";

import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles


function App() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  const [error, setError] = useState(null);

  axios.defaults.baseURL = "http://192.168.18.42:8080/admin/auth";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, messagesResponse] = await Promise.all([
          axios.get(`/user/getUser `),
          axios.get(`/user/messages`),
        ]);

        setUsers(usersResponse.data.users);
        setMessages(messagesResponse.data.messages);
      } catch (error) {
        setError("Error fetching data");
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Screen />,
      children: [
        {
          path: "/",
          element: <Home />,
        },

        {
          path: "/login",
          element: <Login users={users} />,
        },
        {
          path: "/admin/registration",
          element: <AdminRegistration />,
        },
        {
          path: "/admin/accounts",
          element: <DisplayAccount />,
        },
        {
          path: "/user/registration",
          element: <UserRegistration />,
        },
        {
          path: "/user/accounts",
          element: <UserAccount users={users} />,
        },
        {
          path: "/admin/responder/registration",
          element: <Responder />,
        },
        {
          path: "admin/responder/accounts",
          element: <ResponderAccounts />,
        },
      ],
    },
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/home/dashboard",
          element: <Dashboard users={users} />,
        },
        {
          path: "/home/report",
          element: <Report users={users} messages={messages} />,
        },
        {
          path: "/home/report/:id",
          element: <ViewReports />,
        },
        {
          path: "/home/report/in-progress/:id",
          element: <OngoingReports />,
        },
      ],
    },
  ]);

  return (
    <>
    
        <RouterProvider router={router} />
        <ToastContainer 
        position="top-right" />
     
    </>
  );
}

export default App;
