import RegistrationForm from "./features/registration/RegistrationForm";

export default function App() {
  const campId = new URLSearchParams(window.location.search).get("campId");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Camp-Anmeldung</h1>
        <p className="mb-6 mt-1 text-gray-500">Schritt 1 von 5: Grunddaten</p>

        {campId ? (
          <RegistrationForm campId={campId} />
        ) : (
          <p className="text-sm text-red-600">
            Kein Camp ausgewählt. Bitte den Anmeldelink mit Camp-Kennung verwenden (z. B. ?campId=…).
          </p>
        )}
      </div>
    </div>
  );
}
