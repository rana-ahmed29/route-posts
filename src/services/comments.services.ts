import axios from "axios";


const API_URL=import.meta.env.VITE_BASE_URL;

export async function getPostComments(id:string) {
  const data = await axios.get(`${API_URL}/posts/${id}/comments`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function createComment(id:string,formData:FormData) {
  const data = await axios.post(`${API_URL}/posts/${id}/comments`,formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}
