const LANGS = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "Английский" },
  { code: "hy", label: "Հայերեն" },
  { code: "ka", label: "ქართულად" },
  { code: "de", label: "Deutsch" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];
export const ALL_LANGS = LANGS;

export default function LanguageSelector({
  value,
  onChange,
}: {
  value: LangCode;
  onChange: (v: LangCode) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm text-neutral-400">Язык</span>
      <select
        className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700"
        value={value}
        onChange={(e) => onChange(e.target.value as LangCode)}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
