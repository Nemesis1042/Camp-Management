import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginFormSchema, LoginFormValues } from "./schema";
import { login } from "./api";
import { ApiError } from "../../lib/api";

const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700";
const errorClass = "mt-1 text-sm text-red-600";

interface LoginFormProps {
  onSuccess: (token: string) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => onSuccess(data.token),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold text-gray-900">Admin-Login</h1>

        <div>
          <label className={labelClass} htmlFor="email">
            E-Mail
          </label>
          <input id="email" type="email" className={inputClass} {...register("email")} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="password">
            Passwort
          </label>
          <input id="password" type="password" className={inputClass} {...register("password")} />
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>

        {mutation.isError && (
          <p className={errorClass}>
            {mutation.error instanceof ApiError ? mutation.error.message : "Ein Fehler ist aufgetreten"}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Wird geprüft…" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
