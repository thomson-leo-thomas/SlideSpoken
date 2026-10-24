"use client";

export interface LanguageOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label: string;
  value: T;
  options: readonly LanguageOption<T>[];
  onChange: (value: T) => void;
}

export function LanguageSelector<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-white/45">{label}</span>
      <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-sm transition ${
                active ? "bg-white/15 font-semibold text-white shadow-sm" : "text-white/55 hover:text-white"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
