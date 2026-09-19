import React, { createContext, useState, type SetStateAction } from "react";

type AuthContextType = {
    token : string | null,
    setToken :React.Dispatch<SetStateAction <string | null >>
}
export const authContext = createContext<AuthContextType | null>(null)
export default function AuthContextProvider({children}:{children:React.ReactNode}){
    const [token, setToken] = useState<string | null>(
      localStorage.getItem("userToken"),
    );
    return(
        <>
        <authContext.Provider value={{token,setToken}}>
            {children}
        </authContext.Provider>
        </>
    )
}