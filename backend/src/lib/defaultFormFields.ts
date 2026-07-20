import { FormFieldType, Prisma } from "@prisma/client";

export interface DefaultFormField {
  step: number;
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: Prisma.InputJsonValue;
  order: number;
}

// Ausgangsbasis für neue Camps, angelehnt an den echten CVJM-Freizeitpass.
// Admins können diese Felder pro Camp über die Formular-Konfiguration
// anpassen (siehe /api/camps/:campId/form-template).
export const DEFAULT_FORM_FIELDS: DefaultFormField[] = [
  // Schritt 2: Sorgeberechtigte
  { step: 2, key: "guardianName", label: "Name des Sorgeberechtigten", type: "TEXT", required: true, order: 1 },
  { step: 2, key: "guardianPhone", label: "Telefonnummer", type: "PHONE", required: true, order: 2 },
  { step: 2, key: "guardianEmail", label: "E-Mail-Adresse", type: "EMAIL", required: false, order: 3 },
  { step: 2, key: "emergencyContactName", label: "Notfallkontakt (falls abweichend)", type: "TEXT", required: false, order: 4 },
  { step: 2, key: "emergencyContactPhone", label: "Telefonnummer Notfallkontakt", type: "PHONE", required: false, order: 5 },

  // Schritt 3: Gesundheit
  { step: 3, key: "allergies", label: "Allergien", type: "TEXTAREA", required: false, order: 1 },
  { step: 3, key: "medications", label: "Medikamente / Dauermedikation", type: "TEXTAREA", required: false, order: 2 },
  { step: 3, key: "dietaryRestrictions", label: "Ernährungseinschränkungen", type: "TEXTAREA", required: false, order: 3 },
  {
    step: 3,
    key: "swimmingAbility",
    label: "Schwimmfähigkeit",
    type: "SELECT",
    required: true,
    options: ["Nichtschwimmer", "Schwimmer", "Sehr guter Schwimmer"],
    order: 4,
  },
  { step: 3, key: "healthInsurance", label: "Krankenkasse", type: "TEXT", required: false, order: 5 },
  { step: 3, key: "doctorNotes", label: "Sonstige Hinweise für Betreuer", type: "TEXTAREA", required: false, order: 6 },

  // Schritt 4: Aktivitäten
  { step: 4, key: "canSwim", label: "Darf schwimmen gehen", type: "CHECKBOX", required: false, order: 1 },
  { step: 4, key: "canClimb", label: "Darf klettern", type: "CHECKBOX", required: false, order: 2 },
  { step: 4, key: "activityNotes", label: "Weitere Wünsche/Anmerkungen zu Aktivitäten", type: "TEXTAREA", required: false, order: 3 },

  // Schritt 5: Einwilligungen
  { step: 5, key: "photoConsent", label: "Einverständnis Foto-/Videoaufnahmen", type: "CHECKBOX", required: true, order: 1 },
  { step: 5, key: "dataProcessingConsent", label: "Einverständnis zur Datenverarbeitung gemäß DSGVO", type: "CHECKBOX", required: true, order: 2 },
  { step: 5, key: "firstAidConsent", label: "Einverständnis zu Erste-Hilfe-Maßnahmen im Notfall", type: "CHECKBOX", required: true, order: 3 },
  { step: 5, key: "signatureName", label: "Name des Unterzeichnenden (Sorgeberechtigte/r)", type: "TEXT", required: true, order: 4 },
];
