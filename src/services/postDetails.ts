import axios from "axios";


const API_URL=import.meta.env.VITE_BASE_URL;

export async function getSinglePost(id:string) {
  const data = await axios.get(`${API_URL}/posts/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}
