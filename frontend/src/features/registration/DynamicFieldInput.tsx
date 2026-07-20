import { UseFormRegister, FieldError } from "react-hook-form";
import type { FormFieldDef } from "./formTemplateApi";

const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-gray-700";
const errorClass = "mt-1 text-sm text-red-600";

interface DynamicFieldInputProps {
  field: FormFieldDef;
  register: UseFormRegister<Record<string, unknown>>;
  error?: FieldError;
}

export default function DynamicFieldInput({ field, register, error }: DynamicFieldInputProps) {
  const requiredMark = field.required ? " *" : "";

  if (field.type === "CHECKBOX") {
    return (
      <div>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" className="mt-1" {...register(field.key)} />
          <span>
            {field.label}
            {requiredMark}
          </span>
        </label>
        {error && <p className={errorClass}>{error.message}</p>}
      </div>
    );
  }

  if (field.type === "TEXTAREA") {
    return (
      <div>
        <label className={labelClass} htmlFor={field.key}>
          {field.label}
          {requiredMark}
        </label>
        <textarea id={field.key} className={inputClass} rows={3} {...register(field.key)} />
        {error && <p className={errorClass}>{error.message}</p>}
      </div>
    );
  }

  if (field.type === "SELECT") {
    return (
      <div>
        <label className={labelClass} htmlFor={field.key}>
          {field.label}
          {requiredMark}
        </label>
        <select id={field.key} className={inputClass} defaultValue="" {...register(field.key)}>
          <option value="" disabled>
            Bitte wählen
          </option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <p className={errorClass}>{error.message}</p>}
      </div>
    );
  }

  if (field.type === "RADIO") {
    return (
      <div>
        <span className={labelClass}>
          {field.label}
          {requiredMark}
        </span>
        <div className="mt-1 space-y-1">
          {(field.options ?? []).map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="radio" value={option} {...register(field.key)} />
              {option}
            </label>
          ))}
        </div>
        {error && <p className={errorClass}>{error.message}</p>}
      </div>
    );
  }

  const htmlType =
    field.type === "DATE" ? "date" : field.type === "NUMBER" ? "number" : field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : "text";

  return (
    <div>
      <label className={labelClass} htmlFor={field.key}>
        {field.label}
        {requiredMark}
      </label>
      <input id={field.key} type={htmlType} className={inputClass} {...register(field.key)} />
      {error && <p className={errorClass}>{error.message}</p>}
    </div>
  );
}
