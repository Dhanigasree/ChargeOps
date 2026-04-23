const Loader = ({ label = "Loading..." }) => {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300/40 border-t-amber-300" />
      <span>{label}</span>
    </div>
  );
};

export default Loader;
