import { useContext, useEffect} from "react";
import { useNavigate } from "react-router";
import { authContext } from "../context/AuthContext";
export default function AppProtectedRoutes({
  children,
}: {
  children: React.ReactNode;
}) {

const {token}=useContext(authContext)
const navigate= useNavigate()
useEffect(() => {
  if (!token) {
    navigate("/auth/login");
  }
}, [token]);

  return(
    <>
    {children}
    </>
  ) 
}
