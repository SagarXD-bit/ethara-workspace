export default function StatCard({ label, value, tone = "sky" }) {
  const toneClass = {
    sky: "from-sky-400/25 to-sky-500/5 text-sky-100",
    teal: "from-teal-400/25 to-teal-500/5 text-teal-100",
    orange: "from-orange-400/25 to-orange-500/5 text-orange-100",
    slate: "from-slate-100/10 to-transparent text-slate-100"
  };

  return (
    <div className={`panel bg-gradient-to-br ${toneClass[tone]} p-5`}>
      <div className="text-sm uppercase tracking-[0.22em] text-slate-300">{label}</div>
      <div className="mt-4 text-4xl font-semibold">{value}</div>
    </div>
  );
}
