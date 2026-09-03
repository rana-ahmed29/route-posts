import {
  Input,
  Button,
  Label,
  TextField,
  FieldError,
  Spinner,
  Alert,
} from "@heroui/react";
import { User, KeyRound } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  type LoginSchemaType,
} from "../../lib/schema/auth.schema";
import { loginUser } from "../../services/auth.services";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { authContext } from "../../components/context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#00298d] focus:bg-white";

export default function Login() {
  const {setToken}=useContext(authContext)!
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(formData: LoginSchemaType) {
    console.log(formData);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const response = await loginUser(formData);
      setSuccessMsg(response.data.message);
      console.log(response);
      localStorage.setItem("userToken",response.data.data.token)
      setToken(response.data.data.token);
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMsg(error.response.data.message);
      console.log(error.response);
    }
  }

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      navigate("/feed");
    }, 1500);
    return () => clearTimeout(timer);
  }, [isSuccess, navigate]);

  return (
    <section className="w-full max-w-[430px] lg:min-w-[430px]">
      <div className="rounded-2xl bg-white p-4 sm:p-6 ">
        <div className="mb-4 text-center lg:hidden">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#00298d]">
            Route Posts
          </h1>
          <p className="mt-1 text-base font-medium leading-snug text-slate-700">
            Connect with friends and the world around you on Route Posts.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className="cursor-pointer rounded-lg py-2 text-sm font-extrabold transition bg-white text-[#00298d] shadow-sm"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate("/auth/register")}
            className="cursor-pointer rounded-lg py-2 text-sm font-extrabold transition text-slate-600 hover:text-slate-800"
          >
            Register
          </button>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900">
          Log in to Route Posts
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Log in and continue your social journey.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextField isInvalid={Boolean(errors.email)} className="w-full">
            <Label className="sr-only">Email or username</Label>
            <div className="relative">
              <User
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                className={inputClass}
                placeholder="Email or username"
                {...register("email")}
              />
            </div>
            <FieldError>{errors.email?.message}</FieldError>
          </TextField>

          <TextField isInvalid={Boolean(errors.password)} className="w-full">
            <Label className="sr-only">Password</Label>
            <div className="relative">
              <KeyRound
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="password"
                className={inputClass}
                placeholder="Password"
                {...register("password")}
              />
            </div>
            <FieldError>{errors.password?.message}</FieldError>
          </TextField>

          <Button
            type="submit"
            className="w-full rounded-xl bg-[#00298d] py-6 text-base font-extrabold text-white hover:bg-[#001f6b]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-1">
                <Spinner className="text-white" />
                Please Wait
              </span>
            ) : (
              "Log In"
            )}
          </Button>

          <p className="text-center text-sm">
            <a
              href="#"
              className="font-semibold text-[#00298d] hover:underline"
            >
              Forgot password?
            </a>
          </p>

          {errorMsg && (
            <Alert status="danger" className="bg-red-100">
              <Alert.Content>
                <Alert.Title className="capitalize">{errorMsg}</Alert.Title>
              </Alert.Content>
            </Alert>
          )}
          {successMsg && (
            <Alert status="success" className="bg-green-100">
              <Alert.Content>
                <Alert.Title className="capitalize">{successMsg}</Alert.Title>
              </Alert.Content>
            </Alert>
          )}
        </form>
      </div>
    </section>
  );
}
