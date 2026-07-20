import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { registrationFormSchema, RegistrationFormValues } from "./schema";
import { createRegistration } from "./api";
import { ApiError } from "../../lib/api";

const inputClass =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700";
const errorClass = "mt-1 text-sm text-red-600";

interface RegistrationFormProps {
  campId: string;
}

export default function RegistrationForm({ campId }: RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
  });

  const mutation = useMutation({
    mutationFn: (values: RegistrationFormValues) => createRegistration({ ...values, campId }),
    onSuccess: () => reset(),
  });

  if (mutation.isSuccess) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800">
        <h2 className="text-lg font-semibold">Anmeldung eingegangen</h2>
        <p className="mt-1 text-sm">
          Die Grunddaten wurden übermittelt. Die weiteren Schritte folgen in Kürze.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="firstName">
          Vorname
        </label>
        <input id="firstName" className={inputClass} {...register("firstName")} />
        {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="lastName">
          Nachname
        </label>
        <input id="lastName" className={inputClass} {...register("lastName")} />
        {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="birthDate">
          Geburtsdatum
        </label>
        <input id="birthDate" type="date" className={inputClass} {...register("birthDate")} />
        {errors.birthDate && <p className={errorClass}>{errors.birthDate.message}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="gender">
          Geschlecht (optional)
        </label>
        <input id="gender" className={inputClass} {...register("gender")} />
      </div>

      <div>
        <label className={labelClass} htmlFor="address">
          Adresse (optional)
        </label>
        <input id="address" className={inputClass} {...register("address")} />
      </div>

      <div>
        <label className={labelClass} htmlFor="phone">
          Telefon (optional)
        </label>
        <input id="phone" className={inputClass} {...register("phone")} />
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
        {mutation.isPending ? "Wird gesendet…" : "Anmeldung absenden"}
      </button>
    </form>
  );
}
