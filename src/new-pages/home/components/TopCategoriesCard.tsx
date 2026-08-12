import DashboardCard from "./DashboardCard";

type TopCategory = {
  id: string;
  name: string;
  percent: number;
};

type TopCategoriesCardProps = {
  categories: TopCategory[];
};

function CircularProgress({ percent }: { percent: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative size-14 shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 52 52">
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-100 dark:text-white/8"
          strokeWidth="5"
        />
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="url(#catGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="catGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00AEEF" />
            <stop offset="100%" stopColor="#9139C4" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-white/70">
        {percent}%
      </span>
    </div>
  );
}

const TopCategoriesCard = ({ categories }: TopCategoriesCardProps) => {
  return (
    <DashboardCard
      title="أفضل الفئات"
      className="min-h-[280px] flex-1"
      contentClassName="space-y-4"
    >
      {categories.slice(0, 4).map((category) => (
        <div key={category.id} className="flex items-center gap-3">
          <CircularProgress percent={category.percent} />
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-white/85">
            {category.name}
          </p>
        </div>
      ))}
    </DashboardCard>
  );
};

export default TopCategoriesCard;
