import { useState } from "react";
import { useAdminToken } from "./useAdminToken";
import CampsAdmin from "../camps/CampsAdmin";

export default function AdminApp() {
  const { token, setToken, clearToken } = useAdminToken();

  if (!token) {
    return <TokenGate onSubmit={setToken} />;
  }

  return <CampsAdmin token={token} onLogout={clearToken} />;
}

function TokenGate({ onSubmit }: { onSubmit: (token: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        className="w-full max-w-sm space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) onSubmit(value.trim());
        }}
      >
        <h1 className="text-xl font-bold text-gray-900">Admin-Zugang</h1>
        <p className="text-sm text-gray-500">
          Noch kein Login-Formular – JWT-Token einfügen (z. B. Antwort von{" "}
          <code>POST /api/auth/login</code>).
        </p>
        <input
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="JWT-Token"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Übernehmen
        </button>
      </form>
    </div>
  );
}
