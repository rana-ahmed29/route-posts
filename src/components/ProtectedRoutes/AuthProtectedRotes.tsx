import { useContext, useEffect } from "react"
import { useNavigate } from "react-router"

import { authContext } from "../context/AuthContext"


export default function AuthProtectedRotes({children}:{children:React.ReactNode}) {
   const {token}=useContext(authContext)
    const navigate=useNavigate()

    useEffect(()=>{
        if(token){
            navigate("/")
        }
    },[token])

    
  return (
  <>
  {children}
  </>
  )
}
