import { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { userApi } from "../services/api.js";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const { data } = await userApi.me();
      setProfile(data.data);
      setForm({
        name: data.data?.name || "",
        phone: data.data?.phone || ""
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const submitProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    try {
      await userApi.updateMe(form);
      await refreshUser();
      setMessage("Profile updated successfully.");
      loadProfile();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to update profile.");
    }
  };

  return (
    <main className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar />

      <div className="flex-1 space-y-6">
        <Card title="Profile" subtitle="Account Details">
          {isLoading ? <Loader label="Loading profile..." /> : null}

          {profile ? (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-2 text-lg font-semibold text-white">{profile.email}</p>
                <p className="mt-4 text-sm text-slate-400">Role</p>
                <p className="mt-2 text-lg font-semibold capitalize text-white">{profile.role}</p>
                <p className="mt-4 text-sm text-slate-400">Joined</p>
                <p className="mt-2 text-lg font-semibold text-white">{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>

              <form className="space-y-4" onSubmit={submitProfile}>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white"
                />
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Phone"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white"
                />
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 px-5 py-3 text-sm font-semibold text-white"
                >
                  Save Changes
                </button>
                {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
                {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
              </form>
            </div>
          ) : null}
        </Card>

        <Card title="Signed In Account" subtitle="Session">
          <p className="text-sm text-slate-300">
            Current account: <span className="font-semibold text-white">{user?.email}</span>
          </p>
        </Card>
      </div>
    </main>
  );
};

export default Profile;
