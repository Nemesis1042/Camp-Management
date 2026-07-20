import { useMemo } from "react";
import { useForm, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormFieldDef } from "./formTemplateApi";
import { buildStepSchema } from "./dynamicFieldSchema";
import DynamicFieldInput from "./DynamicFieldInput";

interface DynamicStepFormProps {
  fields: FormFieldDef[];
  defaultValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  onBack?: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
}

export default function DynamicStepForm({
  fields,
  defaultValues,
  onSubmit,
  onBack,
  submitLabel,
  isSubmitting,
}: DynamicStepFormProps) {
  const schema = useMemo(() => buildStepSchema(fields), [fields]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <DynamicFieldInput
          key={field.key}
          field={field}
          register={register}
          error={errors[field.key] as FieldError | undefined}
        />
      ))}

      <div className="flex items-center gap-4">
        {onBack && (
          <button type="button" onClick={onBack} className="text-sm text-gray-500 underline">
            Zurück
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Wird gespeichert…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
