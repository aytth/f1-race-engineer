interface YearSelectorProps {
  selected: number;
  onChange: (year: number) => void;
}

const YEARS = [2025, 2024, 2023];

export default function YearSelector({ selected, onChange }: YearSelectorProps) {
  return (
    <div className="flex gap-2">
      {YEARS.map((year) => (
        <button
          key={year}
          onClick={() => onChange(year)}
          className={`relative px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
            selected === year
              ? 'bg-f1-red text-white shadow-[0_0_15px_rgba(225,6,0,0.3)]'
              : 'bg-f1-bg-secondary text-f1-text-secondary hover:bg-f1-bg-tertiary hover:text-f1-text border border-f1-border'
          }`}
        >
          {year}
          {selected === year && (
            <div className="absolute -bottom-px left-2 right-2 h-[2px] bg-white/50 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
