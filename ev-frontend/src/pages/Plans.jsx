import { ArrowLeft, BadgeCheck, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import plansHeroImage from "../assets/plans-hero.jpg";
import Card from "../components/Card.jsx";

const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    badge: "Essential",
    description: "A simple plan for everyday EV users.",
    features: ["Standard booking access", "Basic station discovery", "Booking history view"]
  },
  {
    name: "Prime",
    price: "$19",
    period: "/month",
    badge: "Popular",
    description: "Best for frequent charging and faster planning.",
    features: ["Priority booking windows", "Premium station suggestions", "Faster support access"],
    featured: true
  },
  {
    name: "Elite",
    price: "$39",
    period: "/month",
    badge: "Advanced",
    description: "For power users who want a premium charging experience.",
    features: ["Top priority booking", "Exclusive partner offers", "Dedicated customer assistance"]
  }
];

const Plans = () => {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-300/40 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">Explore Plans</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-white">Choose a plan that fits your charging routine.</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300">
              Pick the experience that works for your EV lifestyle, from simple daily access to premium charging benefits.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: BadgeCheck, label: "Flexible access" },
                { icon: Sparkles, label: "Premium recommendations" },
                { icon: Zap, label: "Faster booking flow" }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-800 via-violet-700 to-amber-400 text-white">
                    <Icon size={18} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-200">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/30 self-start">
            <img
              src={plansHeroImage}
              alt="Premium EV charging station offer"
              className="h-56 w-full object-cover lg:h-64"
            />
          </div>
        </div>
      </Card>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.featured
                ? "border-amber-300/30 bg-gradient-to-br from-blue-900/40 via-violet-900/40 to-amber-400/10"
                : ""
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">{plan.badge}</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{plan.name}</h2>
              </div>
              {plan.featured ? (
                <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                  Most Chosen
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex items-end gap-1">
              <span className="text-4xl font-semibold text-white">{plan.price}</span>
              <span className="pb-1 text-sm text-slate-400">{plan.period}</span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{plan.description}</p>

            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-200">
                  {feature}
                </div>
              ))}
            </div>

            <button
              type="button"
              className={`mt-6 w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
                plan.featured
                  ? "bg-gradient-to-r from-blue-800 via-violet-700 to-amber-400 text-white hover:scale-[1.01]"
                  : "border border-white/10 bg-white/5 text-slate-200 hover:border-amber-300/40 hover:text-white"
              }`}
            >
              Choose {plan.name}
            </button>
          </Card>
        ))}
      </section>
    </main>
  );
};

export default Plans;
