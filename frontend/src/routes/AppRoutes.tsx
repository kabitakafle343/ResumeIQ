import { useRoutes } from "react-router-dom"
import Login from "../pages/Login"
import { route } from "./route.constant"
import Signup from "../pages/Signup"
import Dashboard from "../pages/Dashboard"
import UploadCv from "../pages/UploadCv"
import History from "../pages/History"
import JobMatch from "../pages/JobMatch"

const routes = [
    {
        path: route.login,
        element: <Login />,
    },
    {
        path: route.singup,
        element: <Signup />,
    },
    {
        path: route.dashboard,
        element: <Dashboard />,
    },
    {
        path: route.upload,
        element: <UploadCv />,
    },
    {
        path: route.history,
        element: <History />,
    },
    {
        path: route.jobMatch,
        element: <JobMatch />,
    },
]

export const AppRoutes=()=>useRoutes(routes)