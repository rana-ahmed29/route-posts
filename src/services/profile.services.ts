import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL;

export async function getMyProfile() {
  const data = await axios.get(`${API_URL}/users/profile-data`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function uploadProfilePhoto(formData: FormData) {
  const data = await axios.put(`${API_URL}/users/upload-photo`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function getBookmarks() {
  const data = await axios.get(`${API_URL}/users/bookmarks`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}