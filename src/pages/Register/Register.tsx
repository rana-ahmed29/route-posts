import {
  Input,
  Button,
  Label,
  ListBox,
  Select,
  TextField,
  FieldError,
  Spinner,
  Alert,
} from "@heroui/react";
import { User, AtSign, Users, Calendar, KeyRound } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  registerSchema,
  type RegisterSchemaType,
} from "../../lib/schema/auth.schema";
import { registerUser } from "../../services/auth.services";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#00298d] focus:bg-white";

export default function Register() {

  const [errorMsg, setErrorMsg]=useState("");
  const [successMsg, setSuccessMsg]=useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors , isSubmitting },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      password: "",
      rePassword: "",
    },
  });

  async function onSubmit(formData: RegisterSchemaType) {
    console.log(formData);
    setSuccessMsg("")
    setErrorMsg("")
    try {
      const response = await registerUser(formData);
      setSuccessMsg(response.data.message)
      console.log(response);
       setIsSuccess(true);
    } catch (error: any) {
      setErrorMsg(error.response.data.message);
      console.log(error.response);
    }
  }
   useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      navigate("/");
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
            onClick={() => navigate("/auth/login")}
            className=" cursor-pointer rounded-lg py-2 text-sm font-extrabold transition text-slate-600 hover:text-slate-800"
          >
            Login
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg py-2 text-sm font-extrabold transition bg-white text-[#00298d] shadow-sm"
          >
            Register
          </button>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900">
          Create a new account
        </h2>
        <p className="mt-1 text-sm text-slate-500">It is quick and easy.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextField isInvalid={Boolean(errors.name)} className="w-full">
            <Label className="sr-only">Full name</Label>
            <div className="relative">
              <User
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                className={inputClass}
                placeholder="Full name"
                {...register("name")}
              />
            </div>
            <FieldError>{errors.name?.message}</FieldError>
          </TextField>

          <TextField isInvalid={Boolean(errors.username)} className="w-full">
            <Label className="sr-only">Username</Label>
            <div className="relative">
              <AtSign
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                className={inputClass}
                placeholder="Username"
                {...register("username")}
              />
            </div>
            <FieldError>{errors.username?.message}</FieldError>
          </TextField>

          <TextField isInvalid={Boolean(errors.email)} className="w-full">
            <Label className="sr-only">Email address</Label>
            <div className="relative">
              <AtSign
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="email"
                className={inputClass}
                placeholder="Email Address"
                {...register("email")}
              />
            </div>
            <FieldError>{errors.email?.message}</FieldError>
          </TextField>

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <div className="w-full">
                <Select
                  aria-label="Gender"
                  value={field.value}
                  onChange={field.onChange}
                  className="w-full"
                  placeholder="Select Gender"
                >
                  <Select.Trigger
                    className={`gap-2 rounded-xl border py-3 pl-4 pr-4 shadow-none data-[hover=true]:border-[#00298d] data-[open=true]:border-[#00298d] data-[open=true]:bg-white ${
                      errors.gender
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <Users size={18} className="shrink-0 text-slate-400" />
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="male" textValue="Male">
                        Male
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item id="female" textValue="Female">
                        Female
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            )}
          />

          <TextField isInvalid={Boolean(errors.dateOfBirth)} className="w-full">
            <Label className="sr-only">Date of birth</Label>
            <div className="relative">
              <Calendar
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="date"
                className={inputClass}
                {...register("dateOfBirth")}
              />
            </div>
            <FieldError>{errors.dateOfBirth?.message}</FieldError>
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

          <TextField isInvalid={Boolean(errors.rePassword)} className="w-full">
            <Label className="sr-only">Confirm password</Label>
            <div className="relative">
              <KeyRound
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="password"
                className={inputClass}
                placeholder="Confirm Password"
                {...register("rePassword")}
              />
            </div>
            <FieldError>{errors.rePassword?.message}</FieldError>
          </TextField>

          <Button
            type="submit"
            className="w-full rounded-xl bg-[#00298d] py-6 text-base font-extrabold text-white hover:bg-[#001f6b]"
          >
            {isSubmitting ? (
              <span className="flex justify-center items-center gap-1">
                <Spinner className="text-white" />
                Please Wait
              </span>
            ) : (
              "Create New Account"
            )}
          </Button>
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
