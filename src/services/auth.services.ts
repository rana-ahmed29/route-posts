import axios from "axios";
import type {
  RegisterSchemaType,
  LoginSchemaType,
} from "../lib/schema/auth.schema";

const API_URL = import.meta.env.VITE_BASE_URL;

export async function registerUser(formData: RegisterSchemaType) {
  const data = await axios.post(`${API_URL}/users/signup`, formData);
  return data;
}

export async function loginUser(formData: LoginSchemaType) {
  return axios.post(`${API_URL}/users/signin`, formData);
}

export async function changePassword(payload: {
  password: string;
  newPassword: string;
}) {
  const { data } = await axios.patch(
    `${API_URL}/users/change-password`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    },
  );
  return data;
}