const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-medium text-slate-200">ChargeOps</p>
          <p className="mt-1">Smart EV charging experience for modern customers.</p>
        </div>

        <div className="flex flex-wrap gap-4 text-slate-300">
          <span>Stations</span>
          <span>Bookings</span>
          <span>Payments</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
