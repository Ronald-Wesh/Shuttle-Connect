import { useEffect, useState } from "react";

function normalizePath(pathname: string) {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

export function navigate(path: string, replace = false) {
  if (typeof window === "undefined") return;

  const normalizedCurrent = normalizePath(window.location.pathname);
  const normalizedNext = normalizePath(path);

  if (normalizedCurrent === normalizedNext) {
    return;
  }

  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }

  window.dispatchEvent(new Event("app:navigation"));
}

export function usePathname() {
  const [pathname, setPathname] = useState(() =>
    typeof window === "undefined" ? "/" : normalizePath(window.location.pathname),
  );

  useEffect(() => {
    const updatePathname = () => {
      setPathname(normalizePath(window.location.pathname));
    };

    window.addEventListener("popstate", updatePathname);
    window.addEventListener("app:navigation", updatePathname);

    return () => {
      window.removeEventListener("popstate", updatePathname);
      window.removeEventListener("app:navigation", updatePathname);
    };
  }, []);

  return pathname;
}
