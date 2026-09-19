import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL;

export async function getPostComments(id: string) {
  const data = await axios.get(`${API_URL}/posts/${id}/comments`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function createComment(id: string, formData: FormData) {
  const data = await axios.post(`${API_URL}/posts/${id}/comments`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

// update a comment's content/image — postId + commentId, per the docs
export async function updateComment(
  postId: string,
  commentId: string,
  formData: FormData,
) {
  const data = await axios.put(
    `${API_URL}/posts/${postId}/comments/${commentId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    },
  );
  return data;
}

export async function deleteComment(postId: string, commentId: string) {
  const data = await axios.delete(
    `${API_URL}/posts/${postId}/comments/${commentId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    },
  );
  return data;
}

export async function likeUnlikeComment(postId: string, commentId: string) {
  const data = await axios.put(
    `${API_URL}/posts/${postId}/comments/${commentId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    },
  );
  return data;
}
