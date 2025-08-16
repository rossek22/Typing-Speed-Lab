"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "./StatCard";
import LanguageSelector, { LangCode, ALL_LANGS } from "./LanguageSelector";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const TIME_OPTIONS = [
  { label: "No limit", value: 0 },
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
];

export default function TypingTest() {
  const [lang, setLang] = useState<LangCode>("ru");
  const [maxWords, setMaxWords] = useState<number>(25);
  const [target, setTarget] = useState<string>(
    "Нажми «Сгенерировать», чтобы начать."
  );
  const [input, setInput] = useState<string>("");

  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [errors, setErrors] = useState<number>(0);

  const [loading, setLoading] = useState(false);

  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentIndex = input.length;

  // ===== СТАТЫ =====
  const typedChars = input.length;
  const correctChars = useMemo(() => {
    let ok = 0;
    for (let i = 0; i < input.length && i < target.length; i++) {
      if (input[i] === target[i]) ok++;
    }
    return ok;
  }, [input, target]);

  const done =
    (input.length >= target.length && target.length > 0) ||
    (timeLimit > 0 && remaining <= 0);

  const elapsedMs = startedAt ? (endedAt ?? Date.now()) - startedAt : 0;
  const elapsedMin = Math.max(0.001, elapsedMs / 60000);
  const wpm = startedAt ? Math.round(correctChars / 5 / elapsedMin) : 0;
  const accuracy = typedChars
    ? Math.round((correctChars / typedChars) * 100)
    : 0;

  // ===== ТАЙМЕР =====
  useEffect(() => {
    if (timeLimit > 0 && startedAt && !endedAt) {
      const interval = setInterval(() => {
        const left = timeLimit - Math.floor((Date.now() - startedAt) / 1000);
        setRemaining(left > 0 ? left : 0);
        if (left <= 0) setEndedAt(Date.now());
      }, 250);
      return () => clearInterval(interval);
    }
  }, [timeLimit, startedAt, endedAt]);

  // ===== GENERATION =====
  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, maxWords: clamp(maxWords, 1, 1000) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setTarget(data.sentence);
      reset(true);
    } catch (e: any) {
      alert(e?.message ?? "Ошибка генерации");
    } finally {
      setLoading(false);
    }
  }

  function reset(keepText = false) {
    setInput("");
    setStartedAt(null);
    setEndedAt(null);
    setErrors(0);
    if (!keepText) setTarget("Нажми «Сгенерировать», чтобы начать.");
    if (timeLimit > 0) setRemaining(timeLimit);
    inputRef.current?.focus();
  }

  function onChange(v: string) {
    if (!startedAt) {
      setStartedAt(Date.now());
      if (timeLimit > 0) setRemaining(timeLimit);
    }
    let localErrors = 0;
    for (let i = 0; i < v.length; i++) {
      if (v[i] !== target[i]) localErrors++;
    }
    setErrors(localErrors);
    setInput(v);
  }

  return (
    <motion.div
      className="space-y-6 pt-20"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
    >
      {/* ====== STATS ====== */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <StatCard
          label="Таймер"
          value={
            timeLimit > 0
              ? `${remaining}s`
              : startedAt
              ? `${(elapsedMs / 1000).toFixed(1)}s`
              : "0.0s"
          }
        />
        <StatCard label="WPM" value={wpm} />
        <StatCard label="Аккуратность" value={`${accuracy}%`} />
        <StatCard label="Ошибки" value={errors} />
      </motion.div>

      {/* ====== SETTINGS ====== */}
      <motion.div
        className="flex flex-wrap gap-2 items-center sm:gap-3"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      >
        <Dropdown
          label="Язык"
          value={ALL_LANGS.find((l) => l.code === lang)?.label || ""}
          options={ALL_LANGS.map((l) => ({ label: l.label, value: l.code }))}
          onSelect={(v) => setLang(v as LangCode)}
        />

        <Dropdown
          label="Время"
          value={timeLimit === 0 ? "No limit" : `${timeLimit}s`}
          options={[...TIME_OPTIONS, { label: "Custom…", value: "custom" }]}
          onSelect={(v) => {
            if (v === "custom") {
              const sec = prompt("Введите время в секундах:", "120");
              if (sec) setTimeLimit(clamp(parseInt(sec), 1, 3600));
            } else {
              setTimeLimit(Number(v));
            }
          }}
        />

        <button
          onClick={generate}
          disabled={loading}
          className="sm:text-[16px] cursor-pointer text-[13px] rounded-md ml-auto px-4 py-2 bg-neutral-100 text-neutral-900 hover:bg-white transition active:scale-[.99] disabled:opacity-60"
        >
          {loading ? "Генерирую…" : "Сгенерировать"}
        </button>
      </motion.div>

      {/* ====== СЛОВА + СБРОС ====== */}
      <motion.div
        className="flex flex-wrap justify-between items-center gap-3"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      >
        <button
          onClick={() => reset(true)}
          className="rounded-md px-4 py-2 border border-neutral-800 hover:bg-neutral-900 transition"
        >
          Сброс
        </button>

        <label className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">Макс слов</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={maxWords}
            onChange={(e) =>
              setMaxWords(clamp(parseInt(e.target.value || "0"), 1, 1000))
            }
            className="w-24 bg-neutral-900/70 backdrop-blur border border-neutral-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700"
          />
        </label>
      </motion.div>

      {/* ====== TEXT FOR TYPE ====== */}
      <motion.div
        key={target}
        className="relative rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur p-5 leading-relaxed text-lg sm:text-xl tracking-wide overflow-hidden"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="relative select-none font-mono break-words">
          {target.split("").map((ch, i) => {
            const typed = input[i];
            const ok = typed === ch;
            const bad = typed && typed !== ch;
            return (
              <span
                key={i}
                id={`char-${i}`}
                className={
                  ok
                    ? "text-emerald-400"
                    : bad
                    ? "text-rose-400 underline decoration-rose-500/50"
                    : "text-neutral-300"
                }
              >
                {ch}
              </span>
            );
          })}

          {/* Floating line */}
          <AnimatePresence>
            {!done && startedAt && (
              <motion.div
                key={currentIndex}
                className="absolute h-0.5 bg-emerald-400/80 rounded-full"
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                  bottom: -4,
                  left:
                    document.getElementById(`char-${currentIndex}`)
                      ?.offsetLeft || 0,
                  width:
                    document
                      .getElementById(`char-${currentIndex}`)
                      ?.getBoundingClientRect().width || 12,
                }}
              />
            )}
          </AnimatePresence>
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Начни печатать здесь…"
          className="w-full h-28 bg-neutral-950/40 backdrop-blur border border-neutral-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-neutral-700 resize-none mt-6"
        />
      </motion.div>
    </motion.div>
  );
}

/* ==== Dropdown ==== */
function Dropdown({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: { label: string; value: any }[];
  onSelect: (v: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md px-3 py-2 bg-neutral-900/70 backdrop-blur border border-neutral-800 hover:bg-neutral-800/60 transition text-sm"
      >
        {label}: <span className="text-neutral-200">{value}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-2 w-40 rounded-md bg-neutral-900/80 backdrop-blur border border-neutral-700 shadow-lg p-1"
          >
            {options.map((o) => (
              <li
                key={o.value}
                onClick={() => {
                  onSelect(o.value);
                  setOpen(false);
                }}
                className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-neutral-800"
              >
                {o.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
