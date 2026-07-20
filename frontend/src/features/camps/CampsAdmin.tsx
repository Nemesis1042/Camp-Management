import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campFormSchema, CampFormValues } from "./schema";
import { createCamp, fetchCamps } from "./api";
import { ApiError } from "../../lib/api";

const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700";
const errorClass = "mt-1 text-sm text-red-600";

interface CampsAdminProps {
  token: string;
  onLogout: () => void;
}

export default function CampsAdmin({ token, onLogout }: CampsAdminProps) {
  const queryClient = useQueryClient();
  const campsQuery = useQuery({ queryKey: ["camps"], queryFn: () => fetchCamps(token) });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CampFormValues>({ resolver: zodResolver(campFormSchema) });

  const createMutation = useMutation({
    mutationFn: (values: CampFormValues) => createCamp(token, values),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["camps"] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Camp-Verwaltung</h1>
          <button onClick={onLogout} className="text-sm text-gray-500 underline">
            Abmelden
          </button>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800">Camps</h2>

          {campsQuery.isLoading && <p className="mt-2 text-sm text-gray-500">Lädt…</p>}
          {campsQuery.isError && (
            <p className={errorClass}>
              {campsQuery.error instanceof ApiError ? campsQuery.error.message : "Fehler beim Laden"}
            </p>
          )}
          {campsQuery.data?.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">Noch keine Camps angelegt.</p>
          )}
          {campsQuery.data && campsQuery.data.length > 0 && (
            <table className="mt-2 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Zeitraum</th>
                  <th className="py-2">Teilnehmer</th>
                </tr>
              </thead>
              <tbody>
                {campsQuery.data.map((camp) => (
                  <tr key={camp.id} className="border-b border-gray-100">
                    <td className="py-2">{camp.name}</td>
                    <td className="py-2">
                      {new Date(camp.startDate).toLocaleDateString("de-DE")} –{" "}
                      {new Date(camp.endDate).toLocaleDateString("de-DE")}
                    </td>
                    <td className="py-2">
                      {camp.participantCount}
                      {camp.maxParticipants ? ` / ${camp.maxParticipants}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800">Neues Camp anlegen</h2>
          <form onSubmit={handleSubmit((values) => createMutation.mutate(values))} className="mt-3 max-w-md space-y-4">
            <div>
              <label className={labelClass} htmlFor="name">
                Name
              </label>
              <input id="name" className={inputClass} {...register("name")} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="startDate">
                Startdatum
              </label>
              <input id="startDate" type="date" className={inputClass} {...register("startDate")} />
              {errors.startDate && <p className={errorClass}>{errors.startDate.message}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="endDate">
                Enddatum
              </label>
              <input id="endDate" type="date" className={inputClass} {...register("endDate")} />
              {errors.endDate && <p className={errorClass}>{errors.endDate.message}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="maxParticipants">
                Max. Teilnehmer (optional)
              </label>
              <input id="maxParticipants" type="number" min="1" className={inputClass} {...register("maxParticipants")} />
            </div>

            {createMutation.isError && (
              <p className={errorClass}>
                {createMutation.error instanceof ApiError ? createMutation.error.message : "Ein Fehler ist aufgetreten"}
              </p>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Wird angelegt…" : "Camp anlegen"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
