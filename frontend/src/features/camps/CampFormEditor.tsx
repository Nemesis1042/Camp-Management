import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchFormTemplate,
  publishFormTemplate,
  FormFieldType,
  FormTemplateResponse,
} from "../registration/formTemplateApi";
import { ApiError } from "../../lib/api";

const FIELD_TYPES: FormFieldType[] = [
  "TEXT",
  "TEXTAREA",
  "DATE",
  "NUMBER",
  "EMAIL",
  "PHONE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
];
const STEPS = [2, 3, 4, 5];
const STEP_LABELS: Record<number, string> = {
  2: "Sorgeberechtigte",
  3: "Gesundheit",
  4: "Aktivitäten",
  5: "Einwilligungen",
};

const miniLabelClass = "block text-xs font-medium uppercase tracking-wide text-gray-400";
const miniInputClass =
  "mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500";

interface EditableField {
  localId: string;
  step: number;
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  optionsText: string;
  order: number;
}

let localIdCounter = 0;
function nextLocalId() {
  localIdCounter += 1;
  return `local-${localIdCounter}`;
}

function toEditableFields(template: FormTemplateResponse): EditableField[] {
  return template.fields.map((field) => ({
    localId: nextLocalId(),
    step: field.step,
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    optionsText: (field.options ?? []).join(", "),
    order: field.order,
  }));
}

interface CampFormEditorProps {
  campId: string;
  token: string;
}

export default function CampFormEditor({ campId, token }: CampFormEditorProps) {
  const queryClient = useQueryClient();
  const templateQuery = useQuery({
    queryKey: ["form-template", campId],
    queryFn: () => fetchFormTemplate(campId),
  });

  const [fields, setFields] = useState<EditableField[] | null>(null);

  useEffect(() => {
    if (templateQuery.data && fields === null) {
      setFields(toEditableFields(templateQuery.data));
    }
  }, [templateQuery.data, fields]);

  const publishMutation = useMutation({
    mutationFn: (payload: EditableField[]) =>
      publishFormTemplate(
        campId,
        token,
        payload.map((field) => ({
          step: field.step,
          key: field.key.trim(),
          label: field.label.trim(),
          type: field.type,
          required: field.required,
          order: field.order,
          options:
            field.type === "SELECT" || field.type === "RADIO"
              ? field.optionsText
                  .split(",")
                  .map((option) => option.trim())
                  .filter(Boolean)
              : undefined,
        }))
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["form-template", campId], data);
      setFields(toEditableFields(data));
    },
  });

  if (templateQuery.isLoading || fields === null) {
    return <p className="text-sm text-gray-500">Formular wird geladen…</p>;
  }

  if (templateQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        {templateQuery.error instanceof ApiError ? templateQuery.error.message : "Formular konnte nicht geladen werden"}
      </p>
    );
  }

  function updateField(localId: string, patch: Partial<EditableField>) {
    setFields((prev) => prev!.map((field) => (field.localId === localId ? { ...field, ...patch } : field)));
  }

  function removeField(localId: string) {
    setFields((prev) => prev!.filter((field) => field.localId !== localId));
  }

  function addField(step: number) {
    const stepFields = fields!.filter((field) => field.step === step);
    const nextOrder = stepFields.length > 0 ? Math.max(...stepFields.map((field) => field.order)) + 1 : 1;
    setFields((prev) => [
      ...prev!,
      {
        localId: nextLocalId(),
        step,
        key: "",
        label: "",
        type: "TEXT",
        required: false,
        optionsText: "",
        order: nextOrder,
      },
    ]);
  }

  const SaveButton = (
    <button
      type="button"
      onClick={() => publishMutation.mutate(fields)}
      disabled={publishMutation.isPending}
      className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {publishMutation.isPending ? "Wird veröffentlicht…" : "Speichern (neue Version veröffentlichen)"}
    </button>
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Formular bearbeiten</h2>
          <p className="mt-1 text-sm text-gray-500">
            Aktuelle Version: {templateQuery.data?.version}. Speichern veröffentlicht eine neue Version – bestehende
            Anmeldungen bleiben an ihre alte Version gebunden.
          </p>
        </div>
        {SaveButton}
      </div>

      {publishMutation.isError && (
        <p className="mt-3 text-sm text-red-600">
          {publishMutation.error instanceof ApiError ? publishMutation.error.message : "Ein Fehler ist aufgetreten"}
        </p>
      )}
      {publishMutation.isSuccess && (
        <p className="mt-3 text-sm text-green-700">Neue Version {publishMutation.data?.version} veröffentlicht.</p>
      )}

      <div className="mt-6 space-y-6">
        {STEPS.map((step) => {
          const stepFields = fields.filter((field) => field.step === step);
          return (
            <div key={step} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="font-medium text-gray-800">
                  Schritt {step} · {STEP_LABELS[step]}
                </h3>
                <span className="text-xs text-gray-400">
                  {stepFields.length} {stepFields.length === 1 ? "Feld" : "Felder"}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {stepFields.length === 0 && (
                  <p className="px-4 py-4 text-sm text-gray-400">Noch keine Felder in diesem Schritt.</p>
                )}
                {stepFields.map((field, index) => (
                  <div key={field.localId} className="flex gap-3 px-4 py-4">
                    <div className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className={miniLabelClass}>Label</label>
                          <input
                            className={miniInputClass}
                            placeholder="z. B. Name des Sorgeberechtigten"
                            value={field.label}
                            onChange={(event) => updateField(field.localId, { label: event.target.value })}
                          />
                        </div>
                        <div>
                          <label className={miniLabelClass}>Key</label>
                          <input
                            className={miniInputClass}
                            placeholder="guardianName"
                            value={field.key}
                            onChange={(event) => updateField(field.localId, { key: event.target.value })}
                          />
                        </div>
                        <div>
                          <label className={miniLabelClass}>Reihenfolge</label>
                          <input
                            type="number"
                            className={miniInputClass}
                            value={field.order}
                            onChange={(event) => updateField(field.localId, { order: Number(event.target.value) })}
                          />
                        </div>

                        <div>
                          <label className={miniLabelClass}>Typ</label>
                          <select
                            className={miniInputClass}
                            value={field.type}
                            onChange={(event) =>
                              updateField(field.localId, { type: event.target.value as FormFieldType })
                            }
                          >
                            {FIELD_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        {(field.type === "SELECT" || field.type === "RADIO") && (
                          <div className="sm:col-span-3">
                            <label className={miniLabelClass}>Optionen (kommagetrennt)</label>
                            <input
                              className={miniInputClass}
                              placeholder="Nichtschwimmer, Schwimmer, Sehr guter Schwimmer"
                              value={field.optionsText}
                              onChange={(event) => updateField(field.localId, { optionsText: event.target.value })}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(event) => updateField(field.localId, { required: event.target.checked })}
                          />
                          Pflichtfeld
                        </label>
                        <button
                          type="button"
                          onClick={() => removeField(field.localId)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 px-4 py-3">
                <button
                  type="button"
                  onClick={() => addField(step)}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  + Feld hinzufügen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">{SaveButton}</div>
    </div>
  );
}
