import axios from "axios";


const API_URL=import.meta.env.VITE_BASE_URL;

export async function getNewsFeed() {
  const data = await axios.get(`${API_URL}/posts?limit=10`,
    {
        headers:{
            Authorization : `Bearer ${localStorage.getItem("userToken")}`
        }
    }
  );
  return data;
}
