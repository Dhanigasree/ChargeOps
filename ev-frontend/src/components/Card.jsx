const Card = ({ title, subtitle, children, className = "" }) => {
  return (
    <section className={`rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl ${className}`}>
      {(title || subtitle) && (
        <header className="mb-5">
          {subtitle ? <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">{subtitle}</p> : null}
          {title ? <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3> : null}
        </header>
      )}
      {children}
    </section>
  );
};

export default Card;
