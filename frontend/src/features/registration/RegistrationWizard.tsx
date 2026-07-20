import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import RegistrationForm from "./RegistrationForm";
import DynamicStepForm from "./DynamicStepForm";
import { fetchFormTemplate, submitFormResponse } from "./formTemplateApi";
import { ApiError } from "../../lib/api";

const STEP_LABELS: Record<number, string> = {
  1: "Grunddaten",
  2: "Sorgeberechtigte",
  3: "Gesundheit",
  4: "Aktivitäten",
  5: "Einwilligungen",
};

interface RegistrationWizardProps {
  campId: string;
}

export default function RegistrationWizard({ campId }: RegistrationWizardProps) {
  const [step, setStep] = useState(1);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [isDone, setIsDone] = useState(false);

  const templateQuery = useQuery({
    queryKey: ["form-template", campId],
    queryFn: () => fetchFormTemplate(campId),
    enabled: step > 1,
  });

  const submitMutation = useMutation({
    mutationFn: (finalAnswers: Record<string, unknown>) => submitFormResponse(participantId!, finalAnswers),
    onSuccess: () => setIsDone(true),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Camp-Anmeldung</h1>
      <p className="mb-6 mt-1 text-gray-500">
        {isDone ? "Abgeschlossen" : `Schritt ${step} von 5: ${STEP_LABELS[step]}`}
      </p>

      {isDone && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800">
          <h2 className="text-lg font-semibold">Anmeldung abgeschlossen</h2>
          <p className="mt-1 text-sm">Vielen Dank! Die Anmeldung wurde vollständig übermittelt.</p>
        </div>
      )}

      {!isDone && step === 1 && (
        <RegistrationForm
          campId={campId}
          onSuccess={(newParticipantId) => {
            setParticipantId(newParticipantId);
            setStep(2);
          }}
        />
      )}

      {!isDone && step > 1 && templateQuery.isLoading && (
        <p className="text-sm text-gray-500">Formular wird geladen…</p>
      )}

      {!isDone && step > 1 && templateQuery.isError && (
        <p className="text-sm text-red-600">
          {templateQuery.error instanceof ApiError
            ? templateQuery.error.message
            : "Formular konnte nicht geladen werden"}
        </p>
      )}

      {!isDone && step > 1 && templateQuery.data && (
        <>
          {submitMutation.isError && (
            <p className="mb-4 text-sm text-red-600">
              {submitMutation.error instanceof ApiError
                ? submitMutation.error.message
                : "Ein Fehler ist aufgetreten"}
            </p>
          )}
          <DynamicStepForm
            fields={templateQuery.data.fields.filter((field) => field.step === step)}
            defaultValues={answers}
            onBack={() => setStep(step - 1)}
            submitLabel={step === 5 ? "Anmeldung abschließen" : "Weiter"}
            isSubmitting={step === 5 && submitMutation.isPending}
            onSubmit={(values) => {
              const merged = { ...answers, ...values };
              setAnswers(merged);
              if (step === 5) {
                submitMutation.mutate(merged);
              } else {
                setStep(step + 1);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
