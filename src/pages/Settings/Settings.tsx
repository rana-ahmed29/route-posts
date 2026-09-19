import axios from "axios";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, AlertTriangle, CheckCircle2 } from "lucide-react";
import { changePassword } from "../../services/auth.services";
import { authContext } from "../../context/AuthContext";
import {
  changePasswordSchema,
  type ChangePasswordForm,
} from "../../lib/schema/changePassword.schema";
import usePageTitle from "../../hooks/usePageTitle";

export default function Settings() {
  usePageTitle("Change Password");
  const { setToken } = useContext(authContext)!;
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ChangePasswordForm) {
    setSuccess(false);
    setServerError(null);
    try {
      const response = await changePassword({
        password: values.currentPassword,
        newPassword: values.newPassword,
      });

      // the API invalidates the old token and issues a new one on password
      // change — same shape as signin: response.data.token (changePassword
      // already unwraps the axios response by one level, same as loginUser's
      // response.data.data.token does after axios's own .data)
      const refreshedToken = response?.data?.token;
      if (refreshedToken) {
        localStorage.setItem("userToken", refreshedToken);
        setToken(refreshedToken);
      }

      setSuccess(true);
      reset();
    } catch (err) {
      console.error("Failed to change password:", err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setServerError(
        message || "Couldn't change your password. Please try again.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f3ff] text-[#1877f2]">
            <KeyRound size={18} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Change Password
            </h1>
            <p className="text-sm text-slate-500">
              Keep your account secure by using a strong password.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">
              Current password
            </span>
            <input
              {...register("currentPassword")}
              type="password"
              placeholder="Enter current password"
              disabled={isSubmitting}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                errors.currentPassword
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-[#1877f2] focus:bg-white"
              }`}
            />
            {errors.currentPassword && (
              <span className="mt-1 flex items-start gap-1 text-xs font-semibold text-red-600">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                {errors.currentPassword.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">
              New password
            </span>
            <input
              {...register("newPassword")}
              type="password"
              placeholder="Enter new password"
              disabled={isSubmitting}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                errors.newPassword
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-[#1877f2] focus:bg-white"
              }`}
            />
            {errors.newPassword ? (
              <span className="mt-1 flex items-start gap-1 text-xs font-semibold text-red-600">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                {errors.newPassword.message}
              </span>
            ) : (
              <span className="mt-1 block text-xs text-slate-500">
                At least 8 characters with uppercase, lowercase, number, and
                special character.
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">
              Confirm new password
            </span>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Re-enter new password"
              disabled={isSubmitting}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                errors.confirmPassword
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-[#1877f2] focus:bg-white"
              }`}
            />
            {errors.confirmPassword && (
              <span className="mt-1 flex items-start gap-1 text-xs font-semibold text-red-600">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                {errors.confirmPassword.message}
              </span>
            )}
          </label>

          {serverError && (
            <p
              role="alert"
              className="flex items-start gap-1.5 text-sm font-semibold text-red-600"
            >
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {serverError}
            </p>
          )}

          {success && (
            <p className="flex items-start gap-1.5 text-sm font-semibold text-emerald-600">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
              Your password was updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#1877f2] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
