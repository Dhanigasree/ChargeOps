import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navLinkClasses = "rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white";

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-800 via-violet-700 to-amber-400 text-sm font-black text-white shadow-lg shadow-violet-900/40">
            CO
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">Enterprise EV</p>
            <h1 className="text-lg font-semibold text-white">ChargeOps</h1>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right sm:block">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-white">{user?.name || user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:scale-[1.02]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLinkClasses}>
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:scale-[1.02]"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
