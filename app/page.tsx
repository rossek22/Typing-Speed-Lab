"use client";

import { motion } from "framer-motion";
import TypingTest from "./components/TypingTest";

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6 sm:p-10">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold tracking-tight mb-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        Typing <span className="text-orange-400">Speed</span> Lab
      </motion.h1>

      <p className="text-neutral-400 mb-8">
        WPM = words per minute (слов в минуту). Нажми “Сгенерировать” и начни
        печатать. <br />
        <br />
        P.S - Генерация может занять некоторое время, не пугайтесь. Если долго
        не просиходит генерация. <br />
        ИИ иногда может ошибатся в колчестве слов.
      </p>

      <TypingTest />
    </main>
  );
}
