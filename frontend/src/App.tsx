import RegistrationWizard from "./features/registration/RegistrationWizard";
import AdminApp from "./features/admin/AdminApp";

export default function App() {
  if (window.location.pathname.startsWith("/admin")) {
    return <AdminApp />;
  }

  const campId = new URLSearchParams(window.location.search).get("campId");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        {campId ? (
          <RegistrationWizard campId={campId} />
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Camp-Anmeldung</h1>
            <p className="mt-4 text-sm text-red-600">
              Kein Camp ausgewählt. Bitte den Anmeldelink mit Camp-Kennung verwenden (z. B. ?campId=…).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
