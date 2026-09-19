import React, { createContext, useContext, useEffect, useState } from "react";
import type { IUserData } from "../types/profileData";
import { getMyProfile } from "../services/profile.services";
import { authContext } from "./AuthContext";

type UserContextType = {
  userData: IUserData | null;
  refetchUserData: () => Promise<void>;
};

export const userContext = createContext<UserContextType>({
  userData: null,
  refetchUserData: async () => {},
});

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<IUserData | null>(null);
  const { token } = useContext(authContext)!;

  async function getMyProfileData() {
    try {
      const { data } = await getMyProfile();
      const user: IUserData = data.data.user;
      setUserData(user);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }

  useEffect(() => {
    if (token) {
      getMyProfileData();
    }
  }, [token]);

  return (
    <userContext.Provider
      value={{ userData, refetchUserData: getMyProfileData }}
    >
      {children}
    </userContext.Provider>
  );
}
