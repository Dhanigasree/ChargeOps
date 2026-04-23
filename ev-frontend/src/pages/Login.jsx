import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import loginImage from "../assets/auth-login.jpg";
import AuthShell from "../components/AuthShell.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(formData);
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true, state: { justAuthenticated: true } });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in to your operations workspace."
      imageUrl={loginImage}
      imageAlt="Real electric car being connected to an EV charging station"
      imageCredit="Photo source: Pexels"
      footer={
        <p className="text-sm text-slate-300">
          New to ChargeOps?{" "}
          <Link to="/register" className="font-semibold text-amber-300 transition hover:text-amber-200">
            Create an account
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Work Email</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@chargeops.com"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-slate-950/70"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-slate-950/70"
            required
          />
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-950/40 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Loader label="Signing in..." /> : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
