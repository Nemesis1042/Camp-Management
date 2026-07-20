import { useAdminToken } from "./useAdminToken";
import LoginForm from "../auth/LoginForm";
import CampsAdmin from "../camps/CampsAdmin";

export default function AdminApp() {
  const { token, setToken, clearToken } = useAdminToken();

  if (!token) {
    return <LoginForm onSuccess={setToken} />;
  }

  return <CampsAdmin token={token} onLogout={clearToken} />;
}
