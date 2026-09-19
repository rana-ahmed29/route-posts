import axios from "axios";
import type { UserPostsI } from "../types/post";

const API_URL = import.meta.env.VITE_BASE_URL;

export async function getSinglePost(id: string) {
  const data = await axios.get(`${API_URL}/posts/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function createPost(
  formData: FormData,
  onUploadProgress?: (percent: number) => void,
) {
  const data = await axios.post(`${API_URL}/posts/`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onUploadProgress(percent);
      }
    },
  });
  return data;
}

export async function updatePost(
  postId: string,
  formData: FormData,
  onUploadProgress?: (percent: number) => void,
) {
  const data = await axios.put(`${API_URL}/posts/${postId}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onUploadProgress(percent);
      }
    },
  });
  return data;
}

export async function deletePost(postId: string) {
  const { data } = await axios.delete(`${API_URL}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function bookmarkPost(postId: string) {
  const { data } = await axios.put(
    `${API_URL}/posts/${postId}/bookmark`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    },
  );
  return data;
}

export async function likeAndUnlikedPost(postId: string) {
  const { data } = await axios.put(
    `${API_URL}/posts/${postId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    },
  );
  return data;
}

export async function getUserPosts(userId: string) {
  const data = await axios.get<UserPostsI>(`${API_URL}/users/${userId}/posts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function getAllPosts(limit = 10) {
  const data = await axios.get(`${API_URL}/posts?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function sharePost(postId: string, body?: string) {
  return axios.post(`${API_URL}/posts/${postId}/share`, body ? { body } : {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
}