import { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { adminApi } from "../services/api.js";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [{ data: analyticsData }, { data: usersData }, { data: bookingsData }] = await Promise.all([
          adminApi.analytics(),
          adminApi.users(),
          adminApi.bookings()
        ]);

        setAnalytics(analyticsData.data);
        setUsers(usersData.data || []);
        setBookings(bookingsData.data || []);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Unable to load admin data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  return (
    <main className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar />

      <div className="flex-1 space-y-6">
        {isLoading ? <Loader label="Loading admin dashboard..." /> : null}
        {errorMessage ? <Card><p className="text-rose-300">{errorMessage}</p></Card> : null}

        {analytics ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Users", value: analytics.totalUsers },
              { label: "Total Bookings", value: analytics.totalBookings },
              { label: "Total Revenue", value: `Rs. ${analytics.totalRevenue}` },
              { label: "Successful Payments", value: analytics.successfulPayments }
            ].map((item) => (
              <Card key={item.label} title={item.label}>
                <p className="text-3xl font-semibold text-white">{item.value}</p>
              </Card>
            ))}
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <Card title="Users" subtitle="Admin View">
            <div className="space-y-3">
              {users.slice(0, 8).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="font-semibold text-white">{entry.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{entry.email}</p>
                  <p className="mt-1 text-sm capitalize text-slate-300">{entry.role}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Bookings" subtitle="Admin View">
            <div className="space-y-3">
              {bookings.slice(0, 8).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="font-semibold text-white">{entry.stationId}</p>
                  <p className="mt-1 text-sm text-slate-400">{new Date(entry.slotTime).toLocaleString()}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {entry.status} / {entry.paymentStatus}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
