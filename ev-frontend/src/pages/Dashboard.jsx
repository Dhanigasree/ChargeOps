import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarRange,
  CreditCard,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Star
} from "lucide-react";
import dashboardAccessImage from "../assets/dashboard-access.jpg";
import customerJourneyImage from "../assets/customer-journey.jpg";
import loginImage from "../assets/auth-login.jpg";
import Card from "../components/Card.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { adminApi, bookingApi, stationApi } from "../services/api.js";

const serviceHighlights = [
  {
    icon: MapPinned,
    title: "Find trusted EV stations",
    description: "Browse locations and pick the right charger."
  },
  {
    icon: CalendarRange,
    title: "Book slots ahead of time",
    description: "Reserve before you arrive."
  },
  {
    icon: CreditCard,
    title: "Pay in one secure flow",
    description: "Pay quickly in one place."
  },
  {
    icon: Star,
    title: "Review real experiences",
    description: "See ratings from other drivers."
  }
];

const customerBenefits = [
  "Search by location, charger type, and price.",
  "Book ahead and skip the wait.",
  "Track bookings in one place.",
  "Manage your profile easily."
];

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showIntroLoader, setShowIntroLoader] = useState(Boolean(location.state?.justAuthenticated));
  const [metricProgress, setMetricProgress] = useState(0);
  const [summaryTargets, setSummaryTargets] = useState({
    stations: 0,
    bookings: 0,
    payments: 100
  });

  useEffect(() => {
    if (!location.state?.justAuthenticated) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowIntroLoader(false);
      navigate(location.pathname, { replace: true, state: {} });
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const loadSummaryData = async () => {
      try {
        if (user?.role === "admin") {
          const [{ data: analyticsData }, { data: stationsData }] = await Promise.all([
            adminApi.analytics(),
            stationApi.list()
          ]);

          setSummaryTargets({
            stations: stationsData.data?.length || 0,
            bookings: analyticsData.data?.totalBookings || 0,
            payments: analyticsData.data?.successfulPayments
              ? Math.min(100, Math.round((analyticsData.data.successfulPayments / Math.max(analyticsData.data.totalBookings, 1)) * 100))
              : 100
          });
          return;
        }

        const [{ data: stationsData }, { data: bookingsData }] = await Promise.all([
          stationApi.list({ isApproved: true }),
          bookingApi.mine()
        ]);

        const bookings = bookingsData.data || [];
        const paidBookings = bookings.filter((entry) => entry.paymentStatus === "paid").length;

        setSummaryTargets({
          stations: stationsData.data?.length || 0,
          bookings: bookings.length || 0,
          payments: bookings.length ? Math.round((paidBookings / bookings.length) * 100) : 100
        });
      } catch {
        setSummaryTargets({
          stations: 0,
          bookings: 0,
          payments: 100
        });
      }
    };

    loadSummaryData();
  }, [user?.role]);

  useEffect(() => {
    if (showIntroLoader) {
      return;
    }

    setMetricProgress(0);
    const start = performance.now();
    let frameId = 0;

    const animate = (time) => {
      const progress = Math.min((time - start) / 1400, 1);
      setMetricProgress(progress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [showIntroLoader]);

  const animatedSummaryCards = useMemo(
    () => [
      {
        title: "Nearby Stations",
        value: `${Math.round(summaryTargets.stations * metricProgress)}+`,
        caption: "Fast chargers near your route."
      },
      {
        title: "Instant Bookings",
        value: `${Math.round(summaryTargets.bookings * metricProgress)}`,
        caption: "Reserve a slot in seconds."
      },
      {
        title: "Secure Payments",
        value: `${Math.round(summaryTargets.payments * metricProgress)}%`,
        caption: "Safe and simple checkout."
      }
    ],
    [metricProgress, summaryTargets]
  );

  if (showIntroLoader) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-800 via-violet-700 to-amber-400 shadow-xl shadow-violet-950/40">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-amber-300/80">Preparing Your Space</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Loading your ChargeOps experience...</h2>
          <p className="mt-3 text-sm text-slate-300">Stations, bookings, and customer services are getting ready.</p>
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full animate-pulse bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar />

      <div className="flex-1 space-y-6">
        <Card className="overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">Customer Home</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight text-white">
                Welcome, {user?.name?.split(" ")[0] || "Driver"}. Power your journey from one place.
              </h2>
              <p className="mt-4 max-w-2xl text-base text-slate-300">Find stations, book faster, and charge without hassle.</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                  <BadgeCheck size={16} />
                  Trusted stations
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
                  <ShieldCheck size={16} />
                  Secure payments
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
                  <Sparkles size={16} />
                  Smooth bookings
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {customerBenefits.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-sm leading-6 text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-blue-900/50 via-violet-900/40 to-amber-400/15 p-6">
              <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/30">
                <img src={dashboardAccessImage} alt="Modern EV charging station" className="h-48 w-full object-cover" />
              </div>
              <p className="mt-4 text-sm text-slate-300">Your ChargeOps access</p>
              <p className="mt-2 text-2xl font-semibold capitalize text-white">{user?.role || "customer"}</p>
              <p className="mt-4 text-sm leading-6 text-slate-300">You are ready to explore, book, and charge.</p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-4">
                  <p className="text-sm text-slate-400">Next best action</p>
                  <p className="mt-1 text-lg font-semibold text-white">Explore nearby stations</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-4">
                  <p className="text-sm text-slate-400">Profile status</p>
                  <p className="mt-1 break-all text-lg font-semibold text-white">{user?.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/stations")}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Explore Services
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Card>

        <section className="grid gap-6 md:grid-cols-3">
          {animatedSummaryCards.map((item, index) => (
            <Card
              key={item.title}
              title={item.title}
              className="transition duration-700"
            >
              <div
                className="space-y-3 transition duration-700"
                style={{
                  opacity: Math.max(0.25, Math.min(1, metricProgress * 1.2 - index * 0.12)),
                  transform: `translateY(${Math.max(0, 18 - metricProgress * 18 - index * 2)}px)`
                }}
              >
                <p className="text-3xl font-semibold text-white">{item.value}</p>
                <p className="text-sm leading-6 text-slate-300">{item.caption}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card title="What you can do here" subtitle="Customer Services">
            <div className="grid gap-4 sm:grid-cols-2">
              {serviceHighlights.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-800 via-violet-700 to-amber-400 text-white">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Customer Journey" subtitle="How It Works">
            <div className="mb-4 overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/30">
              <img
                src={customerJourneyImage}
                alt="Electric vehicle charging at a modern station"
                className="h-36 w-full object-cover object-[center_68%] sm:h-40"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(event) => {
                  event.currentTarget.src = loginImage;
                }}
              />
            </div>
            <div className="space-y-4">
              {["Search stations near you.", "Book a time that works.", "Pay securely.", "Review after charging."].map(
                (step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-800 via-violet-700 to-amber-400 text-sm font-semibold text-white">
                      0{index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-6 text-slate-300">{step}</p>
                  </div>
                )
              )}
            </div>
          </Card>
        </section>

        <Card title="Built for EV customers" subtitle="Why ChargeOps">
          <div className="grid gap-4 md:grid-cols-3">
            {["Easy station discovery.", "Fast booking flow.", "Reliable experience on every device."].map((point) => (
              <div key={point} className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/25 p-5">
                <p className="text-sm leading-6 text-slate-300">{point}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:hidden">
          <Card title="Quick Navigation" subtitle="Mobile Friendly">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Home", hint: "Overview and services" },
                { label: "Stations", hint: "Discover charging locations" },
                { label: "Bookings", hint: "Track active reservations" },
                { label: "Profile", hint: "Manage account details" }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4">
                  <p className="text-base font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.hint}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
