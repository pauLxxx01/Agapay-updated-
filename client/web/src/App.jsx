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
import Announcement from "./pages/home-page/announcement/announcement.jsx";
import History from "./pages/home-page/history/history.jsx";
import Responder from "./pages/home-page/responder/responder.jsx";
import ViewModal from './components/viewModal/viewModal.jsx';
import AccountCatagory from "./pages/home-page/accounts/accounts.jsx";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import { Screen, Layout } from "./layout/layout.jsx";
import ResponderRegister from "./Accounts/Responder/responder-registration/responder-register.jsx";
import ResponderAccounts from "./Accounts/Responder/responder-accounts/responder-display";

import ResponderWrapper from "./Accounts/Responder/responder-accounts/responderWrapper.jsx";
import UserWrapper from "./Accounts/Users/user-accounts/userWrapper.jsx";

import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles
import { AuthProvider } from "./context/authContext.jsx";
import PrivateRoute from "./components/privateRoute/privateRoute.jsx";

function App() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

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
          element: <ResponderRegister />,
        },
        {
          path: "/admin/responder/accounts",
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
          element: (
            <PrivateRoute>
              <Dashboard users={users} />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/announcement",
          element: (
            <PrivateRoute>
              <Announcement />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/report",
          element: (
            <PrivateRoute>
              <Report users={users} messages={messages} />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/report/:id",
          element: (
            <PrivateRoute>
              <ViewReports />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/report/in-progress/:id",
          element: (
            <PrivateRoute>
              <OngoingReports />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/history",
          element: (
            <PrivateRoute>
              <History />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/history/:id",
          element: (
            <PrivateRoute>
              <ViewModal />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/responder",
          element: (
            <PrivateRoute>
              <Responder />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/accounts",
          element: (
            <PrivateRoute>
              <AccountCatagory />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/responder/registration/:isUpdate",
          element: (
            <PrivateRoute>
              <ResponderWrapper />
            </PrivateRoute>
          ),
        },
        {
          path: "/home/account/user/registration/:isUpdate",
          element: (
            <PrivateRoute>
              <UserWrapper />
            </PrivateRoute>
          )
        }
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" />
    </>
  );
}

export default App;
