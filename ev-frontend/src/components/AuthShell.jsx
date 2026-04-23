const AuthShell = ({ eyebrow, title, description, children, footer, imageUrl, imageAlt, imageCredit }) => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden lg:h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(30,58,138,0.35),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(109,40,217,0.4),_transparent_30%),linear-gradient(135deg,_#020617,_#111827)]" />
      <div className="absolute left-[-10%] top-16 h-72 w-72 rounded-full bg-blue-700/25 blur-3xl" />
      <div className="absolute bottom-10 right-[-10%] h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-4 sm:px-6 sm:py-6 lg:h-screen lg:px-8 lg:py-6">
        <div className="grid w-full gap-6 lg:h-full lg:grid-cols-[1.08fr_0.92fr]">
          <div className="hidden h-full flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-amber-300/90">ChargeOps Platform</p>
              <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Enterprise control for modern EV charging operations.
              </h1>

              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/40">
                <div className="relative h-64 xl:h-[20rem]">
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {imageCredit ? (
                      <p className="text-xs text-slate-400">{imageCredit}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                <p className="text-sm text-slate-400">Network Uptime</p>
                <p className="mt-2 text-3xl font-semibold text-white">99.94%</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                <p className="text-sm text-slate-400">Active Stations</p>
                <p className="mt-2 text-3xl font-semibold text-white">248</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                <p className="text-sm text-slate-400">Monthly Revenue</p>
                <p className="mt-2 text-3xl font-semibold text-white">$84k</p>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col justify-center rounded-[2rem] border border-white/10 bg-white/7 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-7 lg:p-8">
            <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/40 lg:hidden">
              <div className="relative h-40">
                <img src={imageUrl} alt={imageAlt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                {imageCredit ? <p className="absolute bottom-3 left-4 text-[11px] text-slate-300/80">{imageCredit}</p> : null}
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300/90">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-[2rem]">{title}</h2>
            {description ? <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{description}</p> : null}
            <div className={description ? "mt-6" : "mt-5"}>{children}</div>
            {footer ? <div className="mt-5">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
