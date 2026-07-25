import { useAdminToken } from "./useAdminToken";
import LoginForm from "../auth/LoginForm";
import CampsAdmin from "../camps/CampsAdmin";
import CampFormEditor from "../camps/CampFormEditor";

function parseCampFormPath(pathname: string): string | null {
  const match = pathname.match(/^\/admin\/camps\/([^/]+)\/form$/);
  return match ? match[1] : null;
}

export default function AdminApp() {
  const { token, setToken, clearToken } = useAdminToken();

  if (!token) {
    return <LoginForm onSuccess={setToken} />;
  }

  const campIdForForm = parseCampFormPath(window.location.pathname);
  if (campIdForForm) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <a href="/admin" className="text-sm text-gray-500 underline">
            ← Zurück zur Camp-Verwaltung
          </a>
          <div className="mt-4">
            <CampFormEditor campId={campIdForForm} token={token} />
          </div>
        </div>
      </div>
    );
  }

  return <CampsAdmin token={token} onLogout={clearToken} />;
}
