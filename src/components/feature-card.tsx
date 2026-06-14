interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-emerald-900/40 dark:bg-slate-900/80">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-2xl text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}
