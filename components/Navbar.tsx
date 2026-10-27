"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { HeartIcon, MessageIcon, ProfileIcon, SearchIcon, SignInIcon } from "./Icons";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [auth, setAuth] = useState<{
    status: "loading" | "signed-out" | "signed-in";
    name?: string;
    email?: string;
    role?: string;
  }>({ status: "loading" });
  const [authError, setAuthError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/?q=${encodeURIComponent(term)}` : "/");
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to check your account.");
        }

        if (data.authenticated) {
          setAuth({
            status: "signed-in",
            name: data.user?.name,
            email: data.user?.email,
            role: data.role,
          });
        } else {
          setAuth({ status: "signed-out" });
        }
      } catch (error) {
        setAuth({ status: "signed-out" });
        setAuthError(error instanceof Error ? error.message : "Unable to check your account.");
      }
    };

    void checkSession();
  }, [pathname]);

  const signOut = async () => {
    setIsSigningOut(true);
    setAuthError("");

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign out.");
      }

      window.location.assign("/");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to sign out.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const isAdmin = auth.role?.toLowerCase() === "admin";

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link href="/" className="logo"><img src="/Logo.png" alt="TUMart" /></Link>

        <form className="search" role="search" onSubmit={onSearch}>
          <SearchIcon />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books, gadgets, dorm gear"
            aria-label="Search items"
          />
        </form>

        {auth.status === "signed-out" ? (
          <nav className="actions" aria-label="Account">
            <Link href="/login" className="btn btn--primary">Login</Link>
          </nav>
        ) : auth.status === "signed-in" ? (
          <nav className="actions" aria-label="Account">
            <Link href="/" className="icon-btn" aria-label="Wishlist"><HeartIcon /></Link>
            <Link href="/" className="icon-btn" aria-label="Chat"><MessageIcon /></Link>
            <details className="profile">
              <summary className="avatar" aria-label="Open profile menu" title="Profile">
                <ProfileIcon />
              </summary>
              <div className="profile__menu">
                {(auth.name || auth.email) && (
                  <div className="profile__head">
                    {auth.name && <strong>{auth.name}</strong>}
                    {auth.email && <span>{auth.email}</span>}
                  </div>
                )}
                {isAdmin ? (
                  <>
                    <Link href="/add-product">Add product</Link>
                    <Link href="/admin/listings">Manage listings</Link>
                    <Link href="/admin/users">Manage users</Link>
                    <Link href="/admin/ekyc">eKYC requests</Link>

                  </>
                ) : auth.role?.toLowerCase() === "regular" ? (
                  <Link href="/add-product">Add product</Link>
                ) : null}
                <button type="button" onClick={signOut} disabled={isSigningOut}>
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
                {authError && <p className="profile__error" role="alert">{authError}</p>}
              </div>
            </details>
          </nav>
        ) : null}
        {auth.status === "signed-out" && authError && (
          <span className="navbar__error" role="alert">{authError}</span>
        )}
      </div>
    </header>
  );
}
