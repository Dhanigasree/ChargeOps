import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import customerJourneyImage from "../assets/customer-journey.jpg";
import AuthShell from "../components/AuthShell.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer"
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
      await register(formData);
      navigate("/dashboard", { replace: true, state: { justAuthenticated: true } });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to create your account right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create Workspace Access"
      title="Launch your EV operations account."
      imageUrl={customerJourneyImage}
      imageAlt="Real electric vehicles charging at a modern EV station"
      imageCredit="Photo source: Pexels"
      footer={
        <p className="text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-amber-300 transition hover:text-amber-200">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-200">Full Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Alex Morgan"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-slate-950/70"
            required
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-200">Email Address</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="operator@chargeops.com"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-slate-950/70"
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
            placeholder="Minimum 8 characters"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-slate-950/70"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Phone</span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-slate-950/70"
            required
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-200">Role</span>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-amber-300/40 focus:bg-slate-950/70"
          >
            <option value="customer">Customer</option>
            <option value="station">Station Owner</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {errorMessage ? (
          <div className="sm:col-span-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="sm:col-span-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-950/40 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Loader label="Creating account..." /> : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;
