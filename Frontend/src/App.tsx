import { useMemo } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerSite from "./pages/CustomerSite";
import { AuthRoute } from "./pages/AuthPages";
import { usePathname } from "./lib/navigation";

export default function App() {
  const pathname = usePathname();

  const view = useMemo(() => {
    const normalized = pathname.replace(/\/+$/, "") || "/";

    if (
      normalized === "/login" ||
      normalized === "/signin" ||
      normalized === "/auth/login" ||
      normalized === "/auth/signin"
    ) {
      return <AuthRoute mode="login" />;
    }

    if (
      normalized === "/signup" ||
      normalized === "/register" ||
      normalized === "/auth/signup" ||
      normalized === "/auth/register"
    ) {
      return <AuthRoute mode="signup" />;
    }

    if (normalized.startsWith("/admin")) {
      return <AdminDashboard />;
    }

    return <CustomerSite />;
  }, [pathname]);

  return view;
}
