import { Navigate } from "react-router-dom";
import TokenService from "../api/tokenservice"



export const ProtectedRoute=({component:Component}:{component:React.ComponentType})=>{
    const isAuthenticated=TokenService.isAuthenticated();
    if(!isAuthenticated){
       return <Navigate to="/" replace/>

    }
    return (
        <>
        <Component/>
        </>
    )
}